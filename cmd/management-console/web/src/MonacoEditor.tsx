// Regular imports
import * as React from 'react'
import './MonacoEditor.scss'

// Monaco imports
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'

// TODO(slimsag): future: handle teardown of Monaco properly

interface Props {
    onContentChange(content: string): void
}

export class MonacoEditor extends React.Component<Props, {}> {
    private ref: HTMLElement

    public constructor(props, state) {
        super(props, state)
    }

    public componentDidMount(): void {
        monaco.editor.onDidCreateEditor(this.onDidCreateEditor)
        monaco.editor.onDidCreateModel(this.onDidCreateModel)

        monaco.editor.create(this.ref, {
            lineNumbers: 'off',
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
    }

    private onDidCreateEditor(editor: monaco.editor.ICodeEditor): void {
        editor.setValue('hmm')
    }

    private onDidCreateModel(model: monaco.editor.IModel): void {
        model.setValue(
            [
                'from banana import *',
                '',
                'class Monkey:',
                '	# Bananas the monkey can eat.',
                '	capacity = 10',
                '	def eat(self, N):',
                "		'''Make the monkey eat N bananas!'''",
                '		capacity = capacity - N*banana.size',
                '',
                '	def feeding_frenzy(self):',
                '		eat(9.25)',
                '		return "Yum yum"',
            ].join('\n')
        )
        monaco.editor.setModelLanguage(model, 'json')
        model.onDidChangeContent(e => {
            console.log(model.getValue())
            this.props.onContentChange(model.getValue())
        })
    }

    public render(): JSX.Element | null {
        return <div className="monaco-editor-container" ref={ref => (this.ref = ref)} />
    }
}

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

monaco.editor.onDidCreateEditor(codeEditor => {
    codeEditor.setValue('hmm')
})

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
