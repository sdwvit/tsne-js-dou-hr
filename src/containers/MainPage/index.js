import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import getActionObject from '../../actions';
import preProcessLabels from './preProcessLabels';
import initEmbedding from './initEmbedding';
import runStep from './runStep';
import preProcessData from './preprocessData';
import fetchDefault from './fetchDefault';

import { drawEmbedding } from './controls';

class MainPage extends React.Component {
	constructor(props) {
		super();
		this.props = props;
		initEmbedding();
		fetchDefault(props.emit).then(() => {
			const { data, labels, epsilon, perplexity, delimiter } = this.props;
			const rawData = preProcessData(data, delimiter);
			const rawLabels = preProcessLabels(labels, delimiter);

			const opt = {
				epsilon,
				perplexity,
				dim: rawData[0].length,
			};
			this.tsne = new window.tsnejs.tSNE(opt);
			this.tsne.initDataRaw(rawData);
			drawEmbedding(rawData, rawLabels);
			this.run();
		});
	}

	run() {
		const { emit } = this.props;
		emit({ interval: setInterval(runStep, window.cost || 10, this.tsne) });
	}

	render() {
		const {
			perplexity,
			epsilon,
			delimiter,
			data,
			labels,
			emit,
			inProgress,
		} = this.props;
		window.inProgress = inProgress;
		// noinspection Eslint
		return (
			<div>
				<div className="container">
					<h1>t-SNE</h1>
					<div>
						Paste your data in CSV format in the Data text box below to embed it with
						t-SNE
						in two dimensions. Each row corresponds to a datapoint. You can choose to
						associate a label with each datapoint (it will be shown as text next to its
						embedding), and also a group (each group will have its own color in the
						embedding) (Group not yet implemented). The data can be specified either as
						an
						NxD matrix (N = number of datapoints, one per row, D = number of features),
						in
						which case a gaussian kernel will be used to compute their distances.
						Alternatively you can also input some distance matrix yourself.

						<br /><br />
						Make sure you play with the <b>perplexity</b>, which is data specific. The
						perplexity is roughly speaking the number of points (note, it must be
						integer)
						that each point considers to be its neighbors while it is being embedded.
						High
						perplexities therefore enforce more global structure in the embedding, and
						smaller perplexities will cut up your data cloud on much finer level.
					</div>
				</div>

				<div className="container">
					<hr />
					<b>(optional) Text labels:</b><br />
					<textarea onChange={e => emit({ labels: e.target.value })} value={labels}>
						{labels}
					</textarea><br />
				</div>

				<div className="container">
					<hr />
					<b>Data:</b><br />
					<textarea onChange={e => emit({ data: e.target.value })} value={data}>
						{data}
					</textarea><br />
				</div>

				<div className="container">
					<div className="row">
						<div className="col-sm-12">
							Delimiter (default is comma (CSV)):
							<input maxLength="3" value={delimiter} onChange={e => emit({ delimiter: e.target.value })} /><br />
							Learning rate:
							<input maxLength="10" value={epsilon} onChange={e => emit({ epsilon: parseFloat(e.target.value) })} /><br />
							Perplexity:
							<input maxLength="10" value={perplexity} onChange={e => emit({ perplexity: parseFloat(e.target.value) })} /><br />
						</div>
					</div>
				</div>

				<div className="container">
					<button className="btn btn-primary" onClick={() => emit({ inProgress: true })}>Run t-SNE!</button>
					<button className="btn btn-danger" onClick={() => emit({ inProgress: false })}>
						Stop
					</button>
					<br />
				</div>
			</div>
		);
	}
}

MainPage.propTypes = {
	inProgress: PropTypes.bool,
	perplexity: PropTypes.number,
	epsilon: PropTypes.number,
	delimiter: PropTypes.string,
	data: PropTypes.string,
	labels: PropTypes.string,
	emit: PropTypes.func,
};

const mapStateToProps = ({ base }) => ({
	perplexity: base.perplexity,
	epsilon: base.epsilon,
	delimiter: base.delimiter,
	labels: base.labels,
	data: base.data,
	inProgress: base.inProgress,
});

const mapDispatchToProps = fire => ({
	...(actions => actions.reduce((mem, a) =>
		(mem[a] = (data, cb) => (cb && cb(fire)) || fire(getActionObject(a)(data))) && mem, {})
	)([
		'emit',
	]),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);
