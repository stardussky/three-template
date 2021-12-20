varying vec2 vUv;

void main(){
    vec3 pos = position.xyz;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.);
    vec4 modelViewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * modelViewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = ( 10.0 / - modelViewPosition.z );

    vUv = uv;
}