export default function initEmbedding() {
	window.$('#embed').empty();
	const div = window.d3.select('#embed');
	window.svg = div.append('svg') // svg is global
		.attr('width', 1140)
		.attr('height', 1140);
}
