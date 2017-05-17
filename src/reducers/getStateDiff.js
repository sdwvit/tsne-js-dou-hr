import { LOCATION_CHANGE } from 'react-router-redux';
import { actions } from '../actions/';

export default function getStateDiff(action) {
	switch (action.type) {
		case (LOCATION_CHANGE): {
			return {};
		}
		default: {
			return { ...action.payload };
		}
	}
}
