// returns a promise that resolves after load event has occurred on element (rejects on error)

import createElement from './createElement.mjs';
import assign from './assign.mjs';

export default a => new Promise((load, error) => {
	const element = createElement(assign(
		{
			parentElement: document.head
		},
		a
	));
	Object.entries({load, error}).forEach(entry => element.addEventListener(...entry));
});