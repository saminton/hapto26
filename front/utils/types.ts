export function isNumeric(n: any): boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export const toArray = (item: any): any[] => {
	if (Array.isArray(item)) return item;
	if (item instanceof NodeList || item instanceof HTMLCollection) return Array.from(item);
	else return [item];
};
