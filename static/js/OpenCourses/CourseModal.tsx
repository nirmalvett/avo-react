import React from 'react';
import {IconButton, Paper, Typography, Button} from '@material-ui/core';
import {Close} from '@material-ui/icons';
import {OpenCourse, OpenCourseSection} from '../Http/';
import {Profile} from 'Http/types';
import Nameplate from '../Profiles/Nameplate';

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

export function CourseModal(props: {
    modalDisplay: string;
    hideModal: () => void;
    course: OpenCourse | undefined;
    enroll: (section: OpenCourseSection) => void;
}) {
    return (
        <div
            style={{
                display: props.modalDisplay,
                zIndex: 900001,
            }}
            id='avo_open_course_selected_modal'
        >
            <div style={styles.modalBackdrop} />
            <Paper style={styles.modalBody} className='avo-card'>
                <IconButton
                    onClick={props.hideModal}
                    style={{position: 'absolute', top: '9px', right: '9px'}}
                    id='open_course_selected_close'
                >
                    <Close />
                </IconButton>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div style={{flex: 1}}>
                        <Typography variant={'h3'}>
                            {props.course && props.course.courseName}
                        </Typography>
                        <br />
                        {props.course && <Typography variant='h5'>Contributors</Typography>}
                        {props.course && (
                            <div style={{display: 'flex'}}>
                                {props.course.contributors.map((profile: Profile) => (
                                    <Nameplate profile={profile} />
                                ))}
                            </div>
                        )}
                        <Typography variant={'h5'}>Sections:</Typography>
                        {(props.course &&
                            props.course.sections &&
                            props.course.sections.length > 0 &&
                            props.course.sections.map((section: OpenCourseSection) => (
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <Typography style={{marginRight: 25, marginTop: 5}}>
                                        {`${section.name}`}
                                    </Typography>
                                    {(section.enrolled && (
                                        <div style={{marginTop: 5}}>
                                            <Typography>Already enrolled</Typography>
                                        </div>
                                    )) || (
                                        <Button
                                            style={{borderRadius: '2.5em'}}
                                            variant='outlined'
                                            color='primary'
                                            onClick={() => props.enroll(section)}
                                        >
                                            Enroll
                                        </Button>
                                    )}
                                </div>
                            ))) || <Typography>No sections</Typography>}
                    </div>
                    <div style={{flex: 1}}>
                        <Typography>{props.course && props.course.description}</Typography>
                    </div>
                </div>
            </Paper>
        </div>
    );
}
