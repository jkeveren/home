export default [
// 	['Light 1', 'ESP_AA3C57', 1, ['light']],
	['Light 2', 'ESP_A50EFF', 2, ['light']],
// 	['Light 3', 'ESP_A7A449', 3, ['light']],
// 	['Light 4', 'ESP_B1213E', 4, ['light']],
// 	['Light 5', 'ESP_A75A6D', 5, ['light']],
// 	['Light 6', 'ESP_9E6DD4', 6, ['light']],
// 	['Light 7', 'ESP_754970', 7, ['light']],
// 	['Light 8', 'ESP_B12DAC', 8, ['light']],
// 	['Light 9', 'invalid hostname', 9, ['poop']],
].map(args => ({
	name: args[0],
	hostname: args[1],
	hotkey: args[2],
	tags: args[3],
	requestQueue: [],
	isOn: false
}));