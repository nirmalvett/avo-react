import React from 'react';
import Http from './Http';
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, amber, orange,
    deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors/';
import Radio from '@material-ui/core/Radio/Radio';
import Avatar from '@material-ui/core/Avatar/Avatar';
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';

export default class Preferences extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeColor: (color) => {
                let index = [red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green,
                    lightGreen, amber, orange, deepOrange, brown, grey, blueGrey].indexOf(color);
                Http.changeColor(index, () => {}, () => {});
                this.props.changeColor(color);
            },
            changeTheme: (theme) => {
                Http.changeTheme(theme === 'dark' ? 1 : 0, () => {}, () => {});
                this.props.changeTheme(theme);
            },
            theme: this.props.theme === 'dark'
        }
    }

    render() {
        let color_icon = color => <td style={{padding: '10px'}}><Avatar style={{width: '60px', height: '60px',
            backgroundColor:color['500']}} onClick={() => this.state.changeColor(color)}/></td>;
        return (
            <div style={{margin: '10px', flex: 1, overflowY: 'auto'}}>
                <Typography variant={'headline'}>Please select a color</Typography>
                <table><tbody>
                    <tr>{[red, pink, purple, deepPurple, indigo, blue].map(x => color_icon(x))}</tr>
                    <tr>{[lightBlue, cyan, teal, green, lightGreen, amber].map(x => color_icon(x))}</tr>
                    <tr>{[orange, deepOrange, brown, grey, blueGrey].map(x => color_icon(x))}</tr>
                </tbody></table>
                <Typography variant={'headline'}>Please select a theme</Typography>
                <RadioGroup name='theme' value={this.props.theme}
                            onChange={(e, value) => this.state.changeTheme(value)}>
                    <FormControlLabel value='light' control={<Radio color='primary'/>} label='Light Theme'/>
                    <FormControlLabel value='dark' control={<Radio color='primary'/>} label='Dark Theme'/>
                </RadioGroup>
            </div>
        );
    }

    colorIcon(color) {
        return (
            <td style={{padding: '10px'}}>
                <Avatar style={{width: '60px', height: '60px', backgroundColor:color['500']}}
                        onClick={() => this.state.changeColor(color)}/>
            </td>
        );
    }
}