/* This Middleware will console.log each action and the new state */
const logger = (store) => (next) => (action) => {
    console.group(action.type); // places the log into a group
        console.log('The action: ', action);
        const returnValue = next(action);  // call to get new state and later return this later
        console.log('The new state: ', store.getState());
    console.groupEnd();
    return returnValue; // returns the next Middleware
};

export default logger