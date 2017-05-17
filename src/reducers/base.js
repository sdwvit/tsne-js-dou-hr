import composeMerge from './composeMerge';
import getStateDiff from './getStateDiff';

const defaultState = {
	perplexity: 30,
	epsilon: 10,
	delimiter: ',',
	labels: '',
	data: '',
	steps: 1000,
	inProgress: false,
};

const base = (state = defaultState, action = { type: '' }) => {
	const merge = composeMerge(state);
	const stateDiff = getStateDiff(action);
	return merge(stateDiff);
};

export default base;
