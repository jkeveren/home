import devices from './devices.mjs';
import readStream from './readStream.mjs';
import delay from './delay.mjs';
let http;

(async () => {
	if (typeof window === 'undefined') {
		http = await import('http');
	}
})();

const requestDevice = async (hostname, endpoint, data) => {
	const rawBody = await new Promise((resolve, reject) => {
		const requestBody = JSON.stringify({
			deviceid: '',
			data: data || {},
		});
		console.log(requestBody);
		const request = http.request(`http://${hostname}:8081/zeroconf/${endpoint}`, {
			method: 'post',
			headers: {'content-length': requestBody.length}
		});
		request.write(requestBody);
		request.on('response', async response => {
			resolve(await readStream(response));
		});
		request.on('error', reject);
		request.end();
	});
	const body = JSON.parse(rawBody);
// 	console.log(body);
	return body.data;
}

const getDeviceState = async hostname => JSON.parse(await requestDevice(hostname, 'info')).switch === 'on';
const setDeviceState = (hostname, state) => requestDevice(hostname, 'switch', {switch: state ? 'on' : 'off'})
const toggleDeviceState = async hostname => {
	const state = await getDeviceState(hostname);
	await setDeviceState(hostname, !state);
};

const lights = devices.filter(device => device.tags.includes('light'));
const setLights = state => {
	const setDeviceStatePromises = [];
	for (const device of lights) {
		console.log(device);
		setDeviceStatePromises.push(setDeviceState(device.hostname, state));
	}
	return Promise.all(setDeviceStatePromises);
}

const actions = [];

// create an action for each device

for (const device of devices) {
	actions.push(Object.assign(
		{
			execute: () => toggleDeviceState(device.hostname),
		},
		Object.fromEntries(Object.entries(device).filter(([key]) => ['name', 'keyboardKey'].includes(key)))
	));
}

actions.push(...[
	{
		name: 'Toggle Lights',
		keyboardKey: 'l',
		execute: async () => {
			const getDeviceStatePromises = [];
			for (const device of lights) {
				getDeviceStatePromises.push(getDeviceState(device.hostname));
			}
			const newState = ((await Promise.all(getDeviceStatePromises)).map(state => state ? 1 : 0).reduce((sum, accumulator) => sum + accumulator) / lights.length) < 0.5 ? true : false;
			await setLights(newState);
		}
	},
	{
		name: 'Lights Off',
		keyboardKey: 'f',
		execute: async () => setLights(false)
	},
	{
		name: 'Lights On',
		keyboardKey: 'n',
		execute: async () => setLights(true)
	},
// 	{
// 		name: 'Warp Speed',
// 		keyboardKey: 'Enter',
// 		execute: async () => {
// 			// light devices in order of turning off
// 			const sections = [
// 				['Light 1'],
// 				['Light 2', 'Kitchen Lights', 'Mirror Lights'],
// 				['Light 3'],
// 				['Light 4']
// 			];
// 			for (const sectionIndex in sections) {
// 				sections[sectionIndex] = sections[sectionIndex].map(deviceName => devices.find(device => device.name === deviceName));
// 			}
// 			// turn lights off
// 			const offPromises = [];
// 			for (const section of sections) {
// 				for (const device of section) {
// 					offPromises.push(setDeviceState(device.hostname, false));
// 				}
// 			}
// 			await Promise.all(offPromises);
// 			for (const section of sections) {
// 				for (const device of section) {
// 					setDeviceState(device.hostname, true);
// 				}
// 				await delay(400);
// 				for (const device of section) {
// 					setDeviceState(device.hostname, false);
// 				}
// 			}
// 		}
// 	}
]);

export default actions;