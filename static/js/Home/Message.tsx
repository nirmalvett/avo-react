import {Typography} from '@material-ui/core';
import React from 'react';

interface MessageProps {
    message: {
        title: string;
        body: string;
        selected?: boolean;
    };
}

export default function Message(props: MessageProps) {
    return (
        <div style={props.message.selected ? {textDecoration: 'line-through', color: 'red'} : {}}>
            <Typography component={'span'} variant='h4' color='textPrimary'>
                {props.message.title}
            </Typography>
            <Typography component={'span'} variant='body1' color='textPrimary'>
                {props.message.body}
            </Typography>
            <br />
        </div>
    );
}
