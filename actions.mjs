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
// 		console.log(requestBody);
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
const setDeviceState = (hostname, state) => requestDevice(hostname, 'switch', {switch: state ? 'on' : 'off'});
const toggleDeviceState = async hostname => {
	const state = await getDeviceState(hostname);
	await setDeviceState(hostname, !state);
};

const lights = devices.filter(device => device.tags.includes('light'));
const defaultLights = [];
const notDefaultLights = [];

for (const device of lights) {
	if (device.tags.includes('default')) {
		defaultLights.push(device);
	} else {
		notDefaultLights.push(device);
	}
}

const setDeviceStates = (devices, state) => {
	const setDeviceStatePromises = [];
	for (const device of devices) {
		setDeviceStatePromises.push(setDeviceState(device.hostname, state));
	}
	return Promise.all(setDeviceStatePromises);
}

const actions = [];

actions.push(...[
	{
		name: 'Lights On',
		keyboardKey: 'KeyN',
		execute: async () => setDeviceStates(lights, true)
	},
	{
		name: 'Lights Off',
		keyboardKey: 'KeyF',
		execute: async () => setDeviceStates(lights, false)
	},
	{
		name: 'Default',
		keyboardKey: 'KeyD',
		execute: async () => {
			setDeviceStates(defaultLights, true);
			setDeviceStates(notDefaultLights, false);
		}
	},
]);

// create an action for each device

for (const device of devices) {
	actions.push(Object.assign(
		{
			execute: alternateAction => {
				if (device.tags.includes('light') && alternateAction) {
					// make only this light on
					for (const light of lights) {
						setDeviceState(light.hostname, light === device);
					}
				} else {
					toggleDeviceState(device.hostname)
				}
			},
		},
		Object.fromEntries(Object.entries(device).filter(([key]) => ['name', 'keyboardKey'].includes(key)))
	));
}

export default actions;
