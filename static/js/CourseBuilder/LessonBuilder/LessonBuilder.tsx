import React, {Component, Fragment} from 'react';
import {TextField, Button, Select, MenuItem, Input, Card, CardContent} from '@material-ui/core';
import {Class} from '../../Models';
import * as Http from '../../Http';

interface LessonBuilderProps {}
interface LessonBuilderState {}
export default class LessonBuilder extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedClassName: 'Select class...',
            classNames: [],
            classes: [],
            selectedClass: {} as Class,
            loadingClasses: true,
        };
    }
    componentDidMount() {
        this.getClasses();
    }

    render() {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 25,
                }}
            >
                {this.state.loadingClasses && <div className='avo-loading-icon'></div>}
                {!this.state.loadingClasses && (
                    <Card
                        style={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{marginLeft: 'auto', padding: 15}}>
                                    <Select
                                        value={this.state.selectedClassName}
                                        input={<Input name='data' id='select-class' />}
                                        onChange={e =>
                                            this.setState(
                                                {selectedClassName: e.target.value as string},
                                                () => this.changeClass(),
                                            )
                                        }
                                    >
                                        {this.state.classNames.map((c: any, i: number) => (
                                            <MenuItem key={i} value={c}>
                                                {c}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <TextField
                                    id='filled-full-width'
                                    label='Enter lesson content...'
                                    style={{margin: 8}}
                                    fullWidth
                                    margin='normal'
                                    variant='filled'
                                    multiline={true}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        style: {
                                            height: 500,
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    getClasses() {
        Http.getClasses(
            res => {
                console.log(res);
                const classes = res.classes;
                if (classes.length > 0) {
                    this.setState(
                        {
                            classNames: classes.map(c => c.name),
                            classes,
                            selectedClass: classes[0],
                            selectedClassName: classes[0].name,
                            loadingClasses: false,
                        },
                        () => this.changeClass(),
                    );
                }
            },
            err => {
                console.log(err);
            },
        );
    }

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: Class) => c.name === selectedClassName);
            if (selectedClass) {
                this.setState({selectedClass});
                console.log(selectedClass)
                Http.getLessonsToEdit(
                    selectedClass.classID, 
                    res => {
                        console.log(res)
                    }, 
                err => console.warn);
            }
        }
    };
}
