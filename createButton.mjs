// returns a button with overridable style for each common button state
// same argument structure as createElement with 'hover' and 'active' properties overriding the associates states style

import createElement from './createElement.mjs';
import filterProperties from './filterProperties.mjs';
import assign from './assign.mjs';

export default (o) => {
	o = assign({
		style: {
			width: 'min-content',
			padding: '0.3rem 0.6rem',
			textAlign: 'center',
			borderRadius: '3px',
			userSelect: 'none',
			cursor: 'pointer',
			boxShadow: 'none',
			border: `1px solid #0005`,
			whiteSpace: 'nowrap',
			transitionDuration: '0.1s'
		},
		hover: {
			boxShadow: '0 1px 1px #aaa',
		},
		active: {
			boxShadow: 'none'
		},
	}, o);
	const button = createElement(filterProperties(o, true, ['parentElement', 'innerText', 'style', 'children']));
	Object.entries({
		mouseover: o.hover,
		mouseout: o.style,
		mousedown: o.active,
		mouseup: o.hover
	}).forEach(([eventName, stateStyle]) => button.addEventListener(eventName, e => {
		if (button.style.pointerEvents !== 'none') {
			Object.assign(button.style, stateStyle);
		}
	}));
	return button;
};
