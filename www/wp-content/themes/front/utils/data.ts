export const splice = (array: any[], length: number, call: (needle: any) => boolean) => {
	array.splice(array.findIndex(call), length);
};
