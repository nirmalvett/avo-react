import React from 'react';
import {DateTimePicker} from '@material-ui/pickers';

interface DatePickerProps {
    time: Date | null;
    label?: string;
    onChange: (e: Date) => void;
}

export function DatePicker({time, label, onChange}: DatePickerProps) {
    return (
        <DateTimePicker
            margin='normal'
            style={{width: '32ch', margin: '2%'}}
            label={label}
            value={time}
            onChange={(e: any) => onChange(new Date(e._d))}
            variant='inline'
        />
    );
}
