export default function preProLabels(labels) {
	return labels.split('\n').reduce((mem, row) => (row && mem.push(row) && mem) || mem, []);
}
