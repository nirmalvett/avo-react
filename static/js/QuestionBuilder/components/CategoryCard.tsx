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
    concepts: Http.GetConcepts['concepts'];
    selectedTags: number[];
    addTag: (id: number) => void;
    removeTag: (id: number) => void;
}

interface CategoryCardState {
    text: string;
}

const MAXIMUM = 50;

export class CategoryCard extends Component<CategoryCardProps, CategoryCardState> {
    constructor(props: CategoryCardProps) {
        super(props);
        this.state = {
            text: '',
        };
    }

    render() {
        const {category, concepts, selectedTags, setCategory, addTag, removeTag} = this.props;
        const tagsToShow = concepts.filter(x => x.name.includes(this.state.text));
        return (
            <Fragment>
                <Typography variant='h6'>Categorization and Tagging</Typography>
                {CATEGORIES.map((name, index) => (
                    <FormControlLabel
                        key={name}
                        control={<Radio color='primary' checked={category === index} />}
                        onChange={setCategory(index)}
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
                        label={tag.name}
                        key={'tag' + index}
                        onClick={
                            selectedTags.includes(tag.conceptID)
                                ? () => removeTag(tag.conceptID)
                                : () => addTag(tag.conceptID)
                        }
                        color={selectedTags.includes(tag.conceptID) ? 'primary' : 'default'}
                    />
                ))}
                {tagsToShow.length > MAXIMUM && (
                    <Chip label={`+${tagsToShow.length - MAXIMUM} hidden`} />
                )}
            </Fragment>
        );
    }
}
