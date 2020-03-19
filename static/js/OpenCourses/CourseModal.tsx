import React from 'react';
import {IconButton, Paper, Typography, Button} from '@material-ui/core';
import {Close} from '@material-ui/icons';

const styles = {
    modalBackdrop: {
        position: 'fixed' as 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 900000,
    },
    modalBody: {
        position: 'fixed' as 'fixed',
        top: '3em',
        bottom: '3em',
        right: '20%',
        left: '20%',
        width: '50%',
        height: '45vh',
        padding: '2em 3em',
        borderRadius: '9px',
        overflow: 'auto',
        zIndex: 900002,
    },
    modalClose: {
        cursor: 'pointer',
    },
};

export function CourseModal(props: any) {
    if (!props.course)
        return <div></div>
    return (
        <div
            style={{
                display: props.modalDisplay,
                zIndex: 900001,
            }}
            id='avo_learn_post_lesson_modal'
        >
            <div style={styles.modalBackdrop}/>
            <Paper style={styles.modalBody} className='avo-card'>
                <IconButton
                    onClick={props.hideModal}
                    style={{position: 'absolute', top: '9px', right: '9px'}}
                    id='post_test_close'
                >
                    <Close/>
                </IconButton>
                <Typography variant={'h1'}>{props.course.courseName}</Typography>
                <br/>
                <Typography variant={'h5'}>Sections:</Typography>
                {
                    props.course.sections.length > 0 && props.course.sections.map((section: any) => (
                        <div>
                            <Typography>
                                {`${section.name}: ${section.enrollKey}`}
                            </Typography>
                            <Button>Enroll</Button>
                            <br/>
                        </div>

                    ))
                }
                {
                    props.course.sections.length === 0 && (
                        <Typography>
                            No sections
                        </Typography>
                    )
                }
            </Paper>
        </div>
    );
}
