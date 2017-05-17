import React from 'react';

function Error404() {
	return (
		<div>
			Cannot get {window.location.pathname} <br />
			Try <a href="/">going on main page</a>
		</div>
	);
}

export default Error404;
