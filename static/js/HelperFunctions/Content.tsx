import React from 'react';
import {Typography} from '@material-ui/core';
import {ThemeStyle} from '@material-ui/core/styles/createTypography';
// @ts-ignore
import {Node, Context} from 'react-mathjax2';

const getBaseUrl = () => {
    if (process.env.NODE_ENV == 'PROD') {
        return 'http://avo-cdn-app.s3.amazonaws.com';
    } else {
        return 'http://avo-cdn-dev.s3.amazonaws.com';
    }
};
const BASE_URL = getBaseUrl();

interface ContentProps {
    variant?: ThemeStyle;
    children: string;
}

export function Content(props: ContentProps) {
    let text = props.children;
    // Initialize an empty list of MathJax elements
    let result = [];
    let counter = 0;
    while (text.length) {
        const match = /\$(.+?)\$|\\\((.+?)\\\)|\$\$(.+?)\$\$|\\\[(.+?)\\]|<img>(.*?)<img>|<<(.*?)>>|\n/g.exec(
            text,
        );
        if (!match) {
            result.push(text);
            break;
        }
        result.push(text.slice(0, match.index));
        text = text.slice(match.index + match[0].length);
        if (match[0] === '\n' || match[0] === '$\\\\$') {
            // newline
            result.push(<br key={counter++ + 'nl'}/>);
        } else if (match[1]) {
            // $123$
            result.push(
                <Node inline key={counter++ + '(' + match[1]}>
                    {match[1]}
                </Node>,
            );
        } else if (match[2]) {
            // \(123\)
            result.push(
                <Node inline key={counter++ + '(' + match[2]}>
                    {match[2]}
                </Node>,
            );
        } else if (match[3]) {
            // $$123$$
            result.push(<Node key={counter++ + '[' + match[3]}>{match[3]}</Node>);
        } else if (match[4]) {
            // \[123\]
            result.push(<Node key={counter++ + '[' + match[4]}>{match[4]}</Node>);
        } else if (match[5]) {
            // <123>
            result.push(<img alt='image' src={`${BASE_URL}/${match[5]}`}/>);
        } else if (match[6]) {
            // <<123>>
            result.push(
                <iframe
                    width='400'
                    height='300'
                    src={'https://www.youtube-nocookie.com/embed/' + match[6]}
                    frameBorder='0'
                    allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                />,
            );
        }
    }
    return (
        <Context input='tex'>
            <Typography variant={props.variant}>{result}</Typography>
        </Context>
    );
}
