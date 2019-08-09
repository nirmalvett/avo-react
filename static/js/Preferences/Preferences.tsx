import React, {PureComponent} from 'react';
import * as Http from '../Http';
import Radio from '@material-ui/core/Radio/Radio';
import Avatar from '@material-ui/core/Avatar/Avatar';
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {colorList} from '../SharedComponents/AVOCustomColors';

interface PreferencesProps {
    setColor: (color: number) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    color: number;
    theme: 'light' | 'dark';
}

export default class Preferences extends PureComponent<PreferencesProps> {
    render() {
        return (
            <div style={{margin: '10px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='h5'>Please select a color</Typography>
                <table>
                    <tbody>
                        <tr>{colorList.slice(0, 6).map((x, y) => this.colorIcon(x, y))}</tr>
                        <tr>{colorList.slice(6, 12).map((x, y) => this.colorIcon(x, y + 6))}</tr>
                        <tr>{colorList.slice(12, 18).map((x, y) => this.colorIcon(x, y + 12))}</tr>
                    </tbody>
                </table>
                <Typography variant='h5'>Please select a theme</Typography>
                <RadioGroup
                    name='theme'
                    value={this.props.theme}
                    onChange={(e, value) => this.changeTheme(value as 'light' | 'dark')}
                >
                    <FormControlLabel
                        value='light'
                        control={<Radio color='primary' />}
                        label='Light Theme'
                    />
                    <FormControlLabel
                        value='dark'
                        control={<Radio color='primary' />}
                        label='Dark Theme'
                    />
                </RadioGroup>
            </div>
        );
    }

    colorIcon(color: {'500': string}, index: number) {
        return (
            <td style={{padding: '10px'}} key={'selectColor' + index}>
                <Avatar
                    style={{width: '60px', height: '60px', backgroundColor: color['500']}}
                    onClick={() => this.changeColor(index)}
                />
            </td>
        );
    }

    changeColor = (color: number) => {
        Http.changeColor(color, () => {}, () => {});
        this.props.setColor(color);
    };

    changeTheme = (theme: 'light' | 'dark') => {
        Http.changeTheme(theme === 'dark' ? 1 : 0, () => {}, () => {});
        this.props.setTheme(theme);
    };
}
