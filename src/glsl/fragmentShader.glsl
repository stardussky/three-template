varying vec2 vUv;

uniform float uTime;
uniform float uTextureRatio;
uniform vec2 uResolution;
uniform sampler2D uTexture;

vec2 coverUv(vec2 uv, float aspectRatio, float ratio){
  vec2 scale = vec2(1.);

  if(ratio > aspectRatio) {
    scale = vec2(aspectRatio / ratio, 1.);
  } else {
    scale = vec2(1., ratio / aspectRatio);
  }

  return (uv - vec2(0.5)) * scale + vec2(0.5);
}

void main(){
  vec2 newUv = coverUv(vUv, uResolution.x / uResolution.y, uTextureRatio);

  // vec3 col = texture2D(uTexture, newUv).rgb;
  vec3 col = vec3(newUv, sin(uTime));

  gl_FragColor = vec4(col, 1.0);
}