import React from 'react';

export default function AVOMasteryChart(props) {
    const numPoints  = props.dataPoints.length;
    const maxDataY   = props.maxDataY || 100;
    const minDataY   = props.minDataY || 0;
    const maxStep    = (100 / numPoints) * 2;
    const smoothing  = 0.185;
    const line = (pointA, pointB) => {
        const lengthX = pointB[0] - pointA[0];
        const lengthY = pointB[1] - pointA[1]
        return {    
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        }
    }
    const controlPoint = (current, previous, next, reverse) => {
        const p = previous || current;
        const n = next     || current;
        const o = line(p, n);

        const angle  = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;

        const x = current[0] + Math.cos(angle) * length;
        const y = current[1] + Math.sin(angle) * length;
        return [x, y];
    }
    const bezierCommand = (point, i, a) => {
        // start control point
        const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
        // end control point
        const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
        return `C ${cpsX},${Math.max(cpsY, 0)} ${cpeX},${Math.max(cpeY, 0)} ${point[0]},${point[1]}`;
    };
    const svgPath = (points, command) => {
        // build the d attributes by looping over the points
        const d = points.reduce((acc, point, i, a) => i === 0
          ? `M ${point[0]},${point[1]}`
          : `${acc} ${command(point, i, a)}`
        , '')
        return `${d}`
    }
    const proportion   = (225 - 15) / numPoints;
    const xAxisLabels  = [];
    const points       = [];
    const params       = [];
    const circles      = [];
    const yAxisTooltip = [];
    
    const tooltipFollow = (event) => {
        const tooltipEL = document.getElementById('avo-line-chart-tooltip');
        tooltipEL.style.top = event.layerY + 'px';
    };

    for(let index = 0; index < props.dataPoints.length; index++) {
        const dataPoint = props.dataPoints[index];
        points.push([maxStep * (index + 1), 100 - dataPoint]);
        params.push(
            <foreignObject fill='rgba(0.0, 0, 0, 0.0)' x={(proportion * index) + 15} y="-10" width={proportion} height="150">
                <div 
                    style={{ height: '75%', width: '100%'}} 
                    onMouseOver={() => {
                        document.getElementById(`line@${maxStep * (index + 1)}-${dataPoint}`).style.opacity = '1';
                        const tooltipEL = document.getElementById('avo-line-chart-tooltip');
                        tooltipEL.style.left = (
                            document.getElementById(`line@${maxStep * (index + 1)}-${dataPoint}`).getBoundingClientRect().left - 
                            document.getElementById('avo-line-chart-container').getBoundingClientRect().left  +
                            (index < props.dataPoints.length - 1 ? 0 : -125)
                        ) + 'px';
                    }}
                    onMouseMove={() => {
                        const tooltipEL = document.getElementById('avo-line-chart-tooltip');
                        document.getElementById('avo-line-chart-container').addEventListener('mousemove', tooltipFollow, true);
                        tooltipEL.style.opacity = '1';
                        tooltipEL.innerHTML = `<b>Mastery:</b> ${dataPoint}%<br/><b>Date:</b>${props.dataLabels[index]}`;
                    }}
                    onMouseLeave={() => {
                        const tooltipEL = document.getElementById('avo-line-chart-tooltip');
                        document.getElementById(`line@${maxStep * (index + 1)}-${dataPoint}`).style.opacity = '0';
                        document.getElementById('avo-line-chart-container').removeEventListener('mousemove', tooltipFollow, true);
                        tooltipEL.style.opacity = '0';
                        tooltipEL.innerHTML = ``;
                    }}
                />
            </foreignObject>
        );
        yAxisTooltip.push(<line id={`line@${maxStep * (index + 1)}-${dataPoint}`} style={{opacity: '0', transition: 'opacity 0.1s ease-in-out'}} strokeWidth='0.5' stroke='#fafafa' x1={maxStep * (index + 1)} x2={maxStep * (index + 1)} y1='0' y2='100'/>);
        {/*xAxisLabels .push(<foreignObject x={`${maxStep * (index + 1) - (maxStep / 2)}`} y="110" width="40" height="20"><center className='avo-linechart-text'>{props.dataLabels[index]}</center></foreignObject>);*/}
        circles     .push(<circle r='1.5' cx={maxStep * (index + 1)} cy={100 - dataPoint} style={{transition : 'cy 1s ease-in-out, cx 1s ease-in-out'}} fill='#399103'/>);
    }
    const backLineArr = [];
    const yAxisLabels = [];
    for(let i = 0; i < 11; i++)
    {
        backLineArr.push(<line x1="15" y1={`${i * 10}`} x2="225" y2={`${i * 10}`} strokeWidth='0.5' stroke='#fafafa'/>);
        yAxisLabels.push(<foreignObject y={`${(i * 10) - 3}`} x="0" width="30" height="20"><div className='avo-linechart-text'>{100 - (i * 10)}</div></foreignObject>);
    }
    return (
        <div id='avo-line-chart-container' style={{position: 'relative'}}>
            <svg width="100%" height={props.height} viewBox="0 -10 225 150">
                {backLineArr}
                {yAxisLabels}
                <path className='avo-svg-line-chart ' d={svgPath(points, bezierCommand)} stroke="#399103" strokeWidth='1.25' strokeLinecap='round' fill="transparent"/>
                {xAxisLabels}
                {yAxisTooltip}
                {params}
                {circles}
            </svg>
            <div id='avo-line-chart-tooltip'>

            </div>
        </div>
    );
};