export default [
	['Light 1', 'ESP_A75A6D.localdomain', ['light', 'section 1'], '1'],
	['Light 2', 'ESP_A50EFF.localdomain', ['light', 'section 2'], '2'],
	['Light 3', 'ESP_AA3C57.localdomain', ['light', 'section 3'], '3'],
	['Light 4', 'ESP_A7A449.localdomain', ['light', 'section 4'], '4'],
	['Kitchen Lights', 'ESP_754970.localdomain', ['light', 'section 2'], 'k'],
	['Mirror Lights', 'ESP_9E6DD4.localdomain', ['light', 'section 2'], 'm'],
	['Extractor', 'ESP_B1213E.localdomain', ['appliance'], 'e'],
	['Speakers', 'ESP_B3A241.localdomain', ['appliance'], 's'],
].map(a => ({
	name: a[0],
	hostname: a[1],
	tags: a[2],
	keyboardKey: a[3]
}));