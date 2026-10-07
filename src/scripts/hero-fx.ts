// Latar bergerak di hero (WebGL shader ringan). Kalau HP tidak mendukung, otomatis jatuh ke gradien CSS.
const canvas = document.querySelector<HTMLCanvasElement>('.hero-fx');
if (canvas) init(canvas);

function init(cv: HTMLCanvasElement) {
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  p+=(m-.5)*.18;
  float tt=t*.06;
  vec2 q=vec2(fbm(p*1.3+tt),fbm(p*1.3+vec2(5.2,1.3)-tt));
  vec2 w=vec2(fbm(p*1.5+2.*q+vec2(1.7,9.2)+tt*1.3),fbm(p*1.5+2.*q+vec2(8.3,2.8)-tt));
  float f=fbm(p*1.2+2.4*w);
  vec3 ink=vec3(.027,.043,.078);
  vec3 blue=vec3(.17,.30,.98);
  vec3 ion=vec3(.12,.88,.82);
  vec3 col=mix(ink,blue,smoothstep(.28,.88,f)*.95);
  col=mix(col,ion,smoothstep(.5,1.,length(q))*smoothstep(.45,.9,f)*.7);
  float v=smoothstep(1.25,.15,length((uv-vec2(.78,.58))*vec2(1.2,1.)));
  col*=.28+.95*v;
  col+=(h(gl_FragCoord.xy+fract(t))-.5)*.025;
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const pr = gl.createProgram()!; gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm');

  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  const resize = () => {
    const s = Math.min(0.6, 900 / Math.max(cv.clientWidth, 1));
    cv.width = Math.max(2, Math.round(cv.clientWidth * s)); cv.height = Math.max(2, Math.round(cv.clientHeight * s));
    gl.viewport(0, 0, cv.width, cv.height);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; }, { passive: true });

  const draw = (time: number) => {
    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, time / 1000); gl.uniform2f(uM, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  draw(14000);
  cv.classList.add('on');
  if (still) return;

  let visible = true, last = 0, raf = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden || now - last < 33) return; // sekitar 30 gambar/detik, hemat baterai
    last = now; draw(now + 14000);
  };
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(cv);
  raf = requestAnimationFrame(loop);
  cv.addEventListener('webglcontextlost', () => cancelAnimationFrame(raf));
}
