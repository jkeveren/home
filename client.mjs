import actions from './actions.mjs';

// set global style

document.head.appendChild(document.createElement('style'));
document.styleSheets[0].insertRule(`* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	font-family: monospace;
}`);

// style body and buttons

const spacing = 20; // px

Object.assign(document.body.style, {
	padding: `${spacing}px`,
	paddingTop: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

document.styleSheets[0].insertRule(`button {
	width: 100%;
	max-width: 500px;
	height: 50px;
	margin-top: ${spacing}px;
	background: transparent;
	color: #fff;
	border: 1px solid #fff;
	border-radius: 3px;
	cursor: pointer;
	user-select: none;
	transition: 0.5s background;
}`);

// define :active before other pseudos so it has precedence given the same specificity
// button.active so button can be visibly "clicked" with keyboard buttons
document.styleSheets[0].insertRule(`button:active, button.active {
	transition: none;
	background: #fff7;
}`);

// remove focus indicator for non-keyboard-only users
document.styleSheets[0].insertRule(`body:not(.accessibility) *:focus {
	outline: none;
}`);
addEventListener('keydown', event => {
	if (event.key === 'Tab' && !(event.repeat || event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
		document.body.classList.add('accessibility');
	}
});
addEventListener('click', event => {
	document.body.classList.remove('accessibility');
});

// create buttons and trigger actions

const invokeAction = async (action) => {
	const response = await fetch(`/${encodeURIComponent(action.name)}`);
	if (!response.ok) {
		const error = await response.text();
		console.error(error);
	}
};

for (const action of actions) {
	const button = Object.assign(document.body.appendChild(document.createElement('button')), {
		textContent: `${action.name} (${action.keyboardKey})`,
	});
	button.addEventListener('click', () => {
		invokeAction(action);
	});
	addEventListener('keydown', event => {
		if (!(event.repeat || event.key !== action.keyboardKey || event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
			// visually "click" relevant button
			button.classList.add('active');
			setTimeout(() => button.classList.remove('active'));
			invokeAction(action);
		}
	});
}
