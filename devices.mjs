const light = 'light';
const appliance = 'appliance';
const dflt = 'default';

export default [
	['Light 1',        'ESP_A75A6D', [light, dflt]],
	['Light 2',        'ESP_A50EFF', [light]],
	['Light 3',        'ESP_AA3C57', [light]],
	['Light 4',        'ESP_E3A603', [light, dflt]],
	['Kitchen Lights', 'ESP_754970', [light, dflt]],
	['Mirror Lights',  'ESP_9E6DD4', [light]],
	['Extractor',      'ESP_B1213E', [appliance]],
	['Speakers',       'ESP_B3A241', [appliance]],
].map(a => ({
	name: a[0],
	hostname: a[1],
	tags: a[2],
	keyboardKey: a[3]
}));
