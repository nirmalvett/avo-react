import React, {Fragment} from 'react';
import {FormControlLabel, Switch} from '@material-ui/core';
import {DateTimePicker} from '@material-ui/pickers';

interface DatePickerProps {
    time: Date | null;
    label1: string;
    onChange: (e: Date) => void;
}

export function DatePicker({time, label1, onChange}: DatePickerProps) {
    return (
        <Fragment>
            <DateTimePicker
                margin='normal'
                style={{width: '32ch', margin: '2%'}}
                label={label1}
                value={time}
                onChange={(e: any) => onChange(new Date(e._d))}
                variant='inline'
            />
        </Fragment>
    );
}
