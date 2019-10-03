// returns object assembled from output of 'Object.entries' because 'Object.fromEntries is not widely supported'

export default entries => {
	const obj = {};
	for (const [key, value] of entries) {
		obj[key] = value;
	}
	return obj;
}