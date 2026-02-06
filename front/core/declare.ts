// Global functions

declare function onMounted(callback: CallableFunction);
declare function onUnmounted(callback: CallableFunction);
declare function onReady(callback: CallableFunction);
declare function afterReady(callback: CallableFunction);
declare function provide(name: string, values: any): any;
declare function inject(name: string, values?: unknown): any;
declare function supply(name: string, values: any): any;
declare function defineEmits(): (name: string) => void;
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

window.onMounted = undefined;
window.onUnmounted = undefined;
window.onReady = undefined;
window.afterReady = undefined;
window.provide = undefined;
window.inject = undefined;
window.defineEmits = undefined;
window.defineExpose = undefined;
