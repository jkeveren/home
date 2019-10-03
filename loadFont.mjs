import loadElement from './loadElement.mjs';

export default href => loadElement({
	tagName: 'link',
	href,
	rel: 'stylesheet'
});