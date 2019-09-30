export default [
	['Light 1',        'ESP_A75A6D.localdomain', 1],
	['Light 2',        'ESP_A50EFF.localdomain', 2],
	['Light 3',        'ESP_AA3C57.localdomain', 3],
	['Light 4',        'ESP_A7A449.localdomain', 4],
	['Mirror Lights',  'ESP_9E6DD4.localdomain', 'm'],
	['Kitchen Lights', 'ESP_754970.localdomain', 'k'],
// 	['Light 4', 'ESP_B1213E.localdomain', 4, ['light']],
// 	['Light 8', 'ESP_B12DAC.localdomain', 8, ['light']],
].map((args, index) => ({
	index,
	name: args[0],
	hostname: args[1],
	hotkey: args[2],
	tags: args[3],
	requestQueue: [],
	isOn: false,
}));