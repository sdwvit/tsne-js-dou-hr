import ReactDOM from 'react-dom';

import router from './router';
import './index.html';
import '../assets/tsne';

function renderRouter() {
	ReactDOM.render(router, document.getElementById('diplom'));
}

renderRouter();
