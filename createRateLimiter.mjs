import delay from './delay.mjs';

/*
takes: delayTime (ms)
returns: function:
	returns: promise:
		resolves when: when rate limit allows another action
		resolves to: undefined
*/

export default delayTime => {
	let finalActionTime = 0;
	return async () => {
		const now = Date.now()
		finalActionTime = Math.max(now, finalActionTime + delayTime);
		const timeUntilAction = finalActionTime - now;
		if (timeUntilAction > 0) {
			await delay(timeUntilAction);
		}
		return;
	}
};