export const camelCase = (str: string): string => {
	return (
		str &&
		str
			.replace(new RegExp(/[-_]+/, "g"), " ")
			.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
				return index === 0 ? word : word.toUpperCase();
			})
			.replace(/\s+/g, "")
	);
};

export const pascalCase = (str: string): string => {
	return (
		str &&
		str
			.replace(new RegExp(/[-_]+/, "g"), " ")
			.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
				return word.toUpperCase();
			})
			.replace(/\s+/g, "")
	);
};

export const kebabCase = (str: string): string => {
	return (
		str &&
		str
			.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
			.map((x) => x.toLowerCase())
			.join("-")
	);
};

export const snakeCase = (str: string): string => {
	return (
		str &&
		str
			.split(/(?=[A-Z0-9])/)
			.join("_")
			.toLowerCase()
	);
};
