import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import { DEFAULT } from '../../config/router';

const RedirectToDefault = ({ setDefaultPage }) => ({
	componentDidMount: setDefaultPage,
	render: () => null,
});

RedirectToDefault.propTypes = {
	setDefaultPage: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({
	setDefaultPage: () => {
		browserHistory.push(`/${DEFAULT.path}`);
	},
});

export default connect(mapStateToProps, mapDispatchToProps)(RedirectToDefault);
