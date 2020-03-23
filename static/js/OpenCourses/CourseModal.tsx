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
    return (
        <div
            style={{
                display: props.modalDisplay,
                zIndex: 900001,
            }}
            id='avo_open_course_selected_modal'
        >
            <div style={styles.modalBackdrop}/>
            <Paper style={styles.modalBody} className='avo-card'>
                <IconButton
                    onClick={props.hideModal}
                    style={{position: 'absolute', top: '9px', right: '9px'}}
                    id='open_course_selected_close'
                >
                    <Close/>
                </IconButton>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{flex: 1}}>
                        <Typography variant={'h3'}>{props.course.courseName}</Typography>
                        <br/>
                        <Typography variant={'h5'}>Sections:</Typography>
                        {
                            props.course.sections.length > 0 && props.course.sections.map((section: any) => (
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <Typography style={{marginRight: 25, marginTop: 5}}>
                                        {`${section.name}`}
                                    </Typography>
                                    {
                                        section.enrolled && (
                                            <div style={{marginTop: 5}}>
                                                <Typography>Already enrolled</Typography>
                                            </div>
                                        ) || <Button
                                                style={{borderRadius: '2.5em'}}
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => props.enroll(section)}
                                             >
                                                Enroll
                                             </Button>
                                    }
                                </div>
                            )) || <Typography>
                                    No sections
                                  </Typography>
                        }
                    </div>
                    <div style={{flex: 1}}>
                        <Typography>{props.course.description}</Typography>
                    </div>
                </div>
            </Paper>
        </div>
    );
}
