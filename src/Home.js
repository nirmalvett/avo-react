import React from 'react';
import Typography from "@material-ui/core/Typography/Typography";

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
            <div style={{margin: '10px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                <Typography variant='body1'>Hi!</Typography>
            </div>
        );
    }
}

export default Home