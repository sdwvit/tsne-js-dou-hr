const numberOfReferences = 1;
const length = 1000;

function getLabel(_, i) {
	if (i < numberOfReferences) {
		return `Еталонний кандидат № ${i + 1} / ${numberOfReferences}`;
	}
	return i;
}

export default function fetchData(cb) {
	return Promise.all([
		fetch('/data/2015_may_final.csv').then(r => r.text()).then(r => {
			const data = r.split('\n').slice(0, length).join('\n');
			cb({ data });
			cb({ labels: [...new Array(length)].map(getLabel).join('\n') });
		}),
		//fetch('/data/0l').then(r => r.text()).then(r => cb({ labels: r })),
	]);
}
