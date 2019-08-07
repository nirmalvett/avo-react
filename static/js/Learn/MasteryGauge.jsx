import React from 'react';

export default function AVOMasteryGauge(props) {
    const triangles = [];
    if(!!props.comprehension) {
        const rotate = (cx, cy, x, y, angle) => {
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return [nx, ny];
        }
        let currentRotation = 0;
        let rotationAmount  = 45;
        let additionalRot   = 0;
        let centerX         = 21;
        let centerY         = 21;
        let radius          = 11;
        let items           = [];
        for(let i = 0; i < 12; i++) {
            let x = [];
            let y = [];
            if(props.comprehension > 75)
            {
                for(let j = 0; j < 2; j++) {
                    let newPoint = rotate(
                        centerX,
                        centerY,
                        centerX + radius,
                        centerY + radius,
                        360 - ((currentRotation + (rotationAmount * j)) + additionalRot)// remember, svgs tend to be inverted, so we need to invert this
                    );
                    x.push(newPoint[0]);
                    y.push(newPoint[1]);
                    currentRotation += rotationAmount;
                }
                if(i == 3 || i == 7) {
                    additionalRot += (22.5 + (22.5/3));
                    currentRotation = 0;
                }
            }else{
                x = [centerX, centerX];
                y = [centerY, centerY];
            };
            const tri_color = !!props.colors[triangles.length] ? props.colors[triangles.length] : '#399103';
            items.push( 
                <path 
                    className='avo-progression-gauge-triangle' 
                    d={`M${centerX}, ${centerY} L${x[0]}, ${y[0]} L${x[1]}, ${y[1]} Z`} 
                    fill={tri_color} 
                    fillOpacity='0.25' 
                    stroke={tri_color} 
                    strokeWidth='0.25' 
                    strokeLinecap='round'
                />
            );
            if(i == 3 || i == 7 || i == 11) {
                triangles.push(<g style={{ transformOrigin : 'center'}} cx={centerX} cy={centerY} className={`avo-progression-gauge-triangle-group${triangles.length + 1}`}>{items}</g>);
                items = [];
            }
        }
    }
    console.log(triangles);
    return (
        <div className='avo-progression-gauge-container'>
            <svg width="12.5em" height="12.5em" viewBox="0 0 42 42" className="donut">
                <circle className="donut-ring" cx="21" cy="21" r="16" fill="transparent" stroke="#fafafa" strokeWidth="0.25" strokeDasharray="0.5"></circle>
                <circle 
                    class="avo-progression-gauge-svg" 
                    cx="21" 
                    cy="21" 
                    r="16" 
                    fill="transparent" 
                    stroke="#399103" 
                    strokeWidth="0.85" 
                    strokeDasharray={`${props.comprehension} ${100 - (props.comprehension)}`}
                    strokeDashoffset="25"
                    strokeLinecap='round'>
                </circle>
                {triangles}
            </svg>
            <center style={{ zIndex : 10, position: 'inherit' }}>
                <div className='avo-progression-gauge'>
                    <center className='avo-progression-gauge-text'>
                        {props.comprehension}%
                        <br></br>
                        <span className='avo-progression-gauge-subText'>Mastery</span>
                    </center>
                </div>
            </center>
        </div>
    );
};