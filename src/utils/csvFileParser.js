const objPattern = delimiter => new RegExp(
	(
		`(\\${delimiter}|\\r?\
|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\${delimiter}\\r\
]*))`
	),
	'gi'
);

const quoted = new RegExp('""', 'g');

export default function parseCsv(file, delimiter = ',') {
	const toReturn = [[]];

	let arrMatches;

	while (arrMatches = objPattern(delimiter).exec(file)) {
		const strMatchedDelimiter = arrMatches[1];
		if (strMatchedDelimiter.length && strMatchedDelimiter !== delimiter) {
			toReturn.push([]);
		}

		let strMatchedValue;
		if (arrMatches[2]) {
			strMatchedValue = arrMatches[2].replace(quoted, '"');
		} else {
			strMatchedValue = arrMatches[3];
		}

		toReturn[toReturn.length - 1].push(strMatchedValue);
	}

	return toReturn;
}
