interface AjaxOptions {
	method?: string;
	origin?: string;
	format?: string;
	parse?: boolean;
	credentials?: "same-origin" | "include";
	[key: string]: any;
}

export const ajax = async (action: String, data = {}, options?: AjaxOptions) => {
	// Default options
	const defaults = {
		method: "POST",
		origin: window.location.origin + "/wp-admin/admin-ajax.php?action=",
		format: "string",
		parse: true,
		...options,
	};

	try {
		const url = defaults.origin + action;
		const fetchOptions: RequestInit = {
			method: defaults.method,
			headers: {},
		};

		if (defaults.credentials) {
			fetchOptions.credentials = defaults.credentials;
		}

		if (defaults.method === "POST" || defaults.method === "PUT") {
			if (defaults.format === "string") {
				fetchOptions.headers = {
					"Content-Type": "application/json",
				};
				fetchOptions.body = JSON.stringify(data);
			} else {
				fetchOptions.body = data as BodyInit;
			}
		}

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
		}

		if (defaults.parse) {
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				return await response.json();
			} else {
				return await response.text();
			}
		} else {
			return await response.text();
		}
	} catch (error) {
		console.error("Ajax request failed:", error);
		throw error;
	}
};
