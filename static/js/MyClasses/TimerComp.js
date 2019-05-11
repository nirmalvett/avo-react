import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import TimerIcon from  '@material-ui/icons/TimerOutlined';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default class Timer extends Component {
    constructor(props) {
        super(props);
        let date = new Date(this.props.deadline);
        this.month = MONTHS[date.getMonth()];
        this.day = date.getDay().toString();
        this.hour = date.getHours();
        this.minute = date.getMinutes().toString();
        if (this.minute.length === 1) this.minute = '0' + this.minute;
        this.am_pm = this.hour > 11 ? 'pm' : 'am';
        this.hour = (((this.hour + 11) % 12) + 1).toString();
        this.timeRemaining = Math.floor((new Date(this.props.deadline) - new Date())/1000);
    };

    render() {
        return (
            <Fragment>
                <div style={{ 'position' : 'absolute', 'right' : '32px' }}><TimerIcon style={{color: 'white'}}/></div>
                <Typography
                    variant='title'
                    id="avo-timer__anchor-el"
                    style={{color:'white', marginLeft:'auto', marginRight: '64'}}
                >
                    {this.getTime()}
                </Typography>
            </Fragment>
        );
    };

    getTime() {
        if (this.timeRemaining >= 60*60*24)
            return this.month + ' ' + this.day + ', ' + this.hour + ':' + this.minute + this.am_pm;
        else if (this.timeRemaining >= 60*60*4)
            return this.hour + ':' + this.minute + this.am_pm;
        let h = Math.floor(this.timeRemaining / 3600);
        let m = Math.floor(this.timeRemaining % 3600 / 60);
        let s = Math.floor(this.timeRemaining % 60);
        if (h > 0)
            return h + 'h ' + m + 'm';
        else
            return m + 'm ' + s + 's';
    }

    update() {
        let el = document.getElementById('avo-timer__anchor-el');
        if (el !== null) {
            this.timeRemaining--;
            el.innerHTML = this.getTime();
            setTimeout(this.update.bind(this), 1000);
            if (this.timeRemaining === 60*5)
                this.props.showSnackBar('info', '5 minutes left', 5000);
            if (this.timeRemaining === 0)
                this.props.onCompletionFunc();
        }
    };

    componentDidMount() {
        setTimeout(this.update.bind(this), 1000);
    };
};
