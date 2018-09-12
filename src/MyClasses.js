import React from 'react';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import ListItem from '@material-ui/core/ListItem/ListItem';
import List from '@material-ui/core/List/List';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Paper from '@material-ui/core/Paper/Paper';
import PeopleIcon from '@material-ui/icons/People';
import AssessmentIcon from '@material-ui/icons/Assessment';

class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            class: [0, 1, 2, 3],
            name: ["Class 1", "Class 2", "Class 3", "Class 4"],
            enrollKey: ["enrollKey1", "enrollKey2", "enrollKey3", "enrollKey4"],
            test: [[1,2], [3], [4,5,6], []],
            testAverage: [[10,20], [30], [40,50,60], []],
            testName: [['Test 1', 'Test 2'], ['Test 3'], ['Test 4', 'Test 5', 'Test 6'], []],
            path: this.props.path,
            open: [true, true, true, false]
        }
    }

    render() {
        let classList = (number) => {
            if (this.state.test[number].length === 0)
                return <ListItem button><PeopleIcon color='action'/><ListItemText inset primary={this.state.name[number]}/></ListItem>;
            else
                return [
                    <ListItem button onClick={() => this.setState({open: this.state.open.map((x,y) => y === number ? !x : x)})}>
                        <PeopleIcon color='action'/>
                        <ListItemText inset primary={this.state.name[number]}/>
                        {this.state.open[number] ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>,
                    <Collapse in={this.state.open[number]} timeout="auto" unmountOnExit>
                        <List>
                            {this.state.testName[number].map(x => <ListItem button>
                                <AssessmentIcon color='action' style={{marginLeft: '10px'}}/>
                                <ListItemText inset primary={x}/>
                            </ListItem>)}
                        </List>
                    </Collapse>
                ];
        };
        return (
            <Paper style={{width: '100%', flex: 1, display: 'flex', maxWidth: 240}}>
                <List style={{flex: 1, overflowY: 'auto'}} component="nav" subheader={<ListSubheader component="div">My Classes</ListSubheader>}>
                    {this.state.class.map(x => classList(x))}
                </List>
            </Paper>
        );
    }

    handleClick = () => {
        this.setState({open: !this.state.open});
    };
}

export default MyClasses