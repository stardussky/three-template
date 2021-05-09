varying vec2 vUv;

void main(){
  vUv = uv;

  vec3 pos = position.xyz;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mvPos;
  // gl_PointSize = ( 10.0 / - mvPos.z );
}