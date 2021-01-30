varying vec2 vUv;

uniform float uTime;

void main(){
  vec3 col = vec3(vUv, sin(uTime));

  gl_FragColor = vec4(col, 1.0);
}