import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';

(async () => {
	let webSocket;
	let send;
	let devices;
	const webSocketMessageHandler = ({data}) => {
		const message = JSON.parse(data);
		if (message.type === 'devices') {
			devices = message.data;
		}
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
	});
})();