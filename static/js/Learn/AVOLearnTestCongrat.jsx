import React, { Component } from 'react';

export default class AVOLearnTestCongrat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			completetion : 0
		};
	};

	render() {
		const props = this.props;
		const triangles = [];
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
        let centerX         = 50;
        let centerY         = 50;
        let radius          = 18;
        let items           = [];
        for(let i = 0; i < 12; i++) {
            let x = [];
            let y = [];
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
                  	id={`learn-congrat-el@${i}`}
                />
            );
            if(i == 3 || i == 7 || i == 11) {
                triangles.push(<g style={{ transformOrigin : 'center'}} cx={centerX} cy={centerY} className={`avo-progression-gauge-triangle-group${triangles.length + 1}`}>{items}</g>);
                items = [];
            }
        }
	    console.log(triangles);
	    return (
	        <div className='avo-progression-gauge-container' style={{ transform : 'scale(1.25)' }}>
	            <svg width="400px" height="400px" viewBox="0 0 100 100" className="donut" style={{ top : '-122px' }}>
	                <circle className="donut-ring" cx="50" cy="50" r="25" fill="transparent" stroke="#fafafa" strokeWidth="0.25" strokeDasharray="0.5"></circle>
	                <circle 
	                    class="avo-progression-gauge-svg" 
	                    cx="50" 
	                    cy="50" 
	                    r="25" 
	                    fill="transparent" 
	                    stroke="#399103" 
	                    strokeWidth="0.85" 
	                    strokeDasharray={`${this.state.completetion} ${100 - this.state.completetion}`}
	                    strokeDashoffset="25"
	                    strokeLinecap='round'>
	                </circle>
	                {triangles}
                    <foreignObject x={30} y={30} width={40} height={40}>
                        <div className='avo-progression-gauge'>
                            <center className='avo-progression-gauge-text'>
                                <span className='avo-progression-gauge-subText'>Congrats!<br/>You completed<br/> the test.</span>
                            </center>
                        </div>
                    </foreignObject>
	            </svg>
	        </div>
	    );
	};

	componentDidMount() {
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
        let centerX         = 50;
        let centerY         = 50;
        let radius          = 22;
        for(let k = 0; k < 2; k++) {
        	setTimeout(() => {
        		if(!!k) radius = 19; 
        		for(let i = 0; i < 12; i++) {
					let x = [];
		            let y = [];
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
					const el = document.getElementById(`learn-congrat-el@${i}`);
					el.setAttribute('d', `M${centerX}, ${centerY} L${x[0]}, ${y[0]} L${x[1]}, ${y[1]} Z`);
				};
				currentRotation = 0;
				additionalRot = 0;
	        }, 500 * (k + 1));
       	}
       	setTimeout(() => {
			this.setState({ completetion : 100 });
       	}, 500);
	};
};