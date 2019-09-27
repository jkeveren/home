export default (...args) => {
	for (const argument of args) {
		console.log(argument);
	}
	return args.length > 1 ? args : args[0];
};