export default function preProData(data, delimiter) {
	return data
		.split('\n')
		.reduce((mem, row) => (row && mem.push(row
			.split(delimiter)
			.reduce((meme, cell) => meme
				.push(parseFloat(cell))
			&& meme, []))
		&& mem) || mem, []);
}
