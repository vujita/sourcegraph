import * as React from 'react'
import { MonacoEditor } from './MonacoEditor'

export class App extends React.Component<{}, {}> {
    public render(): JSX.Element | null {
        return (
            <div>
                <h1>Management console</h1>
                <MonacoEditor ref={ref => (this.monacoEditor = ref)} />
                <button onClick={this.onSaveChanges}>Save changes</button>
            </div>
        )
    }

    private onSaveChanges = ev => {
        console.log(this.monacoEditor)
    }
}
