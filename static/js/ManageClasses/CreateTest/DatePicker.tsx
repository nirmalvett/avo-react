import React, {Fragment} from 'react';
import {FormControlLabel, Switch} from '@material-ui/core';
import {DateTimePicker, MaterialUiPickersDate} from '@material-ui/pickers';

interface DatePickerProps {
    time: Date | null;
    label1: string;
    label2: string;
    showHide: (x: Date | null) => void;
    onChange: (e: MaterialUiPickersDate) => void;
}

export function DatePicker({time, label1, label2, showHide, onChange}: DatePickerProps) {
    const show = time !== null;
    return (
        <Fragment>
            <FormControlLabel
                control={
                    <Switch
                        checked={show}
                        color='primary'
                        onChange={() => showHide(show ? null : new Date())}
                    />
                }
                label={label1}
            />
            {show && (
                <DateTimePicker
                    margin='normal'
                    style={{width: '32ch', margin: '2%'}}
                    label={label2}
                    value={time}
                    onChange={onChange}
                    variant='inline'
                />
            )}
        </Fragment>
    );
}
