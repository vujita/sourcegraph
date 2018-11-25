import { BehaviorSubject, from, Subscription } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import { ContextValues } from 'sourcegraph'
import { getScriptURLFromExtensionManifest } from '../../extensions/extension'
import {
    ConfigurationUpdateParams,
    MessageActionItem,
    ShowInputParams,
    ShowMessageParams,
    ShowMessageRequestParams,
} from '../protocol'
import { Connection } from '../protocol/jsonrpc2/connection'
import { Tracer } from '../protocol/jsonrpc2/trace'
import { ClientCodeEditor } from './api/codeEditor'
import { ClientCommands } from './api/commands'
import { ClientConfiguration } from './api/configuration'
import { ClientContext } from './api/context'
import { ClientDocuments } from './api/documents'
import { ClientExtensions } from './api/extensions'
import { ClientLanguageFeatures } from './api/languageFeatures'
import { ClientRoots } from './api/roots'
import { Search } from './api/search'
import { ClientViews } from './api/views'
import { ClientWindows } from './api/windows'
import { ExtensionHostClientObservables } from './client'
import { applyContextUpdate } from './context/context'
import { Environment } from './environment'
import { activeExtensions } from './providers/extensions'
import { Registries } from './registries'

export interface ExtensionHostClientConnection {
    /**
     * Sets or unsets the tracer to use for logging all of this client's messages to/from the
     * extension host.
     */
    setTracer(tracer: Tracer | null): void

    /**
     * Closes the connection to and terminates the extension host.
     */
    unsubscribe(): void
}

/**
 * An activated extension.
 */
export interface ActivatedExtension {
    /**
     * The extension's extension ID (which uniquely identifies it among all activated extensions).
     */
    id: string

    /**
     * Deactivate the extension (by calling its "deactivate" function, if any).
     */
    deactivate(): void | Promise<void>
}

export function createExtensionHostClientConnection(
    connection: Connection,
    environment: BehaviorSubject<Environment>,
    registries: Registries,
    observables: ExtensionHostClientObservables
): ExtensionHostClientConnection {
    const subscription = new Subscription()

    subscription.add(
        new ClientConfiguration(
            connection,
            environment.pipe(
                map(({ configuration }) => configuration),
                distinctUntilChanged()
            ),
            (params: ConfigurationUpdateParams) =>
                new Promise<void>(resolve => observables.configurationUpdates.next({ ...params, resolve }))
        )
    )
    subscription.add(
        new ClientContext(connection, (updates: ContextValues) =>
            // Set environment manually, not via Controller#setEnvironment, to avoid recursive setEnvironment calls
            // (when this callback is called during setEnvironment's teardown of unused clients).
            environment.next({
                ...environment.value,
                context: applyContextUpdate(environment.value.context, updates),
            })
        )
    )
    subscription.add(
        new ClientExtensions(
            connection,
            activeExtensions(environment).pipe(
                // TODO!(sqs): memoize getScriptURLForExtension
                /** Run {@link ControllerHelpers.getScriptURLForExtension} last because it is nondeterministic. */
                switchMap(extensions =>
                    from(
                        Promise.all(
                            extensions.map(x =>
                                Promise.resolve({
                                    id: x.id,
                                    // TODO!(sqs): log errors but do not throw here
                                    //
                                    // TODO!(sqs): also apply
                                    // PlatformContext.getScriptURLForExtension here for browser ext
                                    scriptURL: getScriptURLFromExtensionManifest(x),
                                })
                            )
                        )
                    )
                )
            )
        )
    )
    subscription.add(
        new ClientWindows(
            connection,
            environment.pipe(
                map(({ visibleTextDocuments }) => visibleTextDocuments),
                distinctUntilChanged()
            ),
            (params: ShowMessageParams) => observables.showMessages.next({ ...params }),
            (params: ShowMessageRequestParams) =>
                new Promise<MessageActionItem | null>(resolve => {
                    observables.showMessageRequests.next({ ...params, resolve })
                }),
            (params: ShowInputParams) =>
                new Promise<string | null>(resolve => {
                    observables.showInputs.next({ ...params, resolve })
                })
        )
    )
    subscription.add(new ClientViews(connection, registries.views))
    subscription.add(new ClientCodeEditor(connection, registries.textDocumentDecoration))
    subscription.add(
        new ClientDocuments(
            connection,
            environment.pipe(
                map(({ visibleTextDocuments }) => visibleTextDocuments),
                distinctUntilChanged()
            )
        )
    )
    subscription.add(
        new ClientLanguageFeatures(
            connection,
            registries.textDocumentHover,
            registries.textDocumentDefinition,
            registries.textDocumentTypeDefinition,
            registries.textDocumentImplementation,
            registries.textDocumentReferences
        )
    )
    subscription.add(new Search(connection, registries.queryTransformer))
    subscription.add(new ClientCommands(connection, registries.commands))
    subscription.add(
        new ClientRoots(
            connection,
            environment.pipe(
                map(({ roots }) => roots),
                distinctUntilChanged()
            )
        )
    )

    return {
        setTracer: tracer => {
            connection.trace(tracer)
        },
        unsubscribe: () => subscription.unsubscribe(),
    }
}