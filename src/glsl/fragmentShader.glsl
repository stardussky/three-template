varying vec2 vUv;

uniform float uTime;
uniform float uTextureRatio;
uniform vec2 uResolution;
uniform sampler2D uTexture;

void main(){
  vec2 uvScaler = vec2(1.);
  float aspectRatio = uResolution.x / uResolution.y;

  if(uTextureRatio > aspectRatio) {
    uvScaler = vec2(aspectRatio / uTextureRatio, 1.);
  } else {
    uvScaler = vec2(1., uTextureRatio / aspectRatio);
  }

  vec2 newUv = (vUv - vec2(0.5)) * uvScaler + vec2(0.5);

  // vec3 col = texture2D(uTexture, newUv).rgb;
  vec3 col = vec3(newUv, sin(uTime));

  gl_FragColor = vec4(col, 1.0);
}