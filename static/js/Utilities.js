import React from "react";
import MathJax from "react-mathjax2";
import Typography from "@material-ui/core/Typography/Typography";

export function getMathJax(text, variant) {
    let strings = text.split(/\\[()]/).map((x, y) => y % 2 === 0 ? x :
        <MathJax.Node inline>{x}</MathJax.Node>);
    return <MathJax.Context input='tex'><Typography variant={variant}>{strings}</Typography></MathJax.Context>
}