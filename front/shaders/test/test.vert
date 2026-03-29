attribute vec2 aPosition;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;

void main() {
	gl_Position = vec4(aPosition.x, aPosition.y , 1., 1.);

	vec2 uv = vec2(aPosition.x * .5 + 0.5, aPosition.y * .5 + 0.5);
	float aspect = uResolution.x / uResolution.y;
	uv.x = uv.x - .5 + 1. / aspect * .5; // center texture horizontally
	uv *= 1.; // texture size
	uv.x = uv.x * aspect; // prevent stretching

	vUv = uv;
}