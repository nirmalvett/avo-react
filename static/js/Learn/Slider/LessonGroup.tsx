import React, {Fragment} from 'react';
import {LessonCard} from './LessonCard';
import {AvoLesson} from '../AVOLearnComponent';
import {ThemeObj} from '../../Models';

interface LessonGroupProps {
    groups: AvoLesson[][];
    theme: ThemeObj;
    onClick: (lesson: AvoLesson) => void;
    currentPage: number;
}

export function LessonGroup(props: LessonGroupProps) {
    return (
        <Fragment>
            {props.groups.map((group, gIndex) => {
                const slideGroup = group.map(lesson => (
                    <LessonCard
                        disabled={gIndex !== 1}
                        lesson={lesson}
                        theme={props.theme}
                        onClick={() => props.onClick(lesson)}
                    />
                ));
                return (
                    <div
                        key={'group' + (gIndex + props.currentPage)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'absolute',
                            transition: 'transform 0.5s ease-in',
                            willChange: 'transform',
                            transform: `translateX(${100 * (gIndex - 1)}%)`,
                            width: '100%',
                            height: '100%',
                            zIndex: gIndex === 1 ? 2 : 1,
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                padding: '5px 0',
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            {slideGroup.slice(0, 3)}
                        </div>
                        <div
                            style={{
                                flex: 1,
                                padding: '5px 0',
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            {slideGroup.slice(3, 6)}
                        </div>
                    </div>
                );
            })}
        </Fragment>
    );
}
