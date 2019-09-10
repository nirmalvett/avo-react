import React, {Component, Fragment} from 'react';
import {Chip, FormControlLabel, Radio, TextField, Typography} from '@material-ui/core';
import * as Http from '../../Http';

const CATEGORIES: readonly string[] = [
    '(No category)',
    'Remember',
    'Understand',
    'Apply',
    'Analyze',
    'Evaluate',
    'Synthesis',
];

interface CategoryCardProps {
    category: number;
    setCategory: (category: number) => () => void;
    tags: Http.GetTags['tags'];
    clickTag: (id: number) => void;
}

interface CategoryCardState {
    text: string;
}

const MAXIMUM = 20;

export class CategoryCard extends Component<CategoryCardProps, CategoryCardState> {
    constructor(props: CategoryCardProps) {
        super(props);
        this.state = {
            text: '',
        };
    }

    render() {
        const {category, tags} = this.props;
        const tagsToShow = tags.filter(x => x.tagName.includes(this.state.text));
        return (
            <Fragment>
                <Typography variant='h6'>Categorization and Tagging</Typography>
                {CATEGORIES.map((name, index) => (
                    <FormControlLabel
                        key={name}
                        control={<Radio color='primary' checked={category === index} />}
                        onChange={this.props.setCategory(index)}
                        label={name}
                    />
                ))}
                <br />
                <TextField
                    label='Filter tags'
                    value={this.state.text}
                    onChange={e => this.setState({text: e.target.value})}
                    style={{margin: '4px'}}
                />
                <br />
                {tagsToShow.slice(0, MAXIMUM).map((tag, index) => (
                    <Chip
                        style={{margin: '4px'}}
                        label={tag.tagName}
                        key={'tag' + index}
                        onClick={() => this.props.clickTag(tag.tagID)}
                    />
                ))}
                {tagsToShow.length > MAXIMUM && (
                    <Chip label={`+${tagsToShow.length - MAXIMUM} hidden`} />
                )}
            </Fragment>
        );
    }
}
