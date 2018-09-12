import React from 'react';
import Typography from '@material-ui/core/Typography/Typography';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeColor: this.props.changeColor,
            changeTheme: this.props.changeTheme,
            theme: this.props.theme === 'dark'
        }
    }

    render() {
        return (
            <div style={{margin: '80px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                <Typography variant='subheading'>AVO is the future of AI assisted learning, and utilizes cutting edge
                    methodologies & systems to deliver an incomparable experience.</Typography>
            </div>
        );
    }
}

export default Home