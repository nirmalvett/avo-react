import React from  'react';
import Modal from '@material-ui/core/Modal';
import Card from '@material-ui/core/Card/Card';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button/Button';

export default class AVOModal extends React.Component {
    constructor(props = {}) {
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
                    <Typography variant='headline'>
                        {this.props.title}
                    </Typography>
                    {this.props.children}
                    {this.getFooter()}
                </Card>
            </Modal>
        );
    };

    componentDidMount() {
        document.getElementById(this.props.target).addEventListener('click', () => {
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
                        this.props.onAccept();
                        this.closeModal();
                    }}
                >
                    {this.props.acceptText}
                </Button>            
            </footer>
        );
    };

    closeModal() {
        this.setState({ hasLoaded : false });
        setTimeout(() => {
            this.setState({ isOpen : false });
        }, 550);
    };
};