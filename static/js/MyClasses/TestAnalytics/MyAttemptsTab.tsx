import React, {Fragment} from 'react';
import {
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import {getDateString} from '../../HelperFunctions/Utilities';
import {DescriptionOutlined} from '@material-ui/icons';
import {GetSections_Test} from '../../Http';

interface MyAttemptsProps {
    test: GetSections_Test;
    postTest: (takesID: number) => () => void;
}

export function MyAttemptsTab(props: MyAttemptsProps) {
    return (
        <Fragment>
            <br />
            <List style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                {props.test.submitted.map((x, y) => (
                    <ListItem key={'MyClasses:' + x.takesID + ', ' + y}>
                        <ListItemText
                            primary={
                                'Attempt ' + (y + 1) + ' - ' + x.grade.toFixed(2) + '/' + props.test.total
                            }
                            secondary={'Submitted on ' + getDateString(x.timeSubmitted)}
                        />
                        <ListItemSecondaryAction>
                            <Tooltip title='View previous test results'>
                                <IconButton onClick={props.postTest(x.takesID)}>
                                    <DescriptionOutlined />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Fragment>
    );
}
