import { combineReducers } from 'redux';
import { account } from "./account";
import { makeTest } from "./makeTest";

export default combineReducers({
  account: account,
  makeTest: makeTest,

})