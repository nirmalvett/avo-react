import * as React from 'react';
import {CSSProperties} from '@material-ui/core/styles/withStyles';
import { type } from 'os';

export interface SelectableProps {
    children: string;
    color: {'200': string; '500': string};
    add: (element: Selectable) =>  void;
    remove: (element: Selectable) =>  void;
    type: string;
}

export interface SelectableState {
    currentStyle: CSSProperties;
}

class Selectable extends React.Component<SelectableProps, SelectableState> {
    styles = {
        hovered: {backgroundColor: this.props.color['200']},
        unselected: {backgroundColor: 'inherit'},
        selected: {backgroundColor: this.props.color['500']},
    };
    constructor(props: SelectableProps) {
        super(props);
        this.state = {
            currentStyle: this.styles.unselected,
        };
    }
    render() {
        return (
            <React.Fragment>
                <span
                    style={this.state.currentStyle}
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
        if (this.state.currentStyle !== this.styles.selected) {
            this.setState({currentStyle: this.styles.selected});
            this.props.add(this);
        }
        else {
            this.setState({currentStyle: this.styles.unselected});
            this.props.remove(this);
        }
    };

    reset = () => {
        this.setState({currentStyle: this.styles.unselected});
    }
}

export default Selectable;
