import http from 'http';
import ws from 'ws';
import fs from 'fs';
import readStream from './readStream.mjs';
import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';

(async () => {
	// set up devices

	const requestDevice = (device, endpoint, data) => {
		const requestPromise = new Promise(async (resolve, reject) => {
			if (device.requestQueue.length) {
				await device.requestQueue[device.requestQueue.length - 1];
			}
			const requestBody = JSON.stringify({
				deviceid: '',
				data: data || {}
			});
			const request = http.request(`http://10.0.0.${device.ipSuffix}:8081/zeroconf/${endpoint}`, {
				method: 'post',
				headers: {'content-length': requestBody.length},
				timeout: 3000
			});
			request.on('socket', socket => setTimeout(() => socket.destroy(), 1000));
			request.on('error', error => {
				device.requestQueue.shift();
				resolve(error);
			});
			request.write(requestBody);
			request.end();
			const response = await new Promise(resolve => request.on('response', resolve));
			const responseBody = await readStream(response);
			device.requestQueue.shift();
			// add small delay so device can keep up with requests
			setTimeout(() => resolve(JSON.parse(responseBody)), 5);
		});
		device.requestQueue.push(requestPromise);
		return requestPromise;
	};

	let devices = [
		['Light 1', 64, 1, ['light']],
		['Light 2', 65, 2, ['light']],
		['Light 3', 66, 3, ['light']],
		['Light 4', 67, 4, ['light']],
		['Light 5', 68, 5, ['light']],
		['Light 6', 69, 6, ['light']],
		['Light 7', 70, 7, ['light']],
	].map(args => {
		const device = {
			name: args[0],
			ipSuffix: args[1],
			hotkey: args[2],
			tags: args[3],
			requestQueue: []
		}
		// set off all isOn requests simultaneously
		device.isOn = requestDevice(device, 'info');
		return device;
	});

	// await all inOn requests and resolve status
	for (const device of devices) {
		const infoResult = await device.isOn;
		if (infoResult instanceof Error) {
			device.isOn = false;
		} else {
			device.isOn = JSON.parse(infoResult.data).switch === 'on';
		}
	}

	// start HTTPServer
	const HTTPServer = http.createServer();
	// basic js fileserver
	HTTPServer.on('request', async (req, res) => {
		if (req.url === '/') {
			res.setHeader('content-type', 'text/html');
			res.end('<!DOCTYPE html><html lang=en-US><title>Home Control</title><script type=module src=client.mjs></script>');
		} else {
			res.setHeader('content-type', 'application/javascript');
			fs.readFile(`.${req.url}`, (error, file) => {
				if (error) {	
					if (['ENOENT', 'EISDIR'].includes(error.code)) {
						res.statusCode = 404;
						res.end('not found');
					} else {
						res.statusCode = 500;
						console.error(eerrorrr);
						res.end(error.trace);
					}
				}
				res.end(file);
			});
		} 
	});
	const HTTPPort = 8080;
	HTTPServer.listen(HTTPPort, error => {
		if (error) {
			throw error;
		}
		console.log(`HTTP on ${HTTPPort}`);
	});
	// start WebSocketServer
	const webSocketServer = new ws.Server({server: HTTPServer});
	webSocketServer.on('connection', webSocket => {
		const send = createWebSocketMessageSender(webSocket);
		webSocket.on('message', async message => {
			message = JSON.parse(message);
			if (message.type === 'toggle') {
				const device = devices[message.data];
				const result = await requestDevice(device, 'switch', {switch: device.isOn ? 'off' : 'on'})
				if (result instanceof Error) {
					console.error(result);
					send('error', result.stack);
				} else {
					device.isOn = !device.isOn;
				}
			}
		});
		send('devices', devices);
	});
})();