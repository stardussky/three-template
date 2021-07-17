#define PI 3.1415926

uniform float uTime;
uniform float uTextureRatio;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;

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
  vec2 uv = vUv;
  vec2 rUv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.);
  vec2 tUv = coverUv(vUv, uResolution.x / uResolution.y, uTextureRatio);

  // vec3 final = texture2D(uTexture, tUv).rgb;
  vec3 final = vec3(uv, abs(sin(uTime * 0.5)));

  gl_FragColor = vec4(final, 1.0);
}