// CREATE_OBJECT PHASE: | Create Matrix |
export const CONST_CREATE_OBJECT = 1;
// SELECT_DIMENSION: Size of rows: ___________, Size of Columns: ______________ | Input Values |
export const CONST_SELECT_DIMENSION = 2;
// INPUT PHASE: ______  ______ _______ , ________  ________ __________ | Submit |
export const CONST_INPUT_PHASE = 3;
// SHOW OBJECT: | 1 2 3 | but in latex and in the correct orientation, there should also be a remove button
export const CONST_SHOW_OBJECT = 4;

// These are the values which we should expect from the server indicating which type it is
export const CONST_BOOLEAN = '0';
export const CONST_MULTIPLE_CHOICE = '1';
export const CONST_NUMBER = '2';
export const CONST_LINEAR_EXPRESSION = '3';
export const CONST_MANUAL_INPUT = '4';
export const CONST_MANUAL_INPUT_POLYNOMIAL = '5';
export const CONST_VECTOR = '6';
export const CONST_VECTOR_HORIZONTAL = '5';
export const CONST_VECTOR_LINEAR_EXPRESSION = '7';
export const CONST_MATRIX = '8';
export const CONST_BASIS = '9';
