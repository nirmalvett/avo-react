import React from 'react';
import Avatar from '@material-ui/core/Avatar/Avatar';
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber,
    orange, deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors/';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup';
import Radio from '@material-ui/core/Radio/Radio';

class Preferences extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeColor: this.props.changeColor,
            changeTheme: this.props.changeTheme,
            theme: this.props.theme === 'dark'
        }
    }

    render() {
        let color_icon = color => <td style={{padding: '10px'}}><Avatar style={{width: '60px', height: '60px',
            backgroundColor:color['500']}} onClick={() => this.state.changeColor(color)}/></td>;
        return (
            <div style={{margin: '10px', flex: 1, overflowY: 'auto'}}>
                <Typography variant={'headline'}>Please select a color</Typography>
                <table>
                    <tr>{[red, pink, purple, deepPurple, indigo].map(x => color_icon(x))}</tr>
                    <tr>{[blue, lightBlue, cyan, teal, green].map(x => color_icon(x))}</tr>
                    <tr>{[lightGreen, lime, yellow, amber, orange].map(x => color_icon(x))}</tr>
                    <tr>{[deepOrange, brown, grey, blueGrey].map(x => color_icon(x))}</tr>
                </table>
                <Typography variant={'headline'}>Please select a theme</Typography>
                <RadioGroup aria-label='Theme' name='theme' value={this.props.theme} onChange={(e, value) => this.props.changeTheme(value)}>
                    <FormControlLabel value='light' control={<Radio color='primary'/>} label='Light Theme'/>
                    <FormControlLabel value='dark' control={<Radio color='primary'/>} label='Dark Theme'/>
                </RadioGroup>
            </div>
        );
    }
}

export default Preferences