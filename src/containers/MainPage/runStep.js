import { updateEmbedding, transformPlot } from './controls';

export default function runStep(tsne) {
	if (window.inProgress) {
		window.cost = tsne.step(); // do a few steps
		updateEmbedding(tsne);
	}
	transformPlot();
}
