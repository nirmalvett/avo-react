import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

export default function AVOPopover(props) {
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handlePopoverOpen = event => {
		console.log('heyyyyy');
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<div>
		 	<div
			    aria-owns={open ? 'mouse-over-popover' : undefined}
			    aria-haspopup="true"
			    onMouseEnter={handlePopoverOpen}
			    onMouseLeave={handlePopoverClose}
			 >
		    	{props.children}
		  	</div>
		  	<Popover
			    id="mouse-over-popover"
			    open={open}
			    anchorEl={anchorEl}
			    anchorOrigin={{
		      		vertical: 'bottom',
		      		horizontal: 'left',
		    	}}
		    	transformOrigin={{
		      		vertical: 'top',
		      		horizontal: 'left',
		    	}}
		    	onClose={handlePopoverClose}
		    	disableRestoreFocus
		  	>
		    	<Typography>{props.content}</Typography>
		  	</Popover>
		</div>
	);
};