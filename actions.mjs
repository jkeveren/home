import devices from './devices.mjs';
import readStream from './readStream.mjs';
import delay from './delay.mjs';
let http;

(async () => {
	if (typeof window === 'undefined') {
		http = await import('http');
	}
})();

const requestDevice = async (device, endpoint, data) => {
	const rawBody = await new Promise((resolve, reject) => {
		const requestBody = JSON.stringify({
			deviceid: '',
			data: data || {},
		});
		const request = http.request(`http://${device.hostname}:8081/zeroconf/${endpoint}`, {
			method: 'post',
			headers: {'content-length': requestBody.length}
		});
		request.on('error', reject);
		request.on('response', async response => {
			resolve(await readStream(response));
		});
		request.write(requestBody);
		request.end();
	});
	const body = JSON.parse(rawBody);
	return body.data;
}

const getDeviceState = async device => JSON.parse(await requestDevice(device, 'info')).switch === 'on';
const setDeviceState = (device, state) => requestDevice(device, 'switch', {switch: state ? 'on' : 'off'});

const setDeviceStates = (devices, state) => {
	const setDeviceStatePromises = [];
	for (const device of devices) {
		setDeviceStatePromises.push(setDeviceState(device, state));
	}
	return Promise.all(setDeviceStatePromises);
}

const toggleDeviceState = async device => {
	const state = await getDeviceState(device);
	await setDeviceState(device, !state);
};

const devicesByName = Object.fromEntries(devices.map(device => ([device.name, device])));

const lights = devices.filter(device => device.tags.includes('light'));
const defaultLights = [];
const notDefaultLights = [];
const notKitchenLights = [];

for (const device of lights) {
	if (device.tags.includes('default')) {
		defaultLights.push(device);
	} else {
		notDefaultLights.push(device);
	}
	if (device !== devicesByName['Kitchen Lights']) {
		notKitchenLights.push(device);
	}
}

export default [
	{
		name: 'All Lights On',
		keyboardKey: 'n',
		execute: async () => {
			setDeviceStates(lights, true);
		}
	},
	{
		name: 'Side Lights Only',
		keyboardKey: 'd',
		execute: async () => {
			setDeviceStates(defaultLights, true);
			setDeviceStates(notDefaultLights, false);
		}
	},
	{
		name: 'Kitchen Lights Only',
		keyboardKey: 'k',
		execute: async () => {
			setDeviceState(devicesByName['Kitchen Lights'], true);
			setDeviceStates(notKitchenLights, false);
		}
	},
	{
		name: 'All Lights Off',
		keyboardKey: 'f',
		execute: async () => {
			setDeviceStates(lights, false);
		}
	},
	{
		name: 'Speakers Toggle',
		keyboardKey: 's',
		execute: async () => toggleDeviceState(devicesByName['Speakers'])
	},
	{
		name: 'Extractor Toggle',
		keyboardKey: 'e',
		execute: async () => toggleDeviceState(devicesByName['Extractor'])
	},
];
