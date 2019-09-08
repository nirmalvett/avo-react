import React, {PureComponent} from 'react';
import {IconButton} from '@material-ui/core';
import {ArrowBack, Assignment, Save, Warning} from '@material-ui/icons';

interface ButtonsEditorProps {
    disableSave: boolean;
    initError: boolean;
    exit: () => void;
    save: () => void;
    preview: () => void;
}

export class ButtonsEditor extends PureComponent<ButtonsEditorProps> {
    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    padding: 5,
                }}
            >
                <IconButton onClick={this.props.exit}>
                    <ArrowBack />
                </IconButton>
                <IconButton onClick={this.props.save} disabled={this.props.disableSave}>
                    <Save />
                </IconButton>
                <IconButton onClick={this.props.preview}>
                    <Assignment />
                </IconButton>
                {this.props.initError && (
                    <IconButton disabled>
                        <Warning color='error' />
                    </IconButton>
                )}
            </div>
        );
    }
}
