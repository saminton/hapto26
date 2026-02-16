// Global functions

declare function onMounted(callback: CallableFunction);
declare function onUnmounted(callback: CallableFunction);
declare function onReady(callback: CallableFunction);
declare function afterReady(callback: CallableFunction);
declare function provide(name: string, values: any): any;
declare function inject(name: string, values?: unknown): any;
declare function supply(name: string, values: any): any;
declare function defineEmits(name: string): void;
declare function defineExpose(values: object): void;

// Files

declare module "*.frag" {
	const content: any;
	export default content;
}

declare module "*.vert" {
	const content: any;
	export default content;
}

declare module "*.glsl" {
	const content: any;
	export default content;
}

window.onMounted = () => {};
window.onUnmounted = () => {};
window.onReady = () => {};
window.afterReady = () => {};
window.provide = () => {};
window.inject = () => {};
window.defineEmits = () => {};
window.defineExpose = () => {};
