precision highp float; 

varying vec3 vColor;
varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uNoise;

uniform float uTime;
uniform float uHeight;

void main() {
	vec2 uv = vUv;
	float PI = 3.14159265;
	vec3 color = texture2D(uTexture, uv).rgb;

	// gl_FragColor = vec4(vUv.x * .5 + 0.5, vUv.y * .5 + 0.5, 0., 1.);
	gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
	// gl_FragColor = vec4(color, 1.);
}