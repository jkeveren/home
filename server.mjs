import http from 'http';
import {promises as fs} from 'fs';
import actions from './actions.mjs';

// start HTTPServer
const HTTPServer = http.createServer();
// basic js fileserver
HTTPServer.on('request', async (request, response) => {
	let actionName;
	let action;
	try {
		// HTML and JS static server
		if (request.url === '/') {
			// serve HTML
			response.setHeader('content-type', 'text/html');
			// send html
			// background is defined here so 
			response.write(`<html style=background:#000><meta name=viewport content='width=device-width,user-scalable=no' /><title>Home</title><script type=module src=client.mjs></script>`);
		} else if (/\.mjs$/.test(request.url)) {
			// serve JS
			response.setHeader('content-type', 'application/javascript');
			try {
				const file = await fs.readFile(`.${request.url}`);
				response.write(file);
			} catch (error) {
				if (['ENOENT', 'EISDIR'].includes(error.code)) {
					response.statusCode = 404;
					response.write('not found');
				} else {
					throw error;
				}
			}
		} else if (action = actions.find(action => action.name === (actionName || (actionName = decodeURI(request.url).slice(1))))) {
			await action.execute();
		} else {
			response.statusCode = 404;
		}
	} catch (error) {
		console.error(error);
		response.statusCode = 500;
		response.write(error.stack); // write error to client because this is only deployed localy
	} finally {
		response.end();
	}
});

const port = 10000;
HTTPServer.listen(port, () => console.log(`http://127.0.0.1:${port}`));
