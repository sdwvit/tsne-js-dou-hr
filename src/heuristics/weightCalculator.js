import weights from './weights';

export default function calculateWeight(column, value) {
	if (weights[column] && value) {
		try {
			return weights[column](value);
		} catch (e) {
			console.error(`Error: ${e}\nDetails:\nColumn: ${column}\nValue: ${value}`);
		}
	}
	return 0.0;
}
