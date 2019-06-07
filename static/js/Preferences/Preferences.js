import React from 'react';
import Http from '../HelperFunctions/Http';
import Radio from '@material-ui/core/Radio/Radio';
import Avatar from '@material-ui/core/Avatar/Avatar';
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';

export default class Preferences extends React.Component {
    constructor(props) {
        super(props);
        this.colorList = this.props.colorList;
        this.state = {
            changeColor: (color) => {
                let index = this.colorList.indexOf(color);
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
        return (
            <div style={{margin: '10px', flex: 1, overflowY: 'auto'}}>
                <Typography variant={'headline'}>Please select a color</Typography>
                <table><tbody>
                    <tr>{this.colorList.slice(0, 6).map((x, y) => this.colorIcon(x, y))}</tr>
                    <tr>{this.colorList.slice(6, 12).map((x, y) => this.colorIcon(x, y+6))}</tr>
                    <tr>{this.colorList.slice(12, 18).map((x, y) => this.colorIcon(x, y+12))}</tr>
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

    colorIcon(color, index) {
        return (
            <td style={{padding: '10px'}} key={'selectColor' + index}>
                <Avatar style={{width: '60px', height: '60px', backgroundColor:color['500']}}
                        onClick={() => this.state.changeColor(color)}/>
            </td>
        );
    }
}
