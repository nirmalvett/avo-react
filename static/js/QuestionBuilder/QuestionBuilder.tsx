import React, {Component, CSSProperties, Fragment, ReactElement} from 'react';
import {Button, Card, Divider} from '@material-ui/core';
import {
    ButtonsEditor,
    ButtonsPreview,
    Hints,
    MainPromptCard,
    MathCard,
    Preview,
    SubPromptCard,
    CriteriaCard,
} from './components';
import {
    buildMathCode,
    buildPlainText,
    compile,
    extractReferences,
    formatStringForEditing,
    init,
} from './mathCodeUtils';
import {
    CompileSuccess,
    EditorCriteria,
    EditorMath,
    EditorSubPrompt,
    QuestionBuilderProps,
    QuestionBuilderState,
} from './QuestionBuilder.models';
import * as Http from '../Http';
import {copy} from '../HelperFunctions/Utilities';

const cardStyle: CSSProperties = {
    margin: 8,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
};

const dividerStyle: CSSProperties = {marginTop: 15, marginBottom: 15};

export class QuestionBuilder extends Component<QuestionBuilderProps, QuestionBuilderState> {
    constructor(props: QuestionBuilderProps) {
        super(props);
        const questionString = this.savedString();
        const compileString = compile(init(questionString));
        this.state = {
            mode: {name: null},
            editorSeed: Math.round(65536 * Math.random()),
            initError: questionString !== compileString,
            ...init(questionString),
        };

        if (questionString !== compileString) {
            const message = 'The question will behave differently if you save it';
            Http.sampleQuestion(
                questionString,
                0,
                result1 => {
                    Http.sampleQuestion(
                        compileString,
                        0,
                        result2 => {
                            if (JSON.stringify(result1) !== JSON.stringify(result2)) {
                                console.log(JSON.stringify(result1));
                                console.log(JSON.stringify(result2));
                                this.props.showSnackBar('error', message, 2000);
                            }
                        },
                        () => this.props.showSnackBar('error', message, 2000),
                    );
                },
                () => this.props.showSnackBar('error', message, 2000),
            );
            console.log(
                'Warning: This question could not be recompiled to its initial state.' +
                    ' Check the diff below before saving.',
            );
            console.log('Server: ' + questionString);
            console.log('Local:  ' + compileString);
        }
    }

    savedString(): string {
        return this.props.sets[this.props.s].questions[this.props.q].string;
    }

    disableSave(): boolean {
        return compile(this.state) === this.savedString();
    }

    render() {
        if (this.state.mode.name === 'preview') {
            return this.preview();
        }
        return (
            <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                <ButtonsEditor
                    disableSave={this.disableSave()}
                    initError={this.state.initError}
                    exit={this.returnToManager}
                    save={this.editorSave}
                    preview={this.editorPreview}
                />
                <div style={{flex: 8, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                    <Card style={cardStyle}>{this.renderMathCard()}</Card>
                    <Divider style={dividerStyle} />

                    <Card style={cardStyle}>{this.renderMainPromptCard()}</Card>
                    <Divider style={dividerStyle} />

                    {this.state.editorPrompts.map((x, y) => (
                        <Card style={cardStyle} key={'prompt' + x.prompt + x.type + y}>
                            {this.renderSubPromptCard(x, y)}
                        </Card>
                    ))}
                    <div style={{margin: 8}}>
                        <Button variant='outlined' style={{width: '100%'}} onClick={this.addPrompt}>
                            Add Prompt
                        </Button>
                    </div>
                    <Divider style={dividerStyle} />

                    {this.state.editorCriteria.map((x, y) => (
                        <Card
                            style={cardStyle}
                            key={'criteria' + x.points + x.expr + x.explanation + y}
                        >
                            {this.renderCriteriaCard(x, y)}
                        </Card>
                    ))}
                    <div style={{margin: 8}}>
                        <Button
                            variant='outlined'
                            style={{width: '100%'}}
                            onClick={this.addCriteria}
                        >
                            Add Criteria
                        </Button>
                    </div>
                </div>
                <div style={{flex: 4, display: 'flex', overflowY: 'auto'}}>
                    <Card style={{flex: 1, margin: '8%', padding: 20}}>
                        <Hints mode={this.state.mode} />
                    </Card>
                </div>
            </div>
        );
    }

    preview() {
        if (this.state.mode.name === 'preview') {
            return (
                <Fragment>
                    <ButtonsPreview
                        disableSave={this.disableSave()}
                        initError={this.state.initError}
                        exit={this.returnToManager}
                        save={this.editorSave}
                        cancelPreview={this.editorCancelPreview}
                        newSeed={this.editorNewSeed}
                    />
                    <Preview {...this.state} preview={this.state.mode.preview} />
                </Fragment>
            );
        }
    }

    renderMathCard() {
        return (
            <MathCard
                mode={this.state.mode}
                startEdit={this.startEditingMath}
                cancelEdit={this.editorCancelPreview}
                save={this.saveMath}
                editorMath={this.state.editorMath}
                onChange={content => this.setState({mode: {name: 'math', content}})}
                edit={this.editMath}
                generateHints={this.generateHints}
                getHints={this.getHints}
            />
        );
    }

    renderMainPromptCard() {
        return (
            <MainPromptCard
                mode={this.state.mode}
                editorPrompt={this.state.editorPrompt}
                cancelEdit={this.editorCancelPreview}
                startEdit={this.startEditingMainPrompt}
                save={this.saveMainPrompt}
                onChange={content => this.setState({mode: {name: 'mainPrompt', content}})}
            />
        );
    }

    renderSubPromptCard = (prompt: EditorSubPrompt, index: number) => {
        return (
            <SubPromptCard
                mode={this.state.mode}
                index={index}
                editorPrompt={prompt}
                deletePrompt={() => this.deletePrompt(index)}
                cancelEdit={this.editorCancelPreview}
                startEdit={this.startEditingSubPrompt(index)}
                save={this.saveSubPrompt}
                onChange={content =>
                    this.setState({
                        mode: {
                            name: 'prompt',
                            index: (this.state.mode as {index: number}).index,
                            content,
                        },
                    })
                }
            />
        );
    };

    renderCriteriaCard = (criteria: EditorCriteria, index: number) => {
        return (
            <CriteriaCard
                mode={this.state.mode}
                index={index}
                cancelEdit={this.editorCancelPreview}
                startEdit={this.startEditingCriteria(index)}
                save={this.saveCriteria}
                editorCriteria={criteria}
                onChange={content =>
                    this.setState({
                        mode: {
                            name: 'criteria',
                            index: (this.state.mode as {index: number}).index,
                            content,
                        },
                    })
                }
                deleteCriteria={() => this.deleteCriteria(index)}
            />
        );
    };

    // sidebar buttons

    returnToManager = () => this.props.initManager(this.props.s, this.props.q, this.props.sets);

    editorSave = () => {
        const id = this.props.sets[this.props.s].questions[this.props.q].id;
        const answers = this.state.editorPrompts.length;
        const total = this.state.editorCriteria
            .map(x => Number(x.points))
            .reduce((x, y) => x + y, 0);
        const string = compile(this.state);
        Http.editQuestion(
            id,
            string,
            answers,
            total,
            () => {
                const sets = copy(this.props.sets);
                sets[this.props.s].questions[this.props.q].string = string;
                this.props.updateProps(this.props.s, this.props.q, sets);
                this.setState({initError: false});
            },
            result => {
                this.props.showSnackBar('error', "The question couldn't be saved.", 2000);
                console.warn(result);
            },
        );
    };

    editorPreview = () =>
        Http.sampleQuestion(
            compile(this.state),
            this.state.editorSeed,
            result => this.setState({mode: {name: 'preview', preview: result}}),
            () => undefined,
        );

    editorNewSeed = () => {
        const seed = Math.round(65536 * Math.random());
        Http.sampleQuestion(
            compile(this.state),
            seed,
            result => {
                this.setState({mode: {name: 'preview', preview: result}, editorSeed: seed});
            },
            () => undefined,
        );
    };

    editorCancelPreview = () => this.setState({mode: {name: null}});

    // actions

    addPrompt = () =>
        this.setState({
            editorPrompts: [...this.state.editorPrompts, {type: '0', prompt: '', strings: []}],
            mode: {
                name: 'prompt',
                index: this.state.editorPrompts.length,
                content: {type: '0', prompt: ''},
            },
        });

    addCriteria = () =>
        this.setState({
            editorCriteria: [
                ...this.state.editorCriteria,
                {
                    expr: 'true',
                    points: '1',
                    explanation: '',
                    mathCode: '*T',
                    LaTeX: '\\color{green}✔',
                    strings: [],
                },
            ],
            mode: {
                name: 'criteria',
                index: this.state.editorCriteria.length,
                content: {
                    points: '1',
                    criteria: '',
                    explanation: '',
                },
            },
        });

    deletePrompt(index: number) {
        let editorPrompts = [...this.state.editorPrompts];
        editorPrompts.splice(index, 1);
        this.setState({mode: {name: null}, editorPrompts});
    }

    deleteCriteria(index: number) {
        let editorCriteria = [...this.state.editorCriteria];
        editorCriteria.splice(index, 1);
        this.setState({mode: {name: null}, editorCriteria});
    }

    // start edit actions

    startEditingMath = () => {
        const content = this.state.editorMath
            .map(x => {
                if (!x.success) return x.expr;
                if (x.comment.length === 0) return x.varNames + ' = ' + x.expr;
                return x.varNames + ' = ' + x.expr + ' # ' + x.comment;
            })
            .join('\n');
        this.setState({mode: {name: 'math', content}});
    };

    startEditingMainPrompt = () =>
        this.setState({
            mode: {
                name: 'mainPrompt',
                content: formatStringForEditing(
                    this.state.editorPrompt.prompt,
                    this.state.editorPrompt.strings,
                ),
            },
        });

    startEditingSubPrompt = (index: number) => () => {
        let prompt = this.state.editorPrompts[index];
        this.setState({
            mode: {
                name: 'prompt',
                index,
                content: {
                    type: prompt.type,
                    prompt: formatStringForEditing(prompt.prompt, prompt.strings),
                },
            },
        });
    };

    startEditingCriteria = (index: number) => () => {
        let criteria = this.state.editorCriteria[index];
        this.setState({
            mode: {
                name: 'criteria',
                index,
                content: {
                    points: criteria.points,
                    criteria: criteria.expr,
                    explanation: formatStringForEditing(criteria.explanation, criteria.strings),
                },
            },
        });
    };

    // edit actions

    // save actions

    saveMath = () => {
        if (this.state.mode.name === 'math') {
            const lines = this.state.mode.content.split('\n').filter(x => x.trim().length !== 0);
            const editorMath: EditorMath[] = lines.map(x => {
                let match = /^([^=]+)=([^#]+)(?:#(.*))?$/.exec(x) || ['', '', '', ''];
                let varNames = match[1].split(',').map(x => x.trim());
                let {mathCode, LaTeX, plainText} = buildMathCode(match[2]) as CompileSuccess;
                return {
                    success: true,
                    varNames,
                    expr: buildPlainText(mathCode)[0],
                    mathCode,
                    LaTeX,
                    plainText,
                    comment: match[3] === undefined ? '' : match[3].trim(),
                };
            });
            this.setState({mode: {name: null}, editorMath});
        }
    };

    saveMainPrompt = () => {
        if (this.state.mode.name === 'mainPrompt') {
            const {string, strings} = extractReferences(
                this.state.mode.content,
                this.props.showSnackBar,
            );
            this.setState({editorPrompt: {prompt: string, strings}, mode: {name: null}});
        }
    };

    saveSubPrompt = () => {
        if (this.state.mode.name === 'prompt') {
            let {string, strings} = extractReferences(
                this.state.mode.content.prompt,
                this.props.showSnackBar,
            );
            let {type} = this.state.mode.content;
            let editorPrompts = copy(this.state.editorPrompts);
            editorPrompts[this.state.mode.index] = {prompt: string, strings, type};
            this.setState({mode: {name: null}, editorPrompts});
        }
    };

    saveCriteria = () => {
        if (this.state.mode.name === 'criteria') {
            let {string, strings} = extractReferences(
                this.state.mode.content.explanation,
                this.props.showSnackBar,
            );
            let {criteria, points} = this.state.mode.content;
            let {mathCode, LaTeX} = buildMathCode(criteria) as CompileSuccess;
            let expr = buildPlainText(mathCode)[0];
            let editorCriteria = copy(this.state.editorCriteria);
            editorCriteria[this.state.mode.index] = {
                expr,
                points,
                explanation: string,
                mathCode,
                LaTeX,
                strings,
            };
            console.log(editorCriteria);
            this.setState({mode: {name: null}, editorCriteria});
        }
    };

    // hints

    editMath = (event: any) => {
        // let {target} = event;
        // let hints = {
        //     functions: [],
        //     currentFunctions: [],
        //     selectedFunction: "",
        //     errors: [],
        //     suggestedFunctions: this.state.hints.suggestedFunctions
        // };
        //
        // let {selectionStart, selectionEnd} = target;
        // let content = target.value;
        // let match = new RegExp(function_regex + "$").exec(content.substr(0, selectionStart) + '(');
        // let args = match === null ? "" : FUNCTIONS[match[0].slice(0, -1)][3];
        // if (event.key === "(") {
        //     event.preventDefault();
        //     document.execCommand('insertText', false, "(" + args + ")");
        //     content = content.substr(0, selectionStart) + "(" + args + ")" + content.substr(selectionStart);
        //     selectionEnd = (selectionStart += 1) + args.length;
        // } else if (event.key === "[") {
        //     event.preventDefault();
        //     document.execCommand('insertText', false, "[]");
        //     content = content.substr(0, selectionStart) + "[]" + content.substr(selectionStart);
        //     selectionEnd = selectionStart += 1;
        // } else if (event.key === "{") {
        //     event.preventDefault();
        //     document.execCommand('insertText', false, "{}");
        //     content = content.substr(0, selectionStart) + "{}" + content.substr(selectionStart);
        //     selectionEnd = selectionStart += 1;
        // }
        // let string = content;
        // let function_regex2 = new RegExp(function_regex, "g");
        // for (let m = function_regex2.exec(string); m !== null; m = function_regex2.exec(string)) {
        //     let fn = m[0].slice(0, -1);
        //     let fnStart = m.index + m[0].length;
        //     let fnStop = m.index + m[0].length;
        //     let arg = 0;
        //     for (let brackets = 1; brackets > 0 && fnStop < selectionStart; fnStop++) {
        //         if (brackets === 1 && string[fnStop] === "," && fnStop < selectionStart)
        //             arg++;
        //         else if ("([{".includes(string[fnStop]))
        //             brackets++;
        //         else if (")]}".includes(string[fnStop]))
        //             brackets--;
        //         if (brackets === 0)
        //             arg = -1;
        //     }
        //     if (m.index <= selectionStart && selectionStart < m.index + m[0].length)
        //         hints.selectedFunction = fn;
        //     else if (fnStart <= selectionStart && arg >= 0)
        //         hints.currentFunctions.push([fn, arg]);
        // }
        // this.setState({content, hints}, () => {
        //     target.selectionStart = selectionStart;
        //     target.selectionEnd = selectionEnd;
        // });
        // todo
    };

    generateHints(event: any) {
        // let {target} = event;
        // this.hints = {functions: [], currentFunctions: [], selectedFunction: "", errors: [], suggestedFunctions: []};
        //
        // let {selectionStart} = target;
        // let string = target.value;
        //
        // let x = selectionStart;
        // while (/\w/.test(string.substr(x-1, 1))) x--;
        // let y = selectionStart;
        // while (/\w/.test(string.substr(y, 1))) y++;
        // let f = string.substring(x, y);
        // if (f.length > 2)
        //     for(let i in FUNCTIONS) if (FUNCTIONS.hasOwnProperty(i)) if (i.includes(f) && i !== f)
        //         this.hints.suggestedFunctions.push(i);
        //
        // let function_regex2 = new RegExp(function_regex, "g");
        // for (let m = function_regex2.exec(string); m !== null; m = function_regex2.exec(string)) {
        //     let fn = m[0].slice(0, -1);
        //     let fnStart = m.index + m[0].length;
        //     let fnStop = m.index + m[0].length;
        //     let arg = 0;
        //     for (let brackets = 1; brackets > 0 && fnStop < selectionStart; fnStop++) {
        //         if (brackets === 1 && string[fnStop] === "," && fnStop < selectionStart)
        //             arg++;
        //         else if ("([{".includes(string[fnStop]))
        //             brackets++;
        //         else if (")]}".includes(string[fnStop]))
        //             brackets--;
        //         if (brackets === 0)
        //             arg = -1;
        //     }
        //     if (m.index <= selectionStart && selectionStart < m.index + m[0].length)
        //         this.hints.selectedFunction = fn;
        //     else if (fnStart <= selectionStart && arg >= 0)
        //         this.hints.currentFunctions.push([fn, arg]);
        // }
        // this.setState({hints: this.hints});
        // todo
    }

    getHints(): ReactElement {
        // let str = [];
        //
        // let {hints} = this.state;
        // hints.functions = [];
        // for (let i = 0; i < hints.currentFunctions.length; i++) {
        // 	let fn = hints.currentFunctions[i];
        // 	let args = FUNCTIONS[fn[0]][3].split(",").map(x => x.trim());
        // 	// noinspection CheckTagEmptyBody
        // 	args[fn[1]] = <strong style={{color: '#399103'}}>{args[fn[1]]}</strong>;
        // 	str.push(
        // 	    <Fragment>
        //             {fn[0]}({args.map((x, y) => (
        //                 <Fragment>
        //                     {y === 0 ? null : ', '}{x}
        //                 </Fragment>
        //             ))})
        // 	    </Fragment>
        //     );
        // 	hints.functions = hints.functions.filter(x => x !== fn[0])
        // }
        //
        // if (hints.selectedFunction !== "") {  // Adds a function to the list if the cursor was on the title
        // 	// noinspection CheckTagEmptyBody
        //     str.push(
        //         <Fragment>
        //             {hints.selectedFunction}
        //             (<span style={{color: '#399103'}}>{FUNCTIONS[hints.selectedFunction][3]}</span>)
        //         </Fragment>
        //     );
        // }
        //
        // return (
        //     <Fragment>
        //         {str.map((x, y) => (
        //             <Fragment key={y}>
        //                 <br/>
        //                 {x}
        //             </Fragment>
        //         ))}
        //         {hints.functions.map(x => (
        //             <Fragment>
        //                 <br/>
        //                 {x}({FUNCTIONS[x][3]})
        //             </Fragment>
        //         ))}
        //         <br/>
        //         {hints.suggestedFunctions.join(', ')}
        //     </Fragment>
        // );
        return <span />; // todo
    }
}
