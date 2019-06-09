import { combineReducers } from 'redux';
import { reducerAccount } from "./reducerAccount";
import { createTest } from "./createTest";

export default combineReducers({
  account: reducerAccount,
  createTest: createTest,

})