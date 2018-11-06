import React from  'react';
import Typography from '@material-ui/core/Typography/Typography';

export default class TimerComp extends React.Component {
    constructor(props = {}) {
        super(props);
    };

    render() {
        return (
            <Typography variant='title' id="avo-timer__anchor-el" style={{ color : 'white', marginLeft : '60vw' }}></Typography>
        );
    };

    init(target, numberofMinutes, uponCompleteFunc, ...notificationMarkers) {
        this.target              = target;
        this.numberofMinutes     = numberofMinutes;
        this.uponCompleteFunc    = uponCompleteFunc;
        this.notificationMarkers = notificationMarkers;
        document.getElementById('avo-timer__anchor-el').innerHTML = `${numberofMinutes} : 00`;
        this.startTimer();
    };

    startTimer() {
        let presentTime = document.getElementById('avo-timer__anchor-el').innerHTML;
        let timeArray = presentTime.split(/[:]+/);
        let m = timeArray[0];
        let s = this.checkSecond((timeArray[1] - 1));
        if(s==59){m=m-1}
        if(m<0){
            this.props.uponCompletionFunc();
            return;
        }
        // Parses through all the notificationMarkers and executes an associative function based on if it matches
        for(let i = 0; i < this.notificationMarkers.length; i++) {
            if(this.notificationMarkers[i][0].time == m && s == 59) {
                this.notificationMarkers[i][0].func();
            }
        }
        document.getElementById(this.target).innerHTML = m + ":" + s;
        setTimeout(this.startTimer.bind(this), 1000);
    };

    checkSecond(sec) {
        if (sec < 10 && sec >= 0) {sec = "0" + sec}; // add zero in front of numbers < 10
        if (sec < 0) {sec = "59"};
        return sec;
    };

    componentDidMount() {
        this.init('avo-timer__anchor-el', this.props.time, this.props.uponCompleteFunc);
    };
};