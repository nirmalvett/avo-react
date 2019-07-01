import { combineReducers } from 'redux';
import { reducerAccount } from "./reducerAccount";
import { ReducerCreateTest } from "./reducerCreateTest";

export default combineReducers({
  account: reducerAccount,
  createTest: ReducerCreateTest,

})