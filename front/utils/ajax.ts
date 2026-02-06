export const ajax = async (
	action,
	data = {},
	options?: {
		method?: string;
		origin?: string;
		format?: string;
		parse?: boolean;
	},
) => {
	// Default options
	const defaults = {
		method: "POST",
		origin: window.location.origin + "/wp-admin/admin-ajax.php?action=",
		format: "string",
		parse: true,
	};

	// Override defaults
	for (let key in options) {
		defaults[key] = options[key];
	}

	// Ajax request
	const response = (await new Promise((resolve, reject) => {
		let params = data;
		let status = null;

		const xhr = window.XMLHttpRequest
			? new XMLHttpRequest()
			: new ActiveXObject("Microsoft.XMLHTTP");

		xhr.open(defaults.method, defaults.origin + action, true);
		xhr.onreadystatechange = function () {
			if (xhr.status == 200) {
				if (xhr.readyState > 3) {
					resolve(xhr.responseText);
				}
			} else if (xhr.status !== status) {
				// Status change
			} else if (xhr.status == 400 || xhr.status == 404) {
				reject(xhr);
			}
		};

		xhr.onloadend = function () {
			if (xhr.status == 400 || xhr.status == 404) {
				reject(xhr);
			}
		};

		if (defaults.format == "string") {
			params = JSON.stringify(data);
			xhr.setRequestHeader("Content-Type", "application/json");
		}

		xhr.send(params);

		return xhr;
	}).catch((error) => {
		console.error(error);
		return error;
	})) as string;

	if (defaults.parse) {
		// Parse and return response
		try {
			return JSON.parse(response);
		} catch (error) {
			console.warn(response);
			console.warn(error);
			return null;
		}
	} else return response;
};
