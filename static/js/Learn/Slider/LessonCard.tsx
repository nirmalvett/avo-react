import {AvoLesson} from '../AVOLearnComponent';
import {ButtonBase, Card, IconButton, Tooltip, Typography} from '@material-ui/core';
import {LockOpen, LockOutlined} from '@material-ui/icons';
import AVOMasteryGauge from '../MasteryGauge';
import React, {ReactElement} from 'react';
import {blueGrey, green, grey, lightGreen} from '@material-ui/core/colors';
import {ThemeObj} from '../../Models';

interface AVOLearnCardProps {
    disabled: boolean;
    lesson: AvoLesson;
    onClick: () => void;
    theme: ThemeObj;
}

export function LessonCard(props: AVOLearnCardProps) {
    const {disabled, lesson, theme, onClick} = props;
    const {title, icon} = getIcon(lesson.preparation);
    return (
        <Card
            id={`avo-lesson__card-${lesson.conceptID}`}
            className='avo-card'
            style={{
                padding: 0,
                margin: '4px',
                display: 'flex',
                position: 'relative',
                flexDirection: 'column',
                minHeight: '100%',
                width: 'calc(33.3% - 10px)',
            }}
        >
            <ButtonBase onClick={onClick} disabled={disabled} style={{height: '100%', width: '100%', position: 'absolute', zIndex: 2}}/>
            <Tooltip title={title}>
                <IconButton
                    disableRipple={true}
                    style={{
                        position: 'absolute',
                        margin: '4px',
                        left: 0,
                        top: 0,
                        zIndex: 3,
                    }}
                >
                    {icon}
                </IconButton>
            </Tooltip>
            <AVOMasteryGauge
                theme={theme}
                margin={0}
                width='80%'
                height='80%'
                comprehension={Math.floor(lesson.mastery * 100)}
            />
            <Typography
                style={{
                    position: 'absolute',
                    margin: '4px',
                    left: 0,
                    bottom: 0,
                    zIndex: 1,
                }}
                variant='subtitle1'
            >
                {lesson.name}
            </Typography>
        </Card>
    );
}

function getIcon(preparation: number): {title: string; icon: ReactElement} {
    if (preparation < 0.25) {
        return {
            title: 'You need more preparation before attempting to learn this material',
            icon: <LockOutlined style={{color: grey['500']}} />,
        };
    } else if (preparation < 0.5) {
        return {
            title: 'You should prepare more before learning this material',
            icon: <LockOutlined style={{color: blueGrey['500']}} />,
        };
    } else if (preparation < 0.75) {
        return {
            title: 'You could prepare more, but this material should be okay',
            icon: <LockOpen style={{color: lightGreen['500']}} />,
        };
    } else {
        return {
            title: 'You are ready to learn this material',
            icon: <LockOpen style={{color: green['500']}} />,
        };
    }
}
