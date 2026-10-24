---
id: 2324
type: lab
slug: "glsl-color-drops"
title: "ボケた柔らかそうな物体を回転させ明滅させる -『GLSL』"
date: 2018-08-08T14:41:19+09:00
modified: 2018-08-08T14:42:11+09:00
excerpt: "fragment shader で流体表現 glslsandbox で作成 元はストライプ模様のシェーダー #ifdef GL_ES precision mediump float; #endif uniform flo"
primaryTag: "WebGL"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 341, name: "GLSL", slug: "glsl" }
  - { id: 340, name: "WebGL", slug: "webgl" }
demoUrl: http://glslsandbox.com/e#48225.0
legacy:
  prev: effects-to-youtube-videos
  next: null
---

- fragment shader で流体表現
- glslsandbox で作成
- 元はストライプ模様のシェーダー

```

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 surfacePosition;

#define stripes 1.
#define k 4.
#define sy surfacePosition.y
#define sx surfacePosition.x

float PI = k*atan(stripes);

vec3 getColor(float phase) {
    float x = sx*.1;
    float y = sy*.1;
    float theta = atan(y, x) ;
    float r = log((x*x + y*y));
    float c = .0;
    float a = .0;
    float tt;
    for (float t=0.; t<k; t++) {
        float tt = t * PI;
        c += sin(((k-t)*theta*cos(tt/*+theta*/) + t*r*sin(k-t)) * stripes - phase);
        a += sin(((k-t)*theta*cos(tt) + t*r*sin(k-t)) * stripes + phase);
        phase*=.5;
    }
    c*=.2;
    a*=.3;
    return vec3(abs(c*.1*mouse.x),abs(a*a), -c+.1*mouse.y);
}

void main(void) {
    vec3 c = getColor(time*0.1*PI);
    gl_FragColor = vec4(c, 1.0);
}


```
