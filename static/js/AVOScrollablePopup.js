import React, { Component } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';
//* requires prop input
// mainTextBody: Component that contains the main body
// confirmButtonText: The button for confirm
// mainButtonText: i.e. the button name
// dialogueTitle: The top title bar
// onConfirmFunction: this is called when confirm is clicked
// checkCondition: if function returns true then dialogue box appears otherwise an alert is raised*/

export default class AVOScrollablePopup extends Component {

    constructor(props){
        super(props);
        this.state = {
            open: false,
            scroll: 'paper',
        };
    }


    handleClickOpen(scroll) {
        this.setState({ open: true, scroll });
    };

    handleClose() {
        this.setState({ open: false });
    };

    handleConfirm() {
        const { onConfirmFunction } = this.props;
        onConfirmFunction();
        this.handleClose(); // closes the dialogue box

    };


    render() {
        const { mainTextBody, confirmButtonText, mainButtonText, dialogueTitle } = this.props;
        return (
            <div>
                <Button color='primary' onClick={() => this.handleClickOpen('paper')}>{mainButtonText}</Button>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    scroll={this.state.scroll}
                    aria-labelledby="scroll-dialog-title"
                >
                    <DialogTitle id="scroll-dialog-title">{dialogueTitle}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            { mainTextBody }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.handleClose() } color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => this.handleConfirm() } color="primary">
                            { confirmButtonText }
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
