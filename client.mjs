import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';
import devices from './devices.mjs';

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

	const lastKeyStates = {};
	const keyStates = {};

	// returns true if new state
	const updateKeyStates = e => (lastKeyStates[e.key] = !!keyStates[e.key]) !== (keyStates[e.key] = e.type === 'keydown');

	document.addEventListener('click', () => {
		send('toggle', [0]);
	});

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