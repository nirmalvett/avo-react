import React, {Fragment} from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {getMathJax} from '../Utilities';
import {buildMathCode} from './QuestionBuilderUtils';
import AnswerInput from '../AVOAnswerInput/AnswerInput';
import ArrowBack from '@material-ui/icons/ArrowBack';


export function renderHints(currentlyEditing) {
    if (currentlyEditing === null) return (
        <Typography>
            Hints will appear here when you start editing something. We are constantly
            working to improve them, so let us know if any part of the question builder
            is unclear and we'll do our best to make it right!
        </Typography>
    );
    if (currentlyEditing === 'mainPrompt') return (
        <Typography>
            Here is where you can enter the main prompt for your question. It will
            appear before all the answer fields, and be the most heavily emphasized.
            <ol>
                <li>\(1+1\) is an inline equation.</li>
                <li>\[1+1\] is a block equation.</li>
                <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
            </ol>
        </Typography>
    );
    if (currentlyEditing.startsWith('prompt')) return (
        <Typography>
            Here is where you can customize the answer fields for your question.
            Just choose an answer type, and then enter a prompt. For multiple choice
            questions, put the prompt on the first line, and each consecutive answer
            on its own line.
            <ol>
                <li>\(1+1\) is an inline equation.</li>
                <li>\[1+1\] is a block equation.</li>
                <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
            </ol>
        </Typography>
    );
    if (currentlyEditing === 'math') return (
        <Typography>
            Here, you can create all the variables you need to generate and mark your question.
            The way it works is that each line is its own formula, and the question will
            accumulate a list of variables that can be used anywhere.
            <ol>
                <li>$1 is the result of the first expression.</li>
                <li>@1 is the student's answer to the first part.</li>
            </ol>
            See the documentation tab in the sidebar for the list of available
            operators and functions.
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

    let steps = state.editorMath.split('\n');
    steps = steps.map(x => {
        let result = /([^#]+)(?:#(.*))?/.exec(x);
        // noinspection JSValidateTypes
        if (result === null)
            return <Typography color='error'>{x}</Typography>;
        if (result[2] === undefined)
            return getMathJax('\\(\\small ' + buildMathCode(result[1])[2] + "\\)");
        return getMathJax('\\(\\small ' + buildMathCode(result[1])[2]
            + "\\color{grey}{\\text{ # " + result[2] + "}}\\)");
    });

    return (
        <Grid container spacing={8} style={{flex: 1, margin: 0}}>
            <Grid item xs={8} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                <Card style={cardStyle}>
                    <Typography variant='title' style={{marginTop: 10, marginBottom: 10}}>Math</Typography>
                    {steps}
                    <Divider style={dividerStyle}/>
                    {state.preview.variables.map(
                        (x, y) => getMathJax('\\($' + (y+1) + '=' + x + '\\)')
                    )}
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
            </Grid>
            <Grid item xs={4} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                <Card style={{flex: 1, margin: '8%', padding: 20}}>
                    <Typography>
                        This is preview mode! It lets you see the contents of all the variables
                        you set, as well as what all the prompts and explanations will look like
                        when students see them. If you ever get lost using the question builder,
                        just click the preview button to come back here and see what your changes
                        are doing!
                    </Typography>
                </Card>
            </Grid>
        </Grid>
    );
}