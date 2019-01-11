import React, { Component, createElement } from 'react';
import { List, Paper, Collapse, ListItem, ListItemText } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { copy } from "./Utilities";
import { uniqueKey } from "./helpers";

export default class AvoList extends Component {
    constructor(props) {
        super(props);
        // this.props.items should be a list of items, where each item is an object with the following properties:
        //  {
        //      primary: ___,
        //      secondary: ___,
        //      icon: ___,
        //      iconColor: ___,
        //      items: [{___},]  // This parameter is optional
        //  }
        this.state = {
            items: this.props.items,
            selected: []
        };
        this.dense = this.props.dense;
    }

    render() {
        return (
            <Paper style={{width: '100%', flex: 1, overflowY: 'auto'}}>
                <List dense={this.dense}
                      style={{marginTop: '5px', marginBottom: '5px'}}>
                    {this.state.items.map((item, itemC) => this.createListItem(item, itemC, 0, true))}
                </List>
            </Paper>
        );
    }

    createListItem(item, index, depth, selected) {
        let {primary, secondary, icon, iconColor, items} = item;
        let onClick = () => {
            let selected = copy(this.state.selected).slice(0, depth);
            selected[depth] = index;
            this.setState({selected: selected});
            this.props.onChange(depth, item);
        };
        let style = {paddingLeft: (24 + depth * 10 + 'px')};
        if (items === undefined) {
            return (
                <ListItem key = { uniqueKey() } button onClick={onClick} style={style}>
                    {createElement(icon, {color: iconColor})}
                    <ListItemText inset primary={primary} secondary={secondary}/>
                </ListItem>
            );
        } else if (items.length === 0) {
            return (
                <ListItem key = { uniqueKey() } button onClick={onClick} style={style}>
                    {createElement(icon, {color: iconColor})}
                    <ListItemText inset primary={primary} secondary={secondary}/>
                    <ExpandMore color='disabled'/>
                </ListItem>
            );
        } else {
            let open = selected && this.state.selected[depth] === index;
            return [
                <ListItem key = { uniqueKey() } button onClick={onClick} style={style}>
                    {createElement(icon, {color: iconColor})}
                    <ListItemText inset primary={primary} secondary={secondary}/>
                    {open
                        ? <ExpandLess color='action'/>
                        : <ExpandMore color='action'/>}
                </ListItem>,
                <Collapse in={open} timeout='auto' unmountOnExit>
                    <List dense={this.dense}>
                        {items.map((item2, index2) => this.createListItem(item2, index2, depth + 1, open))}
                    </List>
                </Collapse>
            ];
        }
    }
}
