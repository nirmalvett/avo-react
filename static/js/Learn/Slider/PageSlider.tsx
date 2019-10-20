import {Slider, withStyles} from '@material-ui/core';

export const PageSlider = withStyles({
    root: {
        height: 8,
        width: '90%',
        margin: 'auto',
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 0px)',
        '& > span': {
            height: 40,
            width: 40,
        },
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);
