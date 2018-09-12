import React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';

class LogoutDialogue extends React.Component {
    render() {
        return (
            <Dialog open onClose={this.props.cancel}>
                <DialogTitle>{'Logout?'}</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to logout?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={this.props.cancel} color='primary'>No</Button>
                    <Button onClick={this.props.logout} color='primary' autoFocus>Yes</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default LogoutDialogue