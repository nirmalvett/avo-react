import React from 'react';
import TextField from "@material-ui/core/TextField/TextField";
import Button from '@material-ui/core/Button';
import { getMathJax, validateMatrix, validateNumber, validateVector } from '../Utilities';
import Grid from '@material-ui/core/Grid/Grid';
import { copy } from "../Utilities";
import {
	CONST_CREATE_OBJECT, CONST_INPUT_PHASE, CONST_SHOW_OBJECT, CONST_SELECT_DIMENSION, CONST_VECTOR,
	CONST_VECTOR_LINEAR_EXPRESSION, CONST_BASIS, CONST_BOOLEAN, CONST_LINEAR_EXPRESSION, CONST_MANUAL_INPUT,
	CONST_MANUAL_INPUT_POLYNOMIAL, CONST_MATRIX, CONST_MULTIPLE_CHOICE, CONST_NUMBER, CONST_VECTOR_HORIZONTAL
} from "./InputConsts";
import { DeleteOutlined, Add } from '@material-ui/icons'
import {
	IconButton,

} from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import { objectSize } from "../helpers";
import Typography from '@material-ui/core/Typography/Typography';
import Tooltip from '@material-ui/core/Tooltip';


// This is a link that basically says need help inputting an answer? And links to a google doc
function inputAnswerHelp() {
	return (
		<a
			href="https://docs.google.com/document/d/1m46sbpWg2oTZ4kaQoiy1HYkpc_BgOye9y8mhhUSHi20/edit?usp=sharing"
			target="_blank">
			<u color="primary">
				<Typography component={'span'} variant='body1'>
					Need help inputting an answer? Click Here.
					</Typography>
			</u>
		</a>

	)
}

