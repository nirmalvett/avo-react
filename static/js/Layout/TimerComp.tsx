import React, {PureComponent, Fragment} from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import TimerIcon from '@material-ui/icons/TimerOutlined';
import {SnackbarVariant} from './Layout';

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

interface TimerProps {
    showSnackBar: (variant: SnackbarVariant, message: string, hideDuration: number) => void;
    deadline: number;
    onCompletionFunc: () => void;
}

export default class Timer extends PureComponent<TimerProps> {
    month: string;
    day: string;
    hour: string;
    minute: string;
    am_pm: 'am' | 'pm';
    timeRemaining: number;

    constructor(props: TimerProps) {
        super(props);
        const date = new Date(this.props.deadline);
        this.month = MONTHS[date.getMonth()];
        this.day = date.getDay().toString();
        this.minute = date.getMinutes().toString();
        if (this.minute.length === 1) this.minute = '0' + this.minute;
        this.am_pm = date.getHours() > 11 ? 'pm' : 'am';
        this.hour = (((date.getHours() + 11) % 12) + 1).toString();
        this.timeRemaining = Math.floor(
            (Number(new Date(this.props.deadline)) - Number(new Date())) / 1000,
        );
    }

    componentDidMount() {
        setTimeout(this.update.bind(this), 1000);
    }

    render() {
        return (
            <Fragment>
                <div style={{position: 'absolute', right: '32px'}}>
                    <TimerIcon style={{color: 'white'}} />
                </div>
                <Typography
                    variant='h6'
                    id='avo-timer__anchor-el'
                    style={{color: 'white', marginLeft: 'auto', marginRight: '64'}}
                >
                    {this.getTime()}
                </Typography>
            </Fragment>
        );
    }

    getTime() {
        if (this.timeRemaining >= 60 * 60 * 24) {
            return this.month + ' ' + this.day + ', ' + this.hour + ':' + this.minute + this.am_pm;
        } else if (this.timeRemaining >= 60 * 60 * 4) {
            return this.hour + ':' + this.minute + this.am_pm;
        } else {
            const h = Math.floor(this.timeRemaining / 3600);
            const m = Math.floor((this.timeRemaining % 3600) / 60);
            const s = Math.floor(this.timeRemaining % 60);
            if (h > 0) {
                return `${h}h ${m}m`;
            } else {
                return `${m}m ${s}s`;
            }
        }
    }

    update() {
        const el = document.getElementById('avo-timer__anchor-el');
        if (el !== null) {
            this.timeRemaining--;
            el.innerHTML = this.getTime();
            if (this.timeRemaining === 0) {
                this.props.onCompletionFunc();
            } else {
                if (this.timeRemaining === 60 * 5) {
                    this.props.showSnackBar('info', '5 minutes left', 5000);
                }
                setTimeout(this.update.bind(this), 1000);
            }
        }
    }
}
