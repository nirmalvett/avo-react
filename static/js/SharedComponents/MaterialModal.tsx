import React, {Component} from 'react';
import {Button, Card, Modal, Typography} from '@material-ui/core';

interface AVOModalProps {
    title: string;
    target: string;
    onAccept: (cb: () => void) => void;
    onDecline: () => void;
    acceptText: string;
    declineText: string;
    noDefaultClose?: boolean;
}

interface AVOModalState {
    isOpen: boolean;
    hasLoaded: boolean;
}

export default class AVOModal extends Component<AVOModalProps, AVOModalState> {
    constructor(props: AVOModalProps) {
        super(props);
        this.state = {
            isOpen : false,
            hasLoaded: false
        };
    };

    render() {
        return (
            <Modal open={this.state.isOpen}>
                <Card className={`avo-modal__card ${this.state.hasLoaded ? 'active' : ''}`}>
                    <Typography variant='h5'>
                        {this.props.title}
                    </Typography>
                    {this.props.children}
                    {this.getFooter()}
                </Card>
            </Modal>
        );
    };

    componentDidMount() {
        (document.getElementById(this.props.target) as HTMLElement).addEventListener('click', () => {
            this.setState({ isOpen : true });
            setTimeout(() => {
                this.setState({ hasLoaded : true });
            }, 100);
        });
    };

    getFooter() {
        return (
            <footer className="avo-modal__card-footer">
                <Button
                    color='primary'
                    className='avo-button'
                    onClick={() => {
                        this.props.onDecline();
                        this.closeModal();
                    }}
                >
                    {this.props.declineText}
                </Button>
                <Button
                    color='primary'
                    className='avo-button'
                    onClick={() => {
                        if(this.props.noDefaultClose) {
                            this.props.onAccept(this.closeModal);
                        } else {
                            this.props.onAccept(() => {});
                            this.closeModal();
                        }
                    }}
                >
                    {this.props.acceptText}
                </Button>
            </footer>
        );
    };

    closeModal = () => {
        this.setState({ hasLoaded : false });
        setTimeout(() => {
            this.setState({ isOpen : false });
        }, 550);
    };
};
