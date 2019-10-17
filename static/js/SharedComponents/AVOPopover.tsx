import React from 'react';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

export default function AVOPopover(props: any) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;

    return (
        <span>
            <span
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup='true'
                onClick={handleClick}
            >
                {props.children}
            </span>
            <Popper id={id} open={open} anchorEl={anchorEl} transition>
                {({TransitionProps}) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper style={{padding: '5px'}}>
                            <Typography>{props.content}</Typography>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </span>
    );
}
