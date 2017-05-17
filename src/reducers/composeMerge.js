export default function composeMerge(oldState) {
	return newState => Object.assign({}, oldState, newState);
}
