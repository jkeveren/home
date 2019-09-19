import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';

(async () => {
	let webSocket;
	let send;
	let devices;
	const websocketMessageTypeHandlers = {
		error: data => {
			console.error(data);
		},
		devices: data => {
			devices = data;
		},
	}
	const webSocketMessageHandler = ({data}) => {
		const message = JSON.parse(data);
		websocketMessageTypeHandlers[message.type](message.data);
	}
	(async () => {for (;;) {await new Promise(async resolve => {
		webSocket = new WebSocket(`ws://${location.host}/`);
		const webSocketCloseHandler = () => {
			resolve();
			webSocket.removeEventListener('message', webSocketMessageHandler);
			webSocket.removeEventListener('close', webSocketCloseHandler);
			console.log('disconnected, attempting to reconnect...');
		}
		webSocket.addEventListener('close', webSocketCloseHandler);
		webSocket.addEventListener('message', webSocketMessageHandler);
		send = createWebSocketMessageSender(webSocket);
	})}})();

	await new Promise(resolve => webSocket.addEventListener('open', resolve));


	document.addEventListener('keydown', event => {
		for (const deviceIndex in devices) {
			const device = devices[deviceIndex];
			if (event.key == device.hotkey) {
				send('toggle', deviceIndex);
			}
		}
		if (event.key === ' ') {
			let i = 0;
			const interval = setInterval(() => {
				send('toggle', i++);
				if (i === devices.length) {
					clearInterval(interval);
				}
			}, 100);
		}
	});
})();