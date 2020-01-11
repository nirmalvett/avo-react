import {AvoLessonData} from '../Learn';
import {Button} from '@material-ui/core';
import {AnswerInput} from '../../AnswerInput';
import React, {Fragment} from 'react';
import {Content} from '../../HelperFunctions/Content';

interface QuestionScreenProps {
    question: AvoLessonData;
    answers: string[];
    changeAnswer: (index: number) => (answer: string) => void;
    back: () => void;
    next: () => void;
}

export function QuestionScreen(props: QuestionScreenProps) {
    const question = props.question;
    const showConceptGraph: HTMLElement = document.querySelector(
        '[title="Show Concept Graph"]',
    ) as HTMLElement;
    if (showConceptGraph) {
        showConceptGraph.style.right = '0';
        showConceptGraph.style.top = '3vw';
    }

    return (
        <Fragment>
            <Button
                onClick={props.back}
                variant='outlined'
                color='primary'
                style={{alignSelf: 'flex-start', left: '16px', top: '4px'}}
            >
                Go Back To Lesson
            </Button>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    overflowY: 'auto',
                    padding: '16px',
                }}
            >
                {/* Define a max width so that we can align text to the left. The MathJax Nodes force a width of 100%, not allowing for calculations based on the size of the content */}
                <div style={{maxWidth: '500px', margin: '0 auto', textAlign: 'left'}}>
                <Content>{question.prompt}</Content>
                </div>
                {question.prompts.map((p, idx) => (
                    <AnswerInput
                        type={question.types[idx]}
                        value={props.answers[idx]}
                        prompt={p}
                        onChange={props.changeAnswer(idx)}
                        save={props.changeAnswer(idx)}
                    />
                ))}
            </div>
            <Button
                onClick={props.next}
                variant='outlined'
                color='primary'
                style={{alignSelf: 'flex-end', right: '16px', bottom: '4px'}}
            >
                Submit Answer
            </Button>
        </Fragment>
    );
}