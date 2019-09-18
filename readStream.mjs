export default stream => new Promise((resolve, reject) => {
	stream.on('error', reject);
	const chunks = [];
	stream.on('data', chunk => chunks.push(chunk));
	stream.on('end', () => resolve(Buffer.concat(chunks)));
});
