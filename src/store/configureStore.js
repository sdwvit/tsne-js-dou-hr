import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promise from 'redux-promise-middleware';
import createLogger from 'redux-logger';

export default applyMiddleware(thunkMiddleware, promise(), createLogger())(createStore);