// ====================== The four phases which this component goes through ======================
// CREATE OBJECT PHASE: | Create Matrix |
// SELECT DIMENSION: Size of rows: ___________, Size of Columns: ______________ | Input Values |
// INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
// SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
const vectorSizeLimit = 5;
const matrixRowLimit = 5;
const matrixColLimit = 5;
export default class ButtonInputHorizontalVector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			stage: CONST_CREATE_OBJECT,
			vectorSize: '',
			matrixColLength: '',
			matrixRowLength: '',
			dimensionStorage: {}, // [1,2] if vector, [1,2;3,4] if matrix
			type: this.props.type, // this is the type of the input itself,
			message: '',
			totalFields: -1, // this should be an int where a 3 by 3 matrix is 9 fields that a student must fill,
			disabled: this.props.disabled, // if true then the starting input should be disabled,
			previousAnswer: this.props.value, // if there is an answer from the student then we want to show it
			dataForServer: '',
			latexString: '',
			prompt: this.props.prompt,
			dynamicVectorInputs: [0],
			dynamicVectorIDs: 0,
		};
	}

	resetAll() {
		// This method resets the state back to the initial one and should be used once and then whenever user clicks clear
		this.setState({
			stage: CONST_CREATE_OBJECT,
			vectorSize: '',
			matrixColLength: '',
			matrixRowLength: '',
			dimensionStorage: {}, // [1,2] if vector, [1,2;3,4] if matrix
			type: this.props.type, // this is the type of the input itself,
			message: '',
			totalFields: -1, // this should be an int where a 3 by 3 matrix is 9 fields that a student must fill,
			disabled: this.props.disabled, // if true then the starting input should be disabled,
			previousAnswer: "", // set this to empty if it's been reset
			dataForServer: '',
			latexString: '',
			dynamicVectorInputs: [0],
			dynamicVectorIDs: 0,
		});

	}

	componentDidMount() {
		// We want to consider whether there is already an answer.
		// If there is then we want to switch to show object
		if (this.props.value !== "" && this.props.value !== undefined && this.props.value !== null) {
			this.setState({ stage: CONST_SHOW_OBJECT });
		}
	}

	render() {

		const { stage, prompt } = this.state;
		return (
			<div>
				{
					// If there is no prompt then don't display anything otherwise display the latex this is supposed to
					// be the prompt before each answer field
					prompt === undefined || prompt === null || prompt === ""
						? null
						: getMathJax(prompt)
				}

				{
					stage === CONST_CREATE_OBJECT
						? this.createObject() // if True then render create object button i.e. "Create Vector"
						: stage === CONST_SELECT_DIMENSION
							? this.selectDimension() // if True then render dimensions selector i.e. "Row: _____ Column: _______"
							: stage === CONST_INPUT_PHASE
								? this.inputPhase() // If True then render fields for the student to fill in
								: stage === CONST_SHOW_OBJECT
									? this.showObject() //If true then show the answer in latex
									: null
				}
				<br />
				{
					<Typography color='error'>{this.state.message}</Typography>
				}
				<br />
				{inputAnswerHelp()}


			</div>

		)

	}

	renderServerToLatex() {
		// takes the values from server and renders them into latex String
		const { type, previousAnswer } = this.state;
		if (previousAnswer === undefined || previousAnswer.length === 0) {
			return "";
		}
		if (type === CONST_VECTOR || type === CONST_VECTOR_LINEAR_EXPRESSION) {
			const vector = validateVector(previousAnswer);
			return Array.isArray(vector)
				? '\\(\\begin{bmatrix}' + vector.join('\\\\') + '\\end{bmatrix}\\)'
				: '\\(\\begin{bmatrix}' + previousAnswer.split(",").join('\\\\') + '\\end{bmatrix}\\)'
		} else if (type === CONST_MATRIX) {
			const matrix = validateMatrix(previousAnswer);
			return Array.isArray(matrix)
				? '\\(\\begin{bmatrix}' + matrix.map(x => x.join('&')).join('\\\\') + '\\end{bmatrix}\\)'
				: '\\(\\begin{bmatrix}' + stringToMatrixArray(previousAnswer).map(x => x.join('&')).join('\\\\') + '\\end{bmatrix}\\)'
		} else if (type === CONST_BASIS) {
			let basis = validateMatrix(previousAnswer);
			// Takes server form of a basis and transforms it into latex form
			return Array.isArray(basis)
				? '\\(\\left\\{' + basis.map(x => '\\begin{bmatrix}' + x.join('\\\\') + '\\end{bmatrix}').join(',') + '\\right\\}\\)'
				: '\\(\\left\\{' + stringToBasisArray(previousAnswer).map(x => '\\begin{bmatrix}' + x.join('\\\\') + '\\end{bmatrix}').join(',') + '\\right\\}\\)';
		} else {
			return ""
		}
	}

	// ================================== General Four Phases ===========================================
	createObject() {
		const { type, disabled } = this.state;
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				<br />
				{
					type === CONST_VECTOR
						? this.vectorCreateObject()
						: type === CONST_MATRIX
							? this.matrixCreateObject()
							: type === CONST_BASIS
								? this.basisCreateObject()
								: type === CONST_VECTOR_HORIZONTAL
									? this.vectorCreateObject()
									: null
				}
				<br /><br />
				{ // This condition occurs iff it's a view where a teacher is creating a test or it's a post test
					disabled === true
						? getMathJax(this.renderServerToLatex(), 'body2')
						: null
				}

			</Grid>
		)
	}

	selectDimension() {
		const { type } = this.state;
		if (type === CONST_VECTOR) {
			return this.vectorSelectDimension();
		} else if (type === CONST_MATRIX) {
			return this.matrixSelectDimension();
		} else if (type === CONST_BASIS) {
			return this.basisSelectDimension();
		}
	}

	inputPhase() {
		const { type } = this.state;
		if (type === CONST_VECTOR) {
			return this.vectorInputPhase();
		} else if (type === CONST_MATRIX) {
			return this.matrixInputPhase();
		} else if (type === CONST_BASIS) {
			return this.basisInputPhase();
		}
	}

	showObject() {
		const { type, previousAnswer } = this.state;
		// CASE 0: We have a previous answer so just process it and display it
		if (previousAnswer !== "") {
			return (
				<Grid container
					direction="column"
					justify="center"
					alignItems="center">
					{getMathJax(this.renderServerToLatex(), 'body2')}
					<br /> <br />
					{this.clearAnswerButton()}
				</Grid>
			)
		}
		// CASE 1: We are arriving here because the user filled the fields
		if (type === CONST_VECTOR) {
			return this.vectorShowObject();
		} else if (type === CONST_MATRIX) {
			return this.matrixShowObject();
		} else if (type === CONST_BASIS) {
			return this.basisShowObject()
		}
	}

	clearAnswerButton() {
		// depending on different answer types it will say Clear Answer differently.
		// So for a matrix it should say Clear Matrix Answer
		const { type, disabled } = this.state;
		let buttonText = "Clear Answer";
		if (type === CONST_BASIS) {
			buttonText = "Clear Basis Answer"
		} else if (type === CONST_MATRIX) {
			buttonText = "Clear Matrix Answer"
		} else if (type === CONST_VECTOR_LINEAR_EXPRESSION) {
			buttonText = "Clear Vector Answer"
		} else if (type === CONST_VECTOR) {
			buttonText = "Clear Vector Answer"
		} else (console.warn("clearAnswerButton(), type: " + type + " not accounted for in logic"));
		return (
			<Tooltip title="Clear this answer to start again">
				<Button
					variant="extendedFab"
					color="primary"
					aria-label="Delete"
					onClick={() => this.resetAll()}
					disabled={disabled}
				>
					{buttonText}
				</Button>
			</Tooltip>

		)
	}

	// ================================== Vector Input Logic ===========================================
	// "1,2,3,4" is the expected format to send to the server
	vectorCreateObject() {
		//  CREATE OBJECT PHASE: | Create Matrix |
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				{/*<br/>*/}
				<Tooltip title="Begin creating a vector answer">
					<Button
						disabled={this.state.disabled}
						variant="extendedFab"
						color="primary"
						onClick={() => this.setState({ stage: CONST_INPUT_PHASE })}
					>
						Create Vector
					</Button>
				</Tooltip>


			</Grid>
		)
	}

	vectorSelectDimension() {
		// SELECT DIMENSION: Size of Rows: ___________, Size of Columns: ______________ | Input Values |
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				<TextField
					label='Vector size/component.'
					value={this.state.vectorSize}
					onChange={(e) => this.handleVectorSize(e)} />
				<br />

				<Button
					variant="extendedFab"
					color="primary"
					onClick={(e) => this.handleVectorDimensionSubmit(e)}
				>
					Confirm Dimension
					</Button>
			</Grid>
		)
	}

	vectorInputPhase() {
		// INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
		const numberOfFields = this.state.vectorSize; // given by previous input
		const uniqueIds = []; // create an array of ids which we can use to map
		const stateObject = {}; // We need something to hold all the input values in the state
		const MAX_VECTOR_SIZE = 5;
		for (let i = 0; i < numberOfFields; i++) { // for the number of fields we need
			const idName = 'button-input-vector-' + (i);
			uniqueIds.push(idName);
			stateObject[i] = ''; // this will be a blank holder for all the objects
		}
		if (this.state.dimensionStorage === {}) { // We this check otherwise it'll keep wiping the input
			this.state.dimensionStorage = stateObject;
		}

		if (this.state.type == CONST_VECTOR) {
			// this.setState({
			// 	dynamicVectorInputs : [],
			// 	dynamicVectorIDs : 0
			// });
			return (
				<Grid container
					direction="column"
					justify="center"
					alignItems="center">
					<Grid container
						direction="row"
						justify="center"
						alignItems="center">
						<div style={{ float: 'left', paddingRight:'20px' }}><b><h1>[</h1></b></div>
						{ // We're mapping the vector inputs here
							this.state.dynamicVectorInputs.map((idName, index) => {
								return (
									<div style={{ width: '200px' }}>
										<TextField
											id={'vector-Input-:' + idName}
											style={{ float: 'right', paddingLeft:'20px', paddingRight:'20px' }}
											name={`${index}-0`}
											value={this.state.dimensionStorage[index]}
											onChange={(e) => this.handleVectorInput(e)}
											label={`Vector Component ${index + 1}`}
											error={!Array.isArray(validateNumber(this.state.dimensionStorage[index]))}
											helperText={
												!Array.isArray(validateNumber(this.state.dimensionStorage[index]))
													? validateNumber(this.state.dimensionStorage[index])
													: undefined
											}
										/>
										<br />
										<br />
									</div>
								)
							})
						}
						<div style={{ float: 'right' }}><b><h1>]</h1></b></div>
					</Grid>
					<br />
					<div>
						<Tooltip title="Add new vector component" placement="top">
							<IconButton
								variant="extendedFab"
								color="primary"
								onClick={(e) => {
									const newID = this.state.dynamicVectorIDs + 1;
									if (this.state.dynamicVectorInputs.length < MAX_VECTOR_SIZE) {
										const newArr = this.state.dynamicVectorInputs;
										newArr.push(newID);
										this.setState({
											dynamicVectorInputs: newArr,
											dynamicVectorIDs: newID
										});
									}
								}}
							>

								<Add />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete last vector component" placement="top">
							<IconButton color="primary" style={{ float: 'right' }} onClick={() => {
								let newArr = this.state.dynamicVectorInputs;
								newArr = newArr.filter((obj, idx) => {
									return idx != this.state.dynamicVectorInputs.length - 1;
								});
								let newDimensionStorage = this.state.dimensionStorage
								delete newDimensionStorage[(this.state.dynamicVectorInputs.length - 1).toString()]
								this.setState({
									dynamicVectorInputs: newArr,
									dimensionStorage: newDimensionStorage
								});
							}}>
								<DeleteOutlined />
							</IconButton>
						</Tooltip>

					</div>

					<br />
					<Tooltip title="Save vector answer" placement="top">
						<Button
							variant="extendedFab"
							color="primary"
							onClick={(e) => {
								this.handleFinishAnswer(e);
							}}

						>
							Finish Answer
					</Button>
					</Tooltip>

					{/* <br/> */}
					{/* {this.clearAnswerButton()} */}
				</Grid>
			);
		}

		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">

				{ // We're mapping the vector inputs here
					uniqueIds.map((idName, index) => {
						return (
							<div>
								<TextField
									id={idName}
									name={`${index}-0`}
									value={this.state.dimensionStorage[index]}
									onChange={(e) => this.handleVectorInput(e)}
									label={`Vector Parameter ${index + 1}`}
									error={!Array.isArray(validateNumber(this.state.dimensionStorage[index]))}
									helperText={
										!Array.isArray(validateNumber(this.state.dimensionStorage[index]))
											? validateNumber(this.state.dimensionStorage[index])
											: undefined
									}

								/>
								<br />
								<br />
							</div>
						)
					})
				}
				<br />
				<Button
					variant="extendedFab"
					color="primary"
					onClick={(e) => {
						this.handleFinishAnswer(e);
					}}

				>
					Finish Answer
					</Button>
				<br />
				{this.clearAnswerButton()}
			</Grid>
		)
	}

	vectorShowObject() {
		// SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
		// Stores the data in latex and in a form that the server likes
		const { latexString, disabled } = this.state;

		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				{getMathJax(latexString)}

				<br /> <br />
				{this.clearAnswerButton()}
			</Grid>
		)
	}

	handleVectorSize(e) {
		e.preventDefault();
		const value = e.target.value;
		// If the value is nothing then set it back
		if (value === "") {
			this.setState({ vectorSize: "", totalFields: -1 })
		}
		// if only numbers are in the input then update
		else if (value !== "" && RegExp('^[0-9]*$').test(value)) {
			const integerValue = parseInt(value);
			this.setState({ vectorSize: integerValue, totalFields: integerValue })
		}
	}

	handleVectorDimensionSubmit(e) {
		const { totalFields } = this.state;
		if (totalFields <= 0) {
			this.setState({ message: 'You need to indicate a vector size and it must be larger or equal to 1.' })
		} else if (totalFields > vectorSizeLimit) {
			this.setState({ message: 'Your vector size cannot be larger than 5.' })
		} else {
			this.setState({ message: '', stage: CONST_INPUT_PHASE })
		}
	}

	handleVectorInput(e) {
		e.preventDefault();
		const value = replaceImproperValues(e.target.value);
		const name = e.target.name; // if the coordinates are 1, 2 then the string name will be 1-2
		const nameSplit = name.split("-");
		const x_value = parseInt(nameSplit[0]); // this will be the actual index
		const y_value = parseInt(nameSplit[1]); // this will always be set to 0, only here for the sake of reuse
		const dimensionStorage = this.state.dimensionStorage;
		dimensionStorage[x_value] = value;
		this.setState(dimensionStorage);
	}

	// ================================== Matrix Input Logic ===========================================
	// "1,2,3,4" is the expected format to send to the server
	matrixCreateObject() {
		//  CREATE OBJECT PHASE: | Create Matrix |
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				<br />
				<Tooltip title="Begin creating a matrix answer">
					<Button
						disabled={this.state.disabled}
						variant="extendedFab"
						color="primary"
						onClick={() => this.setState({ stage: CONST_SELECT_DIMENSION })}
					>
						Create Matrix
					</Button>
				</Tooltip>

			</Grid>
		)
	}

	matrixSelectDimension() {
		// SELECT DIMENSION: Size of Rows: ___________, Size of Columns: ______________ | Input Values |
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				<TextField
					label='Enter Number of Columns'
					value={this.state.matrixColLength}
					onChange={(e) => this.handleMatrixColLength(e)} />
				<br />
				<TextField
					label='Enter Number of Rows'
					value={this.state.matrixRowLength}
					onChange={(e) => this.handleMatrixRowLength(e)} />
				<br />
				<Button
					variant="extendedFab"
					color="primary"
					onClick={(e) => this.handleMatrixDimensionSubmit(e)}
				>
					Confirm Dimension
					</Button>
				<br />
			</Grid>
		)
	}

	matrixInputPhase() {
		// INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
		const uniqueIds = []; // create an array of ids which we can use to map
		const stateObject = {}; // We need something to hold all the input values in the state
		for (let i = 0; i < this.state.matrixRowLength; i++) { // for the number of fields we need
			const rowName = i;
			const subRowList = [];
			stateObject[rowName] = {}; // this will be a blank holder for all the objects
			for (let inputFieldIndex = 0; inputFieldIndex < this.state.matrixColLength; inputFieldIndex++) {
				stateObject[rowName][inputFieldIndex] = "";
				subRowList.push("matrix-input:" + rowName + "-" + inputFieldIndex);
			}
			uniqueIds.push(subRowList);
		}
		if (objectSize(this.state.dimensionStorage) === 0) { // We this check otherwise it'll keep wiping the input
			this.state.dimensionStorage = stateObject;
		}


		return (

			<Grid container
				direction="column"
				alignItems="center">

				{ // We're mapping the vector inputs here

					uniqueIds.map((rowList, indexRow) => {
						return (
							<Grid container
								direction="row"
								justify="center"

							>
								{
									rowList.map((fieldString, indexColumn) => {
										return (
											<Grid item style={{ margin: '1em' }}>
												<TextField
													id={fieldString}
													name={`${indexRow}-${indexColumn}`}
													value={this.state.dimensionStorage[indexRow][indexColumn]}
													onChange={(e) => this.handleMatrixInput(e)}
													label={`Row:${indexRow + 1}, Col:${indexColumn + 1}`}
													error={!Array.isArray(validateNumber(this.state.dimensionStorage[indexRow][indexColumn]))}
													helperText={
														!Array.isArray(validateNumber(this.state.dimensionStorage[indexRow][indexColumn]))
															? validateNumber(this.state.dimensionStorage[indexRow][indexColumn])
															: undefined
													}

												/>
												<br /><br />
											</Grid>
										)
									})
								}
							</Grid>
						)
					})
				}
				<br />
				<Tooltip title="Save matrix answer" placement="top">
					<Button
						variant="extendedFab"
						color="primary"
						onClick={(e) => {
							this.handleFinishAnswer(e);
						}}

					>
						Finish Answer
					</Button>
				</Tooltip>

				<br />
				{/* {this.clearAnswerButton()} */}
			</Grid>
		)
	}

	matrixShowObject() {
		// SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
		// Stores the data in latex and in a form that the server likes
		const { latexString, disabled } = this.state;

		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				{getMathJax(latexString)}
				<br /> <br />
				{this.clearAnswerButton()}
			</Grid>
		)
	}

	handleMatrixColLength(e) {
		e.preventDefault();
		const value = e.target.value;
		// If the value is nothing then set it back
		if (value === "") {
			this.setState({ matrixColLength: "", totalFields: -1 })
		}
		// if only numbers are in the input then update
		else if (value !== "" && RegExp('^[0-9]*$').test(value)) {
			const integerValue = parseInt(value);
			this.setState({
				matrixColLength: integerValue
			})
		}
	}

	handleMatrixRowLength(e) {
		e.preventDefault();
		const value = e.target.value;
		// If the value is nothing then set it back
		if (value === "") {
			this.setState({ matrixRowLength: "", totalFields: -1 })
		}
		// if only numbers are in the input then update
		else if (value !== "" && RegExp('^[0-9]*$').test(value)) {
			const integerValue = parseInt(value);
			this.setState({ matrixRowLength: integerValue })
		}
	}

	handleMatrixDimensionSubmit(e) {
		e.preventDefault();
		if (this.state.matrixColLength === "" || this.state.matrixRowLength === "") {
			this.setState({
				message: 'Both column and row length must be filled with a number less than or equal to 1.'
			})
		} else if (this.state.matrixColLength > matrixColLimit || this.state.matrixRowLength > matrixRowLimit) {
			this.setState({
				message: 'The row and column length must not be larger than 5.'
			})
		} else {
			this.setState({
				message: '',
				stage: CONST_INPUT_PHASE,
				totalFields: this.state.matrixRowLength * this.state.matrixColLength
			})
		}
	}

	handleMatrixInput(e) {
		e.preventDefault();
		const value = replaceImproperValues(e.target.value); // We don't want users to input comma or newline
		const name = e.target.name; // if the coordinates are 1, 2 then the string name will be 1-2
		const nameSplit = name.split("-");
		const x_value = parseInt(nameSplit[0]); // this will be the actual index
		const y_value = parseInt(nameSplit[1]); // this will always be set to 0, only here for the sake of reuse
		const dimensionStorage = this.state.dimensionStorage;
		dimensionStorage[x_value][y_value] = value;
		this.setState(dimensionStorage);
	}


	// ================================== Basis Input Logic ===========================================
	// "1,2,3,4" is the expected format to send to the server
	basisCreateObject() {
		//  CREATE OBJECT PHASE: | Create Matrix |
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				<br />
				<Tooltip title="Begin creating basis answer">
					<Button
						disabled={this.state.disabled}
						variant="extendedFab"
						color="primary"
						onClick={() => this.setState({ stage: CONST_SELECT_DIMENSION })}
					>
						Create Basis
					</Button>
				</Tooltip>

			</Grid>
		)
	}

	basisSelectDimension() {
		// SELECT DIMENSION: Size of Rows: ___________, Size of Columns: ______________ | Input Values |
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				<TextField
					label='Vector Amount'
					value={this.state.matrixColLength}
					onChange={(e) => this.handleMatrixColLength(e)} />
				<br />
				<TextField
					label='Size of Each Vector'
					value={this.state.matrixRowLength}
					onChange={(e) => this.handleBasisRowLength(e)} />
				<br />
				<Button
					variant="extendedFab"
					color="primary"
					onClick={(e) => this.handleBasisDimensionSubmit(e)}
				>
					Confirm Dimension
					</Button>
				<br />
			</Grid>
		)
	}

	basisInputPhase() {
		// INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
		const uniqueIds = []; // create an array of ids which we can use to map
		const stateObject = {}; // We need something to hold all the input values in the state
		for (let i = 0; i < this.state.matrixRowLength; i++) { // for the number of fields we need
			const rowName = i;
			const subRowList = [];
			stateObject[rowName] = {}; // this will be a blank holder for all the objects
			for (let inputFieldIndex = 0; inputFieldIndex < this.state.matrixColLength; inputFieldIndex++) {
				stateObject[rowName][inputFieldIndex] = "";
				subRowList.push("matrix-input:" + rowName + "-" + inputFieldIndex);
			}
			uniqueIds.push(subRowList);
		}
		if (objectSize(this.state.dimensionStorage) === 0) { // We this check otherwise it'll keep wiping the input
			this.state.dimensionStorage = stateObject;
		}


		return (
			<Grid container
				direction="column"
				alignItems="center">

				{ // We're mapping the vector inputs here

					uniqueIds.map((rowList, indexRow) => {
						return (
							<Grid container
								direction="row"
								justify="center"

							>
								{
									rowList.map((fieldString, indexColumn) => {
										return (
											<Grid
												item
												style={{ padding: 4 }}
											>
												<TextField
													id={fieldString}
													name={`${indexRow}-${indexColumn}`}
													value={this.state.dimensionStorage[indexRow][indexColumn]}
													onChange={(e) => this.handleMatrixInput(e)}
													label={`Vector ${indexColumn + 1}, Parameter ${indexRow + 1}`}
													error={!Array.isArray(validateNumber(this.state.dimensionStorage[indexRow][indexColumn]))}
													helperText={
														!Array.isArray(validateNumber(this.state.dimensionStorage[indexRow][indexColumn]))
															? validateNumber(this.state.dimensionStorage[indexRow][indexColumn])
															: undefined
													}

												/>
												<br /><br />
											</Grid>
										)
									})
								}
							</Grid>
						)
					})
				}
				<br />
				<Tooltip title="Save basis answer">
					<Button
						variant="extendedFab"
						color="primary"
						onClick={(e) => {
							this.handleFinishAnswer(e);
						}}

					>
						Finish Answer
					</Button>
				</Tooltip>

				<br />
				{/* {this.clearAnswerButton()} */}
			</Grid>
		)
	}

	basisShowObject() {

		// SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
		// Stores the data in latex and in a form that the server likes
		const { latexString, disabled } = this.state;
		return (
			<Grid container
				direction="column"
				justify="center"
				alignItems="center">
				{getMathJax(latexString)}
				<br /> <br />
				{this.clearAnswerButton()}
			</Grid>
		)
	}

	handleBasisColLength(e) {
		e.preventDefault();
		const value = e.target.value;
		// If the value is nothing then set it back
		if (value === "") {
			this.setState({ matrixColLength: "", totalFields: -1 })
		}
		// if only numbers are in the input then update
		else if (value !== "" && RegExp('^[0-9]*$').test(value)) {
			const integerValue = parseInt(value);
			this.setState({
				matrixColLength: integerValue
			})
		}
	}

	handleBasisRowLength(e) {
		e.preventDefault();
		const value = e.target.value;
		// If the value is nothing then set it back
		if (value === "") {
			this.setState({ matrixRowLength: "", totalFields: -1 })
		}
		// if only numbers are in the input then update
		else if (value !== "" && RegExp('^[0-9]*$').test(value)) {
			const integerValue = parseInt(value);
			this.setState({ matrixRowLength: integerValue })
		}
	}

	handleBasisDimensionSubmit(e) {
		e.preventDefault();
		if (this.state.matrixColLength === "" || this.state.matrixRowLength === "") {
			this.setState({
				message: 'Both number of vectors and size of each vector must be filled with a number less than or equal to 1.'
			})
		} else if (this.state.matrixColLength > matrixColLimit || this.state.matrixRowLength > matrixRowLimit) {
			this.setState({
				message: 'The number of vectors and size of each vector must not be more than 5.'
			})
		} else {
			this.setState({
				message: '',
				stage: CONST_INPUT_PHASE,
				totalFields: this.state.matrixRowLength * this.state.matrixColLength
			})
		}
	}

	handleBasisInput(e) {
		e.preventDefault();
		const value = replaceImproperValues(e.target.value); // We don't want users to input comma or newline
		const name = e.target.name; // if the coordinates are 1, 2 then the string name will be 1-2
		const nameSplit = name.split("-");
		const x_value = parseInt(nameSplit[0]); // this will be the actual index
		const y_value = parseInt(nameSplit[1]); // this will always be set to 0, only here for the sake of reuse
		const dimensionStorage = this.state.dimensionStorage;
		dimensionStorage[x_value][y_value] = value;
		this.setState(dimensionStorage);
	}


	// ==================================== Global Methods ==============================================
	handleFinishAnswer(e) {
		e.preventDefault();
		// CASE 0: The user did not give any inputs or one of the inputs is missing
		if (!this.allFieldsFilled()) {
			this.setState({ message: 'Looks like you forget to fill in a field.', })
		}
		// CASE 1: We can go ahead and show the object compiled
		else {
			this.parseAnswerForLatexServer();
			const { dataForServer } = this.state;
			if (dataForServer !== "") { // We only want to send it to the server if it's not an empty String
				this.props.buttonSave(this.state.dataForServer);
			}


			this.setState({ stage: CONST_SHOW_OBJECT, message: '' })
		}
	}

	parseAnswerForLatexServer() {
		// sets dataForServer: '', latexString: '', in state where dataForServer is what we want to send and latexString
		// is what we display
		const { dimensionStorage, type } = this.state;
		// CASE 0: Vector input
		if (type === CONST_VECTOR || type === CONST_VECTOR_LINEAR_EXPRESSION) {
			const vectorParsed = this.parseVector(dimensionStorage, " \\\\ ");
			this.state.latexString = this.latexMatrix(vectorParsed.latexString);
			this.state.dataForServer = vectorParsed.dataForServer;
		} else if (type === CONST_MATRIX) {
			let matrixLatex = ""; // Now we just we just need to accumulate the vector latex to show students
			let dataForServer = ""; // this is for the server

			const keyArray = Object.keys(dimensionStorage);
			for (let i = 0; i < keyArray.length; i++) {
				const key = keyArray[i];
				const rowVector = dimensionStorage[key];
				const parsedVector = this.parseVector(rowVector, " & ");
				if (i !== keyArray.length - 1) {
					matrixLatex += parsedVector.latexString + " \\\\ ";
					dataForServer += parsedVector.dataForServer + "\n";
				} else {
					matrixLatex += parsedVector.latexString;
					dataForServer += parsedVector.dataForServer;
				}
			}
			this.state.latexString = this.latexMatrix(matrixLatex);
			this.state.dataForServer = dataForServer;
		} else if (type === CONST_BASIS) {
			let matrixLatex = ""; // Now we just we just need to accumulate the vector latex to show students
			let dataForServer = ""; // this is for the server

			const keyArray = Object.keys(dimensionStorage);
			for (let i = 0; i < keyArray.length; i++) {
				const key = keyArray[i];
				const rowVector = dimensionStorage[key];
				const parsedVector = this.parseVector(rowVector, " & ");
				if (i !== keyArray.length - 1) {
					matrixLatex += parsedVector.latexString + " \\\\ ";
					dataForServer += parsedVector.dataForServer + "\n";
				} else {
					matrixLatex += parsedVector.latexString;
					dataForServer += parsedVector.dataForServer;
				}
			}
			const transposedString = transposeStringMatrix(dataForServer);


			this.state.latexString = serverToBasisLatex(transposedString);
			this.state.dataForServer = transposedString;
		} else {
			alert("Warning! ButtonInput type not implemented in method parseAnswerForLatexServer(), type: " + type)
		}
	}

	parseVector(inputObj, latexSeperator) {
		// inputObj: {0:1, 1:2} representing the vector [1,2]
		// latexSeperator: either & for matrix or \\\\ for vector
		// Output: {latexString: "1 \\\\ 2" , dataForServer: "1,2"]
		// latexString is for latex display what's missing is the "\\(\\begin{bmatrix}" and the end "\\end{bmatrix}\\)"
		// dataForServer which is for the server what's missing is that the final needs to be wrapped in a list
		// this method does not include these things so that it can used for vector and for matrix parsing
		let vectorLatex = ""; // Now we just we just need to accumulate the vector latex to show students
		let dataForServer = ""; // this is for the server

		const keyArray = Object.keys(inputObj);
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			const value = inputObj[key];
			if (typeof value !== "string") {
				continue;
			} // if it's not a string then skip it

			if (i !== keyArray.length - 1) { // add comma after it
				vectorLatex += value + latexSeperator;
				dataForServer += value + ",";
			} else { // it's the last one so don't add anything
				vectorLatex += value;
				dataForServer += value;
			}
		}
		return {
			latexString: vectorLatex,
			dataForServer: dataForServer
		}

	}

	latexMatrix(stringInput) {
		// Input: "1 //// 2"
		// output: "\\(\\begin{bmatrix} 1 //// 2 \end{bmatrix}\)"
		return "\\(\\begin{bmatrix}" + stringInput + "\\end{bmatrix}\\)";
	}

	allFieldsFilled() {
		const { dimensionStorage, totalFields, type, matrixColLength, matrixRowLength } = this.state;
		// CASE 0: It's a vector and the user did not input any object or it's not the right size
		if (type === CONST_VECTOR || type === CONST_VECTOR_LINEAR_EXPRESSION) {
			const objectSizeInt = objectSize(dimensionStorage);
			if (objectSizeInt === 0 || objectSizeInt !== this.state.dynamicVectorInputs.length) {
				return false;
			}
		}
		// CASE 1: It's a Matrix or Basis and the user did not input any object or it's not the right size
		else {
			const rowSize = objectSize(dimensionStorage);
			// CASE 1.1 the number of rows don't match the number expected
			if (matrixRowLength !== rowSize) {
				return false
			}
			// Now we check for each entity in each row if the number matches
			for (let x in dimensionStorage) {
				if (!dimensionStorage.hasOwnProperty(x)) continue;// skip loop if the property is from prototype
				const numberOfEntriesInRow = objectSize(dimensionStorage[x]);
				if (numberOfEntriesInRow !== matrixColLength) {
					return false;
				}
			}
		}

		// Checks if all the fields are filled
		for (let x in dimensionStorage) {
			if (!dimensionStorage.hasOwnProperty(x)) continue;// skip loop if the property is from prototype
			const currentObject = dimensionStorage[x];
			// CASE 1: It's a vector so we just check the first level
			if (typeof currentObject === "string" && currentObject === "") {
				return false;
			}
			// CASE 2: It's a Matrix or Basis so we need to check the values inside of it
			else {
				for (let y in currentObject) {
					if (!currentObject.hasOwnProperty(y)) continue;// skip loop if the property is from prototype
					const secondLevelObject = currentObject[y];
					if (secondLevelObject === "") {
						return false;
					}
				}
			}
		}
		return true;
	}

}

function transposeStringMatrix(inputString) {
	// Takes something like "1,2/n3,4" and makes it into "1,3/n2,4
	let transposedForServer = "";
	const rowsArray = inputString.split("\n"); // ["1,4", "2,5", "3,6"]
	const vectorNumber = rowsArray.length; // the number of vectors is the number of columns
	const vectorLength = rowsArray[0].split(",").length;
	for (let vectorPart_i = 0; vectorPart_i < vectorLength; vectorPart_i++) {
		for (let vectorNumber_i = 0; vectorNumber_i < vectorNumber; vectorNumber_i++) { // For each vector
			// we go through each to get the value
			// console.log("x: " + x + ", j: " + j + ", rowsArray[j].split(\",\")[x]： " + rowsArray[j].split(",")[x] );
			// So we would for example be grabbing all the values for the first row
			const currentVector = rowsArray[vectorNumber_i].split(",");
			const currentParameter = currentVector[vectorPart_i];
			transposedForServer += currentParameter;
			if (vectorNumber_i !== vectorNumber - 1) {
				transposedForServer += ",";
			}
		}
		if (vectorPart_i != vectorLength - 1) { // add delimiter for new line
			transposedForServer += "\n"
		}
	}
	return transposedForServer;
}

function serverToBasisLatex(input) {
	let basis = validateMatrix(input);
	// Takes server form of a basis and transforms it into latex form
	return Array.isArray(basis)
		? '\\(\\left\\{' + basis.map(x => '\\begin{bmatrix}' + x.join('\\\\') + '\\end{bmatrix}').join(',') + '\\right\\}\\)'
		: '\\(\\left\\{' + stringToBasisArray(input).map(x => '\\begin{bmatrix}' + x.join('\\\\') + '\\end{bmatrix}').join(',') + '\\right\\}\\)';
}

function replaceImproperValues(input) {
	return input.replace(",", "")
		.replace("\n", "")
		.replace("%", "")
		.replace("\\", "")
		.replace("#", "")
		.replace("$", "")
		.replace("%", "")
		.replace("&", "")
		.replace("{", "")
		.replace("}", "")
		.replace("@", "")
		.replace("^^", "^")
		.replace("!", "")
		.replace("//", "/")
		.replace("~", ""); // We don't want users to input comma or newline
}

function stringToMatrixArray(input) {
	const finalList = [];
	const splitByNewLine = input.split("\n");
	if (splitByNewLine.length === 0) {
		return ["Invalid Matrix"]
	} else {
		for (let i = 0; i < splitByNewLine.length; i++) {
			finalList.push(splitByNewLine[i].split(","))
		}
	}
	return finalList;
}

function stringToBasisArray(input) {
	return stringToMatrixArray(input);
}
