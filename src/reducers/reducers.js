import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import base from './base';

const reducers = combineReducers({
	routing: routerReducer,
	base,
});

export default reducers;
