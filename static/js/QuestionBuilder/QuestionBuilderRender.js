import React, {Fragment} from 'react';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import {getMathJax} from '../Utilities';
import AnswerInput from '../AVOAnswerInput/AnswerInput';


export function renderHints(currentlyEditing) {
    if (currentlyEditing === null) return (
        <Typography>
            Hints will appear here when you start editing something. We are constantly
            working to improve them, so let us know if any part of the question builder
            is unclear and we'll do our best to make it right!
        </Typography>
    );
    if (currentlyEditing === 'mainPrompt') return (
        <Typography component='span'>
            <p>
                Here is where you can enter the main prompt for your question. It will
                appear before all the answer fields, and be the most heavily emphasized.
            </p>
            <ol>
                <li>\(1+1\) is an inline equation. (ctrl+d to insert)</li>
                <li>\[1+1\] is a block equation. (ctrl+e to insert)</li>
                <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
            </ol>
        </Typography>
    );
    if (currentlyEditing.startsWith('prompt')) return (
        <Typography component='span'>
            <p>
                Here is where you can customize the answer fields for your question.
                Just choose an answer type, and then enter a prompt. For multiple choice
                questions, put the prompt on the first line, and each consecutive answer
                on its own line.
            </p>
            <ol>
                <li>\(1+1\) is an inline equation. (ctrl+d to insert)</li>
                <li>\[1+1\] is a block equation. (ctrl+e to insert)</li>
                <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
            </ol>
        </Typography>
    );
    if (currentlyEditing === 'math') return (
        <Typography component='span'>
            <p>
                Here, you can create all the variables you need to generate and mark your question.
                The way it works is that each line is its own formula, and the question will
                accumulate a list of variables that can be used anywhere.
            </p>
            <ol>
                <li>$1 is the result of the first expression.</li>
                <li>@1 is the student's answer to the first part.</li>
            </ol>
            <p>
                See the documentation tab in the sidebar for the list of available operators and functions.
            </p>
        </Typography>
    );
    if (currentlyEditing.startsWith('criteria')) return (
        <Typography>
            Here, you can set the criteria the question will use to mark students' responses.
            The number of points a part is worth can be any number from 0.01 to 99.99, and
            the criteria expression works the same as any other math expression in the builder.
            If you need to mark a true or false question, look at the documentation on the
            tf and mc functions.
            <br/><br/>
            If you want, you can include an additional explanation for how to do the question.
            This follows the same formatting rules as the prompts.
        </Typography>
    );
}

export function Preview(props) {
    let {state} = props;
    let cardStyle = {margin: 8, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10};
    let dividerStyle = {marginTop: 15, marginBottom: 15};
    console.log(state.preview.variables);

    let varList = [];
    for(let v in state.preview.variables) if (state.preview.variables.hasOwnProperty(v))
        varList.push([v, state.preview.variables[v]]);

    return (
        <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
            <div style={{flex: 8, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                <Card style={cardStyle}>
                    <Typography variant='title' style={{marginTop: 10, marginBottom: 10}}>Math</Typography>
                    {state.editorMath.map(x => x.comment === ''
                        ? getMathJax('\\(\\small ' + x.LaTeX + "\\)")
                        : getMathJax('\\(\\small ' + x.LaTeX + "\\color{grey}{\\text{ # " + x.comment + "}}\\)")
                    )}
                    <Divider style={dividerStyle}/>
                    {varList.map(x => getMathJax('\\(' + x[0] + '=' + x[1] + '\\)'))}
                </Card>
                <Card style={cardStyle}>
                    {getMathJax(state.preview.prompt)}
                    {state.editorPrompts.map((x, y) =>
                        <Fragment>
                            <Divider style={dividerStyle}/>
                            <AnswerInput type={x.type} disabled prompt={state.preview.prompts[y]}/>
                        </Fragment>
                    )}
                </Card>
                <Card style={cardStyle}>
                    {state.editorCriteria.map((x, y) =>
                        <Fragment>
                            {y > 0 ? <Divider style={dividerStyle}/> : null}
                            {getMathJax(state.preview.explanation[y])}
                        </Fragment>
                    )}
                </Card>
            </div>
            <div style={{flex: 4, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                <Card style={{flex: 1, margin: '8%', padding: 20}}>
                    <Typography>
                        This is preview mode! It lets you see the contents of all the variables
                        you set, as well as what all the prompts and explanations will look like
                        when students see them. If you ever get lost using the question builder,
                        just click the preview button to come back here and see what your changes
                        are doing!
                    </Typography>
                </Card>
            </div>
        </div>
    );
}
