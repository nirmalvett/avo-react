import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

export default function AVOPopMenu(props: any) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                aria-label='more'
                aria-controls='long-menu'
                aria-haspopup='true'
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu id='long-menu' anchorEl={anchorEl} keepMounted open={open} onClose={handleClose}>
                {props.options.map((option: any, index: number) => (
                    <MenuItem
                        key={`avopopup@key=${index}`}
                        onClick={option.onClick}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
