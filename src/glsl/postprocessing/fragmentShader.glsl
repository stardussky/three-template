#define PI 3.1415926

uniform sampler2D tDiffuse;
uniform float uTime;

varying vec2 vUv;

void main(){

  vec4 renderTexture = texture2D(tDiffuse, vUv);

  vec3 final = renderTexture.rgb;

  gl_FragColor = vec4(final, 1.);
}