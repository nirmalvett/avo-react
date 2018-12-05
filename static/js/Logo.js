import React from 'react';
import { avoGreen } from "./AVOCustomColors";

export default class Logo extends React.Component {
    render() {
        let theme = this.props.theme === 'dark';
        let color1 = theme ? '#fff' : '#000';
        let color2 = theme ? '#424242' : '#fff';
        let primary = '#399103';
        let secondary = '#f8ee7b';
        let white = '#fff';
        if (this.props.color !== undefined && this.props.color !== avoGreen) { // if it's a material-UI color i.e. not avoGreen then set up colors
            primary = this.props.color['500'];
            secondary = this.props.color['200'];
        }
        return (
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1044.74 555.43' style={this.props.style}>
                <g id='AVO'>
                    <path id='A' style={{fill: color1}} d='M699.54-1119.8,837.81-835h58.65l-169.37-335-52.11.13Z'
                          transform='translate(-506.6 1267.13)'/>
                    <circle id='O' style={{fill: color2, stroke: color1, strokeWidth: '40px'}} cx='856.99' cy='264.79'
                            r='167.75'/>
                    <path id='V' style={{fill: color1}}
                          d='M1197.12-1169.87l-58.61-.21L1004.18-884.86,865.91-1169.62H807.26l169.37,335,52.11-.13Z'
                          transform='translate(-506.6 1267.13)'/>
                </g>
                <g id='Images'>
                    <path id='Green' style={{fill: primary, stroke: color2, strokeWidth: '15px'}}
                          d='M1232.67-1000.76a125.34,125.34,0,0,1,1-13c3.4-33,13.92-86.75,57.37-160.78,33-56.25,
                          49.52-84.38,70.72-85.09,26.54-.89,46.12,32.06,79.12,87.6,39.58,66.6,49.47,123.11,52.53,
                          154.17.83,8.43,1.25,12.64,1.12,17.1-1.53,52.59-48.78,130.92-130.92,130.92A130.92,130.92,
                          0,0,1,1232.67-1000.76Z'
                          transform='translate(-506.6 1267.13)'/>
                    <path id='Yellow' style={{fill: secondary}}
                          d='M1275.87-1006.33a84,84,0,0,1,.65-8.7c2.28-22.12,9.33-58.12,38.44-107.73,22.12-37.69,
                          33.18-56.53,47.38-57,17.78-.6,30.9,21.48,53,58.69,26.52,44.62,33.14,82.48,35.2,103.29a90.81,
                          90.81,0,0,1,.75,11.45c-1,35.23-32.68,87.71-87.71,87.71A87.71,87.71,0,0,1,1275.87-1006.33Z'
                          transform='translate(-506.6 1267.13)'/>
                    <circle id='circle' style={{fill: white}} cx='856.99' cy='264.46' r='42.81'/>
                </g>
                <g id='Strip'>
                    <path style={{fill: primary}} d='M565.21-834.58l63.91-136.31-52.61-.75L506.6-834.79Z'
                          transform='translate(-506.6 1267.13)'/>
                    <path style={{fill: primary}} d='M565.21-834.58l63.91-136.31-52.61-.75L506.6-834.79Z'
                          transform='translate(-506.6 1267.13)'/>
                </g>
            </svg>
        );
    }
}