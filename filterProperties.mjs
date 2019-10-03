// returns copy of object with only specific properties

import objectFromEntries from './objectFromEntries.mjs';

export default (obj, isWhitelist, list) => objectFromEntries(Object.entries(obj).filter(([key]) => {
	const included = list.includes(key);
	if (isWhitelist)
		return included;
	else
		return !included;
}));