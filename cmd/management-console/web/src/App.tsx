import * as React from 'react'
import { MonacoEditor } from './MonacoEditor'

interface State {
    content: string
}

export class App extends React.Component<{}, State> {
    public render(): JSX.Element | null {
        return (
            <div>
                <h1>Management console</h1>
                <MonacoEditor onContentChange={this.onContentChange} />
                <button onClick={this.onSaveChanges}>Save changes</button>
            </div>
        )
    }

    private onContentChange = content => this.setState({ content })

    private onSaveChanges = ev => {
        console.log(this.state.content)
    }
}
