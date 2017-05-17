import { MainPage } from '../containers';
import { Error404 } from '../components';

export const DEFAULT = {
	path: 'diploma',
	name: 'Main page',
	component: MainPage,
};

export default ([
	DEFAULT,
	{
		path: '*',
		name: 'The 404 page',
		component: Error404,
	},
]);

