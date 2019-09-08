import React, {PureComponent} from 'react';
import IconButton from '@material-ui/core/IconButton';
import {ArrowBack, Edit, Refresh, Save, Warning} from '@material-ui/icons';

interface ButtonsPreviewProps {
    disableSave: boolean;
    initError: boolean;
    exit: () => void;
    save: () => void;
    cancelPreview: () => void;
    newSeed: () => void;
}

export class ButtonsPreview extends PureComponent<ButtonsPreviewProps> {
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
                <IconButton onClick={this.props.cancelPreview}>
                    <Edit color='primary' />
                </IconButton>
                <IconButton onClick={this.props.newSeed}>
                    <Refresh />
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
