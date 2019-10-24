import {AvoLessonData} from '../Learn';
import {Button, Grid, Grow} from '@material-ui/core';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {AnswerInput} from '../../AnswerInput';
import React from 'react';

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
        <Grow in={true} timeout={{enter: 1000}}>
            <Grid container spacing={8}>
                <Grid item xs={1} />
                <Grid item xs={10} style={{position: 'relative'}}>
                    <div
                        style={{
                            position: 'absolute',
                            transition: 'transform 1s ease-in, opacity 500ms ease-in',
                            willChange: 'transform',
                            width: '100%',
                            marginTop: '5em',
                        }}
                    >
                        <div style={{textAlign: 'center'}}>
                            {getMathJax(question.prompt)}
                            {question.prompts.map((p, idx) => (
                                <>
                                    <br />
                                    <br />
                                    <div style={{textAlign: 'center'}}>
                                        <AnswerInput
                                            type={question.types[idx]}
                                            value={props.answers[idx]}
                                            prompt={p}
                                            onChange={props.changeAnswer(idx)}
                                            save={props.changeAnswer(idx)}
                                        />
                                    </div>
                                </>
                            ))}
                        </div>
                        <div style={{position: 'absolute', right: '4px', bottom: '4px'}}>
                            <Button onClick={props.next} variant='outlined' color='primary'>
                                Submit Answer
                            </Button>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={1} />
                <div style={{position: 'absolute', left: '4px', top: '4px'}}>
                    <Button onClick={props.back} variant='outlined' color='primary'>
                        Go Back To Lesson
                    </Button>
                </div>
            </Grid>
        </Grow>
    );
}
