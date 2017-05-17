let plot;
let tx = 0;
let ty = 0;
let ss = 1;
let lastData;

export function updateEmbedding(tsne) {
	// get current solution
	lastData = tsne.getSolution();
}

export function transformPlot() {
	if (lastData) {
		// Y - точки, ss - зум, тх - зсув по осі 0Х, 400 - просто зсув, ty - зсув по осі ОУ
		plot.attr('transform', (d, i) => `translate(${lastData[i][0] * 20 * ss + tx + 400},${lastData[i][1] * 20 * ss + ty + 400})`);
	}
}

export function zoomHandler() {
	tx = window.d3.event.translate[0];
	ty = window.d3.event.translate[1];
	ss = window.d3.event.scale;
}

export function drawEmbedding(data, labels = []) {
	plot = window.svg.selectAll('.b')
		.data(data)
		.enter().append('g')
		.attr('class', 'u');

	plot.append('circle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', 5)
		.attr('stroke-width', 1)
		.attr('stroke', 'black')
		.attr('fill', 'rgb(100,100,255)');

	if (labels.length > 0) {
		plot.append('text')
			.attr('text-anchor', 'top')
			.attr('transform', 'translate(5, -5)')
			.attr('font-size', 12)
			.attr('fill', '#333')
			.text((d, i) => labels[i]);
	}

	const zoomListener = window.d3.behavior.zoom()
		.scaleExtent([0.1, 10])
		.center([0, 0])
		.on('zoom', zoomHandler);
	zoomListener(window.svg);
}
