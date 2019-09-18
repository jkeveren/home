import http from 'http';
import ws from 'ws';
import fs from 'fs';
import readStream from './readStream.mjs';
import createWebSocketMessageSender from './createWebSocketMessageSender.mjs';

(async () => {
	// set up devices

	const requestDevice = (device, endpoint, data) => {
		const promise = new Promise(async (resolve, reject) => {
			if (device.requestQueue.length) {
				try {
					await device.requestQueue[device.requestQueue.length - 1];
				} catch (e) {
					// ignore errors here as they should be handled elsewhere
				}
				// add small delay so device can keep up with requests and so no requests are dropped
				await new Promise(resolve => setTimeout(resolve, 5));
			}
			const requestBody = JSON.stringify({
				deviceid: '',
				data: data || {}
			});
			const request = http.request(`http://10.0.0.${device.ipSuffix}:8081/zeroconf/${endpoint}`, {
				method: 'post',
				headers: {'content-length': requestBody.length}
			});
			request.write(requestBody);
			request.end();
			request.on('error', error => {
				reject(error);
			});
			const response = await new Promise(resolve => request.on('response', resolve));
			const responseBody = await readStream(response);
			device.requestQueue.shift();
			resolve(JSON.parse(responseBody));
		});
		device.requestQueue.push(promise);
		return promise;
	};

	const getStatus = async device => JSON.parse((await requestDevice(device, 'info')).data).switch === 'on';

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
		};
		device.isOn = getStatus(device);
		return device;
	});

	for (const device of devices) {
		device.isOn = await device.isOn;
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
	const HTTPPort = 8080
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
				try {
					const result = await requestDevice(device, 'switch', {switch: device.isOn ? 'off' : 'on'})
					if (result.error !== 0) {
						console.error(result);
					} else {
						device.isOn = !device.isOn;
					}
				} catch (error) {
					console.error(error);
				}
			}
		});
		send('devices', devices);
	});
})();