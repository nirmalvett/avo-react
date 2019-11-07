import React, {PureComponent} from 'react';
import {AnswerInputImplementationProps} from './AnswerInput';
import {validateNumber} from '../HelperFunctions/Utilities';
import {IconButton, TextField, Typography} from '@material-ui/core';
import {Add, DeleteOutlined} from '@material-ui/icons';
import {Content} from '../HelperFunctions/Content';

export class _8_Matrix extends PureComponent<AnswerInputImplementationProps> {
    render() {
        const cells = this.getArray();
        const size = {fontSize: `${2.5 * cells.length}rem`, color: 'gray'};
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Content>{this.props.prompt}</Content>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <Typography style={size}>[</Typography>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {cells.map(this.renderRow)}
                    </div>
                    <Typography style={size}>]</Typography>
                    <div
                        style={{display: 'flex', flexDirection: 'column', alignSelf: 'flex-start'}}
                    >
                        <IconButton
                            style={{margin: '4px'}}
                            disabled={cells.length <= 2 || this.props.disabled}
                            onClick={this.deleteRow}
                        >
                            <DeleteOutlined />
                        </IconButton>
                        <IconButton
                            style={{margin: '4px'}}
                            disabled={cells.length >= 5 || this.props.disabled}
                            onClick={this.addRow}
                        >
                            <Add />
                        </IconButton>
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <IconButton
                        style={{margin: '4px'}}
                        disabled={cells[0].length <= 2 || this.props.disabled}
                        onClick={this.deleteColumn}
                    >
                        <DeleteOutlined />
                    </IconButton>
                    <IconButton
                        style={{margin: '4px'}}
                        disabled={cells[0].length >= 5 || this.props.disabled}
                        onClick={this.addColumn}
                    >
                        <Add />
                    </IconButton>
                </div>
            </div>
        );
    }

    getArray() {
        const rows = (this.props.value || ',\n,').split('\n');
        return rows.map(x => x.split(',').map(x => x.trim()));
    }

    renderRow = (row: string[], index1: number) => {
        return (
            <div style={{display: 'flex', flexDirection: 'row'}}>
                {row.map((cell, index2) => this.renderCell(cell, index1, index2))}
            </div>
        );
    };

    renderCell = (cell: string, index1: number, index2: number) => {
        const x = validateNumber(cell);
        return (
            <TextField
                key={'cell' + index1 + index2}
                style={{maxWidth: '12ch', margin: '4px'}}
                value={cell}
                onChange={e => this.onChange(e.target.value, index1, index2)}
                onBlur={() => this.props.save(this.props.value)}
                helperText={typeof x === 'string' ? x : undefined}
                error={typeof x === 'string'}
                disabled={this.props.disabled}
            />
        );
    };

    onChange(value: string, index1: number, index2: number) {
        const cells = this.getArray();
        cells[index1][index2] = value;
        this.props.onChange(cells.map(x => x.join(',')).join('\n'));
    }

    addColumn = () => {
        const cells = this.getArray();
        cells.forEach(row => row.push(''));
        this.props.save(cells.map(x => x.join(',')).join('\n'));
    };

    deleteColumn = () => {
        const cells = this.getArray();
        cells.forEach(row => row.pop());
        this.props.save(cells.map(x => x.join(',')).join('\n'));
    };

    addRow = () => {
        const cells = this.getArray();
        cells.push(new Array(cells[0].length).fill(''));
        this.props.save(cells.map(x => x.join(',')).join('\n'));
    };

    deleteRow = () => {
        const cells = this.getArray();
        cells.pop();
        this.props.save(cells.map(x => x.join(',')).join('\n'));
    };
}
