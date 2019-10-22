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
    selectedTags: {[conceptID: number]: number};
    addTag: (id: number, weight: number) => void;
    removeTag: (id: number) => void;
}

interface CategoryCardState {
    text: string;
    weight: number;
}

const MAXIMUM = 50;

export class CategoryCard extends Component<CategoryCardProps, CategoryCardState> {
    constructor(props: CategoryCardProps) {
        super(props);
        this.state = {
            text: '',
            weight: 4,
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
                {[1, 2, 3, 4].map(weight => (
                    <FormControlLabel
                        key={'weight:' + weight}
                        control={<Radio color='primary' checked={this.state.weight === weight} />}
                        onChange={() => this.setState({weight})}
                        label={weight}
                    />
                ))}
                {tagsToShow.slice(0, MAXIMUM).map((tag, index) => (
                    <Chip
                        style={{margin: '4px'}}
                        label={tag.name + ' (' + (selectedTags[tag.conceptID] || 0) + ')'}
                        key={'tag' + index}
                        onClick={
                            selectedTags[tag.conceptID] === this.state.weight
                                ? () => removeTag(tag.conceptID)
                                : () => addTag(tag.conceptID, this.state.weight)
                        }
                        color={selectedTags.hasOwnProperty(tag.conceptID) ? 'primary' : 'default'}
                    />
                ))}
                {tagsToShow.length > MAXIMUM && (
                    <Chip label={`+${tagsToShow.length - MAXIMUM} hidden`} />
                )}
            </Fragment>
        );
    }
}
