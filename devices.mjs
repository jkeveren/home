const light = 'light';
const appliance = 'appliance';
const dflt = 'default';

export default [
	['Light 1',        'ESP_A75A6D.localdomain', [light, dflt]],
	['Light 2',        'ESP_A50EFF.localdomain', [light]],
	['Light 3',        'ESP_AA3C57.localdomain', [light]],
	['Light 4',        'ESP_A7A449.localdomain', [light, dflt]],
	['Kitchen Lights', 'ESP_754970.localdomain', [light, dflt]],
	['Mirror Lights',  'ESP_9E6DD4.localdomain', [light]],
	['Extractor',      'ESP_B1213E.localdomain', [appliance]],
	['Speakers',       'ESP_B3A241.localdomain', [appliance]],
].map(a => ({
	name: a[0],
	hostname: a[1],
	tags: a[2],
	keyboardKey: a[3]
}));