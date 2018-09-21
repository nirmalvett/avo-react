import React from 'react';
import Http from './Http';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Paper from '@material-ui/core/Paper/Paper';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import AddBox from '@material-ui/icons/AddBox';
import Create from '@material-ui/icons/Create';
import People from '@material-ui/icons/People';
import Assessment from '@material-ui/icons/Assessment';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

export default class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        Http.getClasses(result => this.setState(result), result => console.log(result));
        this.state = {
            classes: [],
            c: null, // Selected class
            t: null, // Selected test
            startTest: this.props.startTest,
        };
    }

    render() {
        let cardStyle = {marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1};

        return (
            <div style={{width: '100%', flex: 1, display: 'flex'}}>
                <Grid container spacing={8} style={{flex: 1, display: 'flex', marginBottom: 0}}>
                    <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
                        <Paper style={{width: '100%', flex: 1, display: 'flex'}}>
                            <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}} component='nav'
                                  subheader={<ListSubheader>My Classes</ListSubheader>}>
                                {this.state.classes.map((x, y) => [
                                    <ListItem button onClick={() => {
                                        let newClassList = JSON.parse(JSON.stringify(this.state.classes));
                                        if (newClassList[y].tests.length > 0)
                                            newClassList[y].open = !newClassList[y].open;
                                        this.setState({classes: newClassList, c: y, t: null});
                                    }}>
                                        <People color='action'/>
                                        <ListItemText inset primary={x.name}/>
                                        {x.open ?
                                            <ExpandLess color={x.tests.length === 0 ? 'disabled' : 'action'}/> :
                                            <ExpandMore color={x.tests.length === 0 ? 'disabled' : 'action'}/>}
                                    </ListItem>,
                                    <Collapse in={x.open} timeout='auto' unmountOnExit><List>{
                                        x.tests.map((a, b) =>
                                            <ListItem button onClick={() => this.setState({c: y, t: b})}>
                                                <Assessment color={a.open ? 'primary' : 'disabled'} style={{marginLeft: '10px'}}/>
                                                <ListItemText inset primary={a.name}/>
                                            </ListItem>)
                                    }</List></Collapse>
                                ])}
                                <ListItem button onClick={() => this.enrollInClass()}>
                                    <AddBox color='action'/>
                                    <ListItemText inset primary='Enroll in Class'/>
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={2}/>
                    <Grid item xs={5} style={{display: 'flex'}}>
                        <Card style={cardStyle}>{this.detailsCard()}</Card>
                    </Grid>
                </Grid>
            </div>
        );
    }

    detailsCard() {
        let selectedClass = this.state.classes[this.state.c];
        if (this.state.t !== null) {
            let selectedTest = selectedClass.tests[this.state.t];
            return [
                <CardHeader title={selectedTest.name} action={
                    <IconButton disabled={!selectedTest.open} onClick={() => this.state.startTest(selectedTest.id)}>
                        <Create/></IconButton>
                }/>,
                <Typography>Deadline: {MyClasses.getDateString(selectedTest.deadline)}</Typography>,
                <Typography>Time Limit: {selectedTest.timer} minutes</Typography>,

            ];
        }
        if (this.state.c !== null) {
            return <CardHeader title={selectedClass.name}/>;
        }
        return null;
    }

    enrollInClass() {
        let key = prompt('Enroll Key:');
        if (key !== null && key !== '') {
            Http.enrollInClass(key,
                () => alert('Enroll successful! Navigate out of this section and ' +
                    'then back to refresh.'),
                () => alert('Looks like you entered an invalid key.'));
        }
    }

    static getDateString(date) {
        let hour = parseInt(date.slice(8, 10));
        let x = hour > 11 ? 'pm' : 'am';
        hour = ((hour + 11) % 12) + 1;
        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
            'November', 'December'][date.slice(4, 6) - 1] + ' ' + date.slice(6, 8) + ', ' + date.slice(0, 4)
            + ' at ' + hour + ':' + date.slice(10, 12) + x;
    }
}