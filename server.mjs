import http from 'http';
import ws from 'ws';
import fs from 'fs';
import readStream from './readStream.mjs';
import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';
import net from 'net';
import devices from './devices.mjs';
import log from './log.mjs';

(async () => {
	// set up devices
	const requestDevice = (device, endpoint, data, timeoutLength) => {
		const requestPromise = new Promise(async (resolve, reject) => {
			if (device.requestQueue.length) {
				await device.requestQueue[device.requestQueue.length - 1];
			}
			let resolveValue;
			const delayPromise = new Promise(resolve => setTimeout(resolve, 250));
			const requestBody = JSON.stringify({
				deviceid: '',
				data: data || {}
			});
			const request = http.request(`http://${device.hostname}:8081/zeroconf/${endpoint}`, {
				method: 'post',
				headers: {'content-length': requestBody.length}
			});
			// manual timeout because default timeout is too short and timeout option doesn't work
			request.on('socket', socket => {
				let timeout = setTimeout(async () => {
					socket.destroy(new Error(`device "${device.name}" is unavailable`));
				}, timeoutLength || 1000);
				socket.on('ready', () => {
					clearTimeout(timeout);
				});
			});
			request.on('error', async error => {
				device.requestQueue.shift();
				await delayPromise;
				resolve(error);
			});
			request.write(requestBody);
			request.end();
			const response = await new Promise(resolve => request.on('response', resolve));
			const responseBody = await readStream(response);
			let parsedResponseBody
			try {
				parsedResponseBody = JSON.parse(responseBody)
			} catch (error) {
				await delayPromise;
				resolve(error);
			}
			if (parsedResponseBody.error) {
				await delayPromise;
				resolve(new Error(`device returned error code: "${parsedResponseBody.error}"`));
			}
			device.requestQueue.shift();
			await delayPromise;
			resolve(parsedResponseBody.data);
		});
		device.requestQueue.push(requestPromise);
		return requestPromise;
	};

	// get initial state of switches
	for (const device of devices) {
		device.isOn = requestDevice(device, 'info');
	}

	for (const device of devices) {
		const result = await device.isOn;
		if (result instanceof Error) {
			device.isOn = false;
			console.warn(result);
		} else {
			device.isOn = JSON.parse(result).switch === 'on';
		}
	}

	// start HTTPServer
	const HTTPServer = http.createServer();
	// basic js fileserver
	HTTPServer.on('request', async (req, res) => {
		if (req.url === '/') {
			res.setHeader('content-type', 'text/html');
			res.end('<!DOCTYPE html><html lang=en-US><meta name=viewport content=width=device-width,user-scalable=no /><title>Home</title><script type=module src=client.mjs></script>');
		} else {
			res.setHeader('content-type', 'application/javascript');
			fs.readFile(`.${req.url}`, (error, file) => {
				if (error) {
					if (['ENOENT', 'EISDIR'].includes(error.code)) {
						res.statusCode = 404;
						res.end('not found');
					} else {
						res.statusCode = 500;
						console.error(error.stack);
						res.end(error.trace);
					}
				}
				res.end(file);
			});
		}
	});
	const HTTPPort = 10000;
	HTTPServer.listen(HTTPPort, error => {
		if (error) {
			throw error;
		}
		console.log(`http://127.0.0.1:${HTTPPort}`);
	});

	// start WebSocketServer
	const webSocketServer = new ws.Server({server: HTTPServer});
	webSocketServer.on('connection', webSocket => {
		const send = createWebSocketMessageSender(webSocket);
		webSocket.on('message', async message => {
			message = JSON.parse(message);
			if (message.type === 'toggle') {
				for (const deviceIndex of message.data) {
					const device = devices[deviceIndex];
					const result = await requestDevice(device, 'switch', {switch: (device.isOn = !device.isOn) ? 'on' : 'off'});
					if (result instanceof Error) {
						console.error(result);
						send('error', result.stack);
					}
				}
			}
		});
	});
})();
