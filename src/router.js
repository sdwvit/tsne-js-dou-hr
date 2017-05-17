import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

import routes from './config/router';
import reducers from './reducers/reducers';
import configureStore from './store/configureStore';

import { RedirectToDefault } from './containers/';

function getRoute(module) {
	return <Route key={module.path} {...module} />;
}
const store = configureStore(reducers);

export default (
	<Provider store={store}>
		<Router history={syncHistoryWithStore(browserHistory, store)}>
			<div>
				<Route path="/" component={RedirectToDefault} />
				{routes.map(getRoute)}
			</div>
		</Router>
	</Provider>
);
