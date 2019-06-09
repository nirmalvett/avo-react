import { combineReducers } from 'redux';
import { account } from "./account";
import { createTest } from "./createTest";

export default combineReducers({
  account: account,
  makeTest: createTest,

})