import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';
import devices from './devices.mjs';
import log from './log.mjs';
import createElement from './createElement.mjs';

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

	await new Promise(resolve => webSocket.addEventListener('open', resolve));

	const toggle = deviceIndex => send('toggle', [deviceIndex]);

	for (const device of devices) {
		const button = createElement({
			parentElement: document.body,
			tagName: 'button',
			innerText: device.name
		});
		button.addEventListener('click', e => {
			toggle(device.index);
		})
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