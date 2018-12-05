// Regular imports
import * as React from 'react'
import { Subject, Subscription } from 'rxjs'
import { distinctUntilChanged, map, startWith } from 'rxjs/operators'
import './MonacoEditor.scss'

// Monaco imports. These are manually specified due to Parcel / ESM (I think).
// You can find a full list of possible imports / editor features here:
//
// https://github.com/Microsoft/monaco-editor-samples/blob/master/browser-esm-parcel/src/index.js#L2-L91
//
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'

interface Props {
    /**
     * The content the editor should display.
     */
    content: string

    /**
     * The language of the content (e.g. "json").
     */
    language: string

    /**
     * Called when the user changes the content of the editor.
     * @param content the literal content of the editor
     */
    onDidContentChange(content: string): void

    /**
     * Called when the user presses the key binding for "save" (Ctrl+S/Cmd+S).
     */
    onDidSave: () => void
}

export class MonacoEditor extends React.Component<Props, {}> {
    private ref: HTMLElement | null
    private editor: monaco.editor.IStandaloneCodeEditor | null
    private model: monaco.editor.IModel | null

    private componentUpdates = new Subject<Props>()
    private subscriptions = new Subscription()
    private disposables: monaco.IDisposable[] = []

    public componentDidMount(): void {
        const componentUpdates = this.componentUpdates.pipe(startWith(this.props))

        // TODO(slimsag): I do not understand why this cast is neccessary, and there must be a good reason
        monaco.editor.onDidCreateEditor(editor => this.onDidCreateEditor(editor as monaco.editor.IStandaloneCodeEditor))
        monaco.editor.onDidCreateModel(model => this.onDidCreateModel(model))

        this.subscriptions.add(
            componentUpdates
                .pipe(
                    map(props => [props.content, props.language]),
                    distinctUntilChanged()
                )
                .subscribe(([content, language]) => {
                    if (this.model) {
                        this.model.setValue(content)
                        monaco.editor.setModelLanguage(this.model, language)
                    }
                })
        )

        // Create the actual Monaco editor.
        monaco.editor.create(this.ref, {
            lineNumbers: 'on',
            automaticLayout: true,
            minimap: { enabled: false },
            formatOnType: true,
            formatOnPaste: true,
            autoIndent: true,
            renderIndentGuides: false,
            glyphMargin: false,
            folding: false,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
            quickSuggestions: true,
            quickSuggestionsDelay: 200,
            wordWrap: 'on',
            theme: 'vs-dark',
        })

        // Register theme for the editor.
        monaco.editor.defineTheme('sourcegraph-dark', {
            base: 'vs-dark',
            inherit: true,
            colors: {
                'editor.background': '#0E121B',
                'editor.foreground': '#F2F4F8',
                'editorCursor.foreground': '#A2B0CD',
                'editor.selectionBackground': '#1C7CD650',
                'editor.selectionHighlightBackground': '#1C7CD625',
                'editor.inactiveSelectionBackground': '#1C7CD625',
            },
            rules: [],
        })
        monaco.editor.setTheme('sourcegraph-dark')
    }

    public componentWillUnmount(): void {
        // TODO(slimsag): future: does this actually teardown Monaco properly?
        this.subscriptions.unsubscribe()
        for (const disposable of this.disposables) {
            disposable.dispose()
        }
        this.ref = null
        this.editor = null
    }

    private onDidCreateEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
        this.editor = editor
    }

    private onDidCreateModel = (model: monaco.editor.IModel) => {
        this.model = model
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => this.props.onDidSave(), '')

        this.model.setValue(this.props.content)
        monaco.editor.setModelLanguage(this.model, this.props.language)

        model.onDidChangeContent(e => {
            this.props.onDidContentChange(model.getValue())
        })
    }

    public render(): JSX.Element | null {
        return <div className="monaco-editor-container" ref={ref => (this.ref = ref)} />
    }
}

// TODO(slimsag): future: This code is correct, but I do not know how to get
// proper typings imported for this. Presumably I need to pull in some .d.ts file?
;(self as any).MonacoEnvironment = {
    getWorker(moduleId: any, label: string): Worker {
        if (label === 'json') {
            return new Worker('../node_modules/monaco-editor/esm/vs/language/json/json.worker.js')
        }
        if (label === 'css') {
            return new Worker('../node_modules/monaco-editor/esm/vs/language/css/css.worker.js')
        }
        if (label === 'html') {
            return new Worker('../node_modules/monaco-editor/esm/vs/language/html/html.worker.js')
        }
        if (label === 'typescript' || label === 'javascript') {
            return new Worker('../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js')
        }
        return new Worker('../node_modules/monaco-editor/esm/vs/editor/editor.worker.js')
    },
}
