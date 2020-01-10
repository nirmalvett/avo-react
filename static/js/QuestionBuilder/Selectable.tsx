import * as React from 'react';
import {CSSProperties} from '@material-ui/core/styles/withStyles';
import {type} from 'os';

export interface SelectableProps {
    children: string;
    color: { '200': string; '500': string };
    add: (position: number) => void;
    remove: (position: number) => void;
    type: string;
    position: number;
    selected: boolean;
    disabled?: boolean;
}

export interface SelectableState {
    currentStyle: CSSProperties;
}

class Selectable extends React.PureComponent<SelectableProps, SelectableState> {
    styles = {
        hovered: {backgroundColor: this.props.color['200']},
        unselected: {backgroundColor: 'inherit'},
        selected: {backgroundColor: this.props.color['500']},
    };

    constructor(props: SelectableProps) {
        super(props);
        this.state = {
            currentStyle: props.selected ? this.styles.selected : this.styles.unselected,
        };
    }

    render() {
        return (
            <React.Fragment>
                <span
                    style={{...this.state.currentStyle, fontSize: '2.5em'}}
                    onMouseEnter={this.hover}
                    onMouseLeave={this.unhover}
                    onClick={this.handleClick}
                >
                    {this.props.children}
                </span>{' '}
            </React.Fragment>
        );
    }

    unhover = () => {
        if (this.state.currentStyle !== this.styles.selected)
            this.setState({currentStyle: this.styles.unselected});
    };

    hover = () => {
        if (this.state.currentStyle !== this.styles.selected)
            this.setState({currentStyle: this.styles.hovered});
    };

    handleClick = () => {
        if (!this.props.disabled) {
            if (this.state.currentStyle !== this.styles.selected) {
                this.setState({currentStyle: this.styles.selected});
                this.props.add(this.props.position);
            } else {
                this.setState({currentStyle: this.styles.unselected});
                this.props.remove(this.props.position);
            }
        }
    };

    reset = () => {
        this.setState({currentStyle: this.styles.unselected});
    }
}

export default Selectable;
