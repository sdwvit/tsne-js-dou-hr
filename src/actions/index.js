export default function getActionObject(action) {
	return payload => ({
		type: action,
		payload,
	});
}
