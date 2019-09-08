import React, {ReactElement} from 'react';
import {Typography} from '@material-ui/core';
import {QuestionBuilderMode} from '../QuestionBuilder.models';

export function Hints(props: {mode: QuestionBuilderMode}): ReactElement | null {
    switch (props.mode.name) {
        case null:
            return (
                <Typography>
                    Hints will appear here when you start editing something. We are constantly
                    working to improve them, so let us know if any part of the question builder is
                    unclear and we'll do our best to make it right!
                </Typography>
            );
        case 'mainPrompt':
            return (
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
        case 'prompt':
            return (
                <Typography component='span'>
                    <p>
                        Here is where you can customize the answer fields for your question. Just
                        choose an answer type, and then enter a prompt. For multiple choice
                        questions, put the prompt on the first line, and each consecutive answer on
                        its own line.
                    </p>
                    <ol>
                        <li>\(1+1\) is an inline equation. (ctrl+d to insert)</li>
                        <li>\[1+1\] is a block equation. (ctrl+e to insert)</li>
                        <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
                    </ol>
                </Typography>
            );
        case 'math':
            return (
                <Typography component='span'>
                    <p>
                        Here, you can create all the variables you need to generate and mark your
                        question. The way it works is that each line is its own formula, and the
                        question will accumulate a list of variables that can be used anywhere.
                    </p>
                    <ol>
                        <li>$1 is the result of the first expression.</li>
                        <li>@1 is the student's answer to the first part.</li>
                    </ol>
                    <p>
                        See the documentation tab in the sidebar for the list of available operators
                        and functions.
                    </p>
                </Typography>
            );
        case 'criteria':
            return (
                <Typography>
                    Here, you can set the criteria the question will use to mark students'
                    responses. The number of points a part is worth can be any number from 0.01 to
                    99.99, and the criteria expression works the same as any other math expression
                    in the builder. If you need to mark a true or false question, look at the
                    documentation on the tf and mc functions.
                    <br />
                    <br />
                    If you want, you can include an additional explanation for how to do the
                    question. This follows the same formatting rules as the prompts.
                </Typography>
            );
        case 'preview':
            return null;
    }
}
