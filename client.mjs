import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';
import devices from './devices.mjs';
import log from './log.mjs';
import createElement from './createElement.mjs';
import assign from './assign.mjs';
import createButton from './createButton.mjs';
import loadFont from './loadFont.mjs';

(async () => {
	let webSocket;
	let send;
	const websocketMessageTypeHandlers = {
		error: data => {
			console.error(data);
		}
	}
	const webSocketMessageHandler = ({data}) => {
		const message = JSON.parse(data);
		websocketMessageTypeHandlers[message.type](message.data);
	}
	(async () => {for (;;) {await new Promise(async resolve => {
		webSocket = new WebSocket(`ws://${location.host}/`);
		const webSocketCloseHandler = () => {
			webSocket.removeEventListener('message', webSocketMessageHandler);
			webSocket.removeEventListener('close', webSocketCloseHandler);
			console.log('disconnected');
			setTimeout(() => {
				console.log('attempting to reconnect');
				resolve();
			}, 500);
		}
		webSocket.addEventListener('close', webSocketCloseHandler);
		webSocket.addEventListener('open', () => console.log('connected'))
		webSocket.addEventListener('message', webSocketMessageHandler);
		send = createWebSocketMessageSender(webSocket);
	})}})();

	// set global style. must be done before font load
	createElement({
		parentElement: document.head,
		tagName: 'style',
	});
	document.styleSheets[0].insertRule(`* {
		box-sizing: border-box;
		margin: 0;
		fontSize: '1rem',
		font-family: 'Roboto', sans-serif,
// 		border: 1px dashed black;
	}`);

	await Promise.all([
// 		new Promise(resolve => webSocket.addEventListener('open', resolve)),
		loadFont('https://fonts.googleapis.com/css?family=Roboto&display=swap')
	]);

	const toggle = deviceIndex => send('toggle', [deviceIndex]);

	// root element styling
	assign(document.documentElement.style, {
		background: '#333',
		fontSize: '17px'
	});

	const spacing = 20; // px
	const spacingString = `${spacing/2}px`;

	assign(document.body.style, {
		padding: spacingString,
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
	});

	for (const device of devices) {
		const button = createButton({
			parentElement: document.body,
			tagName: 'button',
			innerText: device.name,
			style: {
				// dimensions
				width: '130px',
				height: '50px',
				margin: spacingString,
				// style
				background: '#444',
				color: '#ddd',
			}
		});
		button.addEventListener('click', e => {
			toggle(device.index);
		});
	}

	// add buttons for actions here //

	const lastKeyStates = {};
	const keyStates = {};

	// returns true if new state
	const updateKeyStates = e => (lastKeyStates[e.key] = !!keyStates[e.key]) !== (keyStates[e.key] = e.type === 'keydown');

	document.addEventListener('keydown', e => {
		if (updateKeyStates(e)) {
			for (const deviceIndex in devices) {
				const device = devices[deviceIndex];
				if (event.key == device.hotkey) {
					send('toggle', [deviceIndex]);
				}
			}
		}
	});
	document.addEventListener('keyup', updateKeyStates);
})();