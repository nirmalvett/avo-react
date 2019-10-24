import {AvoLessonData} from '../Learn';
import {Button} from '@material-ui/core';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {AnswerInput} from '../../AnswerInput';
import React, {Fragment} from 'react';

interface QuestionScreenProps {
    question: AvoLessonData;
    answers: string[];
    changeAnswer: (index: number) => (answer: string) => void;
    back: () => void;
    next: () => void;
}

export function QuestionScreen(props: QuestionScreenProps) {
    const question = props.question;
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
                {getMathJax(question.prompt)}
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
