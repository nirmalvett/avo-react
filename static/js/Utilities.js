import React from "react";
import MathJax from "react-mathjax2";
import Typography from "@material-ui/core/Typography/Typography";

export function getMathJax(text, variant) {
    let result = [];
    while (true) {
        let marker1 = text.indexOf('\\(');
        let marker2 = text.indexOf('\\[');
        if (marker1 !== -1 && (marker2 === -1 || marker1 < marker2)) {
            result.push(text.substr(0, marker1));
            let endMarker = text.indexOf('\\)');
            if (endMarker === -1) {
                result.push(<MathJax.Node inline>{text.slice(marker1 + 2)}</MathJax.Node>);
                console.warn('Invalid LaTeX: Missing closing \\)');
                break;
            }
            result.push(<MathJax.Node inline>{text.slice(marker1 + 2, endMarker)}</MathJax.Node>);
            text = text.slice(endMarker + 2);
        } else if (marker2 !== -1) {
            result.push(text.substr(0, marker2));
            let endMarker = text.indexOf('\\]');
            if (endMarker === -1) {
                result.push(<MathJax.Node>{text.slice(marker2 + 2)}</MathJax.Node>);
                console.warn('Invalid LaTeX: Missing closing \\]');
                break;
            }
            result.push(<MathJax.Node>{text.slice(marker2 + 2, endMarker)}</MathJax.Node>);
            text = text.slice(endMarker + 2);
        } else {
            result.push(text);
            break;
        }
    }
    return <MathJax.Context input='tex'><Typography variant={variant}>{result}</Typography></MathJax.Context>
}