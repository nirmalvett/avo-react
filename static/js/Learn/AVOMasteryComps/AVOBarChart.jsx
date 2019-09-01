import React from 'react';

export default class AVOBarChart extends React.Component{
    constructor(props) {
        super(props);
        this.storedDataPoints = [];
        this.shouldUpdate = false;
    };

    componentDidMount() {
        console.log('I was mounted');
    };

    checkIfPointExists(i, j, value) {
        if(!!this.storedDataPoints[i] && !!this.storedDataPoints[i][j]) return value;
        this.shouldUpdate = true;
        return 100;
    }

    render() {
        const props        = this.props;
        const numPoints    = props.dataPoints.length;
        const maxStep      = (100 / numPoints) * 2;
        const barGroups    = [];
        const points       = [];
        const yAxisTooltip = [];
        const params       = [];
    
        const tooltipFollow = (event) => {
            const tooltipEL = document.getElementById('avo-bar-chart-tooltip');
            tooltipEL.style.top = event.layerY + 'px';
        };
    
        for(let i = 0; i < numPoints; i++) {
            const currentSet = props.dataPoints[i];
            const bars = [];
            const barW = (maxStep / currentSet.length) - 2;
            for(let j = 0; j < currentSet.length; j++) {
                const x1 = 15 + (i * maxStep) + (j * barW);
                const x2 = x1 + barW-1;
                const y1 = this.checkIfPointExists(i, j, 100 - currentSet[j]);
                const y2 = this.checkIfPointExists(i, j, 100);
                bars.push(<path className='avo-bar-chart-bar' d={`M${x1} ${y1} L${x1} ${y2} L${x2} ${y2} L${x2} ${y1} Z`} fill={props.colors[j]} />);
            }
            barGroups.push(<g>{bars}</g>);
            params.push(
                <foreignObject fill='rgba(0.0, 0, 0, 0.0)' x={(maxStep * i) + 15} y="-10" width={maxStep} height="150">
                    <div 
                        style={{ height: '75%', width: '100%'}} 
                        onMouseOver={() => {
                            document.getElementById(`line@${maxStep * (i)}`).style.opacity = '1';
                            const tooltipEL = document.getElementById('avo-bar-chart-tooltip');
                            tooltipEL.style.left = (
                                document.getElementById(`line@${maxStep * (i)}`).getBoundingClientRect().left - 
                                document.getElementById('avo-bar-chart-container').getBoundingClientRect().left
                            ) + 'px';
                        }}
                        onMouseMove={() => {
                            const tooltipEL = document.getElementById('avo-bar-chart-tooltip');
                            document.getElementById('avo-bar-chart-container').addEventListener('mousemove', tooltipFollow, true);
                            tooltipEL.style.opacity = '1';
                            tooltipEL.innerHTML = ``;
                            props.labels.forEach((obj, index) => {
                                tooltipEL.innerHTML += `<div style='margin-top: 4px'><span style='float: left; height: 9px; width: 9px; border-radius: 50%; background: ${props.colors[index]}; margin-top: 3px;'></span><b style='margin-left: 4px'>${obj}:</b>&nbsp;&nbsp;${currentSet[index]} <br/></div>`;
                            });
                        }}
                        onMouseLeave={() => {
                            const tooltipEL = document.getElementById('avo-bar-chart-tooltip');
                            document.getElementById(`line@${maxStep * (i)}`).style.opacity = '0';
                            document.getElementById('avo-bar-chart-container').removeEventListener('mousemove', tooltipFollow, true);
                            tooltipEL.style.opacity = '0';
                            tooltipEL.innerHTML = ``;
                        }}
                    />
                </foreignObject>
            );
            yAxisTooltip.push(<line id={`line@${maxStep * (i)}`} style={{opacity: '0', transition: 'opacity 0.1s ease-in-out'}} strokeWidth='0.5' stroke='#fafafa' x1={(15 - currentSet.length) + (maxStep * i) + (maxStep / 2)} x2={(15 - currentSet.length) + (maxStep * i) + (maxStep / 2)} y1='0' y2='100'/>);
        }
        const backLineArr = [];
        const yAxisLabels = [];
        for(let i = 0; i < 11; i++)
        {
            backLineArr.push(<line x1="15" y1={`${i * 10}`} x2="225" y2={`${i * 10}`} strokeWidth='0.5' stroke='#fafafa'/>);
            yAxisLabels.push(<foreignObject y={`${(i * 10) - 3}`} x="0" width="30" height="20"><div className='avo-linechart-text'>{100 - (i * 10)}</div></foreignObject>);
        }    
        this.storedDataPoints = props.dataPoints;
        const _this = this;
        if(this.shouldUpdate) {
            setTimeout(() => {
                _this.forceUpdate();
            }, 300)
        }
        return (
            <div id='avo-bar-chart-container' style={{position: 'relative'}}>
                <svg width="100%" height={props.height} viewBox="0 -10 225 150">
                    {backLineArr}
                    {yAxisLabels}
                    {barGroups}
                    {yAxisTooltip}
                    {params}
                </svg>
                <div id='avo-bar-chart-tooltip'>
                </div>
            </div>
        );
    };
};
