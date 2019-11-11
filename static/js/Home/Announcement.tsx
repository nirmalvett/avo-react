import {Typography} from '@material-ui/core';
import React from 'react';

interface AnnouncementProps {
    announcement: {
        header: string;
        body: string;
        selected?: boolean;
    };
}

export default function Announcement(props: AnnouncementProps) {
    return (
        <div style={props.announcement.selected ? {textDecoration: 'line-through', color: 'red'} : {}}>
            <Typography component={'span'} variant='h4' color='textPrimary'>
                {props.announcement.header}
            </Typography>
            <br />
            <Typography component={'span'} variant='body1' color='textPrimary'>
                {props.announcement.body}
            </Typography>
            <br />
        </div>
    );
}
