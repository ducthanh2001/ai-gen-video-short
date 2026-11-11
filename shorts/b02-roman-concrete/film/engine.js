// engine.js: renderer, post (depth blur, bloom, grade), helpers. Everything is a pure function of time (seeded noise only).
'use strict';
const T = THREE;
const Q = new URLSearchParams(location.search);
const W = +Q.get('w') || 540, H = +Q.get('h') || 960, FPS = 30;
const S = H / 960;                                   // size factor so the look is the same at any resolution
const TOTAL = TL.total, FRAMES = Math.ceil(TOTAL * FPS);

// ---------- small math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => (t = clamp(t), t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);          // ease in out cubic
const eout = t => 1 - Math.pow(1 - clamp(t), 3);
const ein = t => Math.pow(clamp(t), 3);
const eback = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const fract = x => x - Math.floor(x);
const hash = n => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const hash2 = (a, b) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function vnoise(x, y) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(ix, iy), hash2(ix + 1, iy), ux), lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux), uy); }
const nzs = x => clamp((vnoise(x * .5 + 17.3, 5.1) - .5) * 3.2, -1, 1);          // smooth aperiodic wobble in -1..1 (replaces slow sin loops)
const nzf = (t, seed, f = 1) => clamp((vnoise(t * f + seed * 13.7, seed * 3.1 + .5) - .5) * 3.2, -1, 1);
const lsh = (t, ph, f) => Math.sin(t * f + ph + 3 * nzf(t, ph, .4)) * (.4 + .6 * clamp(nzf(t, ph + 7, .5) * .5 + .5));   // laughing shake: wandering phase and amplitude
const V3 = (x, y, z) => new T.Vector3(x, y, z);

// ---------- renderer ----------
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
document.body.style.cssText = 'margin:0;background:#000';
const renderer = new T.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.toneMapping = T.NoToneMapping;
const gl = renderer.getContext();
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(40, W / H, 0.05, 400);
const TIMEU = { value: 0 };                          // shared clock for little shader sways (set from the frame time)

// ---------- render targets ----------
const rtColor = new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType, samples: 4, depthTexture: new T.DepthTexture(W, H) });
const rtA = new T.WebGLRenderTarget(W, H, { type: T.HalfFloatType });
const bw = n => Math.max(2, Math.round(W / n)), bh = n => Math.max(2, Math.round(H / n));
const rtBright = new T.WebGLRenderTarget(bw(2), bh(2), { type: T.HalfFloatType });
const bl = [4, 8, 16].map(n => ({ a: new T.WebGLRenderTarget(bw(n), bh(n), { type: T.HalfFloatType }), b: new T.WebGLRenderTarget(bw(n), bh(n), { type: T.HalfFloatType }), n }));

const quadScene = new T.Scene(), quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadGeo = new T.BufferGeometry(); quadGeo.setAttribute('position', new T.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)); quadGeo.setAttribute('uv', new T.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
const quad = new T.Mesh(quadGeo, null); quad.frustumCulled = false; quadScene.add(quad);
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
function pass(frag, uniforms) { return new T.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false }); }
function run(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); }

const U = {   // post uniforms (set per frame)
  focus: { value: 8 }, ap: { value: 0 }, near: { value: camera.near }, far: { value: camera.far },
  tint: { value: new T.Vector3(1, 1, 1) }, sat: { value: 1.08 }, con: { value: 1.04 }, vig: { value: 0.32 }, expo: { value: 1.0 },
  bloom: { value: 0.25 }, fade: { value: 0 }, grain: { value: 0.012 }, frame: { value: 0 }, lift: { value: new T.Vector3(0, 0, 0) },
  flash: { value: 0 }, flashCol: { value: new T.Vector3(1, 1, 1) }, whip: { value: new T.Vector2(0, 0) },
};
const matDOF = pass(`
uniform sampler2D tColor, tDepth; uniform float near, far, focus, ap, scale; uniform vec2 res; varying vec2 vUv;
float lin(float d){ float z = d * 2. - 1.; return 2. * near * far / (far + near - z * (far - near)); }
float coc(vec2 uv){ float d = lin(texture2D(tDepth, uv).x); return clamp(ap * abs(d - focus) / d, 0., 26.) * scale; }
void main(){
  float c0 = coc(vUv);
  vec3 col = texture2D(tColor, vUv).rgb;
  if (c0 < 0.6) { gl_FragColor = vec4(col, 1.); return; }
  vec3 acc = col; float ws = 1.;
  const int N = 28;
  for (int i = 0; i < N; i++) {
    float fi = float(i) + .5; float r = sqrt(fi / float(N)) * c0; float a = fi * 2.39996;
    vec2 off = vec2(cos(a), sin(a)) * r / res;
    vec2 uv = vUv + off; float cs = coc(uv);
    float w = smoothstep(r - 1.5, r + 0.5, cs) * 0.9 + 0.1;
    acc += texture2D(tColor, uv).rgb * w; ws += w;
  }
  gl_FragColor = vec4(acc / ws, 1.);
}`, { tColor: { value: rtColor.texture }, tDepth: { value: rtColor.depthTexture }, near: U.near, far: U.far, focus: U.focus, ap: U.ap, scale: { value: S }, res: { value: new T.Vector2(W, H) } });
const matBright = pass(`uniform sampler2D tex; varying vec2 vUv;
void main(){ vec3 c = texture2D(tex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = smoothstep(0.9, 2.2, l); gl_FragColor = vec4(c * k, 1.); }`, { tex: { value: rtA.texture } });
const matBlur = pass(`uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv;
void main(){ vec3 s = texture2D(tex, vUv).rgb * .2270270270;
  s += (texture2D(tex, vUv + dir * 1.3846153846).rgb + texture2D(tex, vUv - dir * 1.3846153846).rgb) * .3162162162;
  s += (texture2D(tex, vUv + dir * 3.2307692308).rgb + texture2D(tex, vUv - dir * 3.2307692308).rgb) * .0702702703; gl_FragColor = vec4(s, 1.); }`, { tex: { value: null }, dir: { value: new T.Vector2() } });
const matFinal = pass(`
uniform sampler2D tColor, b0, b1, b2; uniform vec2 whip; uniform vec3 tint, lift, flashCol; uniform float sat, con, vig, expo, bloom, fade, grain, frame, flash; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0., 1.); }
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec3 c = texture2D(tColor, vUv).rgb;
  if (dot(whip, whip) > 1e-9) { c = vec3(0.); for (int k = 0; k < 10; k++) c += texture2D(tColor, vUv + whip * (float(k) / 9. - .5)).rgb; c /= 10.; }
  c += (texture2D(b0, vUv).rgb * .55 + texture2D(b1, vUv).rgb * .45 + texture2D(b2, vUv).rgb * .4) * bloom;
  c *= expo * tint; c += lift;
  c = aces(c);
  c = pow(c, vec3(1. / 2.2));
  float l = dot(c, vec3(.299, .587, .114)); c = mix(vec3(l), c, sat);
  c = (c - .5) * con + .5;
  vec2 p = vUv - .5; p.x *= res.x / res.y * .75; float v = smoothstep(.2, .95, length(p) * 1.25); c *= 1. - v * vig;
  c += (h12(vUv * res + frame * 1.7) - .5) * grain;
  c = mix(c, flashCol, flash);
  c *= 1. - fade;
  gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
}`, { tColor: { value: rtA.texture }, b0: { value: bl[0].b.texture }, b1: { value: bl[1].b.texture }, b2: { value: bl[2].b.texture }, tint: U.tint, lift: U.lift, flashCol: U.flashCol,
  sat: U.sat, con: U.con, vig: U.vig, expo: U.expo, bloom: U.bloom, fade: U.fade, grain: U.grain, frame: U.frame, flash: U.flash, whip: U.whip, res: { value: new T.Vector2(W, H) } });

function postProcess() {
  run(matDOF, rtA);
  matBright.uniforms.tex.value = rtA.texture; run(matBright, rtBright);
  let src = rtBright.texture;
  for (const L of bl) {
    matBlur.uniforms.tex.value = src; matBlur.uniforms.dir.value.set(1 / L.a.width, 0); run(matBlur, L.a);
    matBlur.uniforms.tex.value = L.a.texture; matBlur.uniforms.dir.value.set(0, 1 / L.a.height); run(matBlur, L.b);
    src = L.b.texture;
  }
  matFinal.uniforms.tColor.value = rtA.texture;
  run(matFinal, null);
}

// ---------- lights (fixed rig; shots only change values, so no shader recompiles) ----------
const hemi = new T.HemisphereLight(0xffffff, 0x888888, 1); scene.add(hemi);
const sun = new T.DirectionalLight(0xffffff, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
scene.add(sun, sun.target);
const rim = new T.DirectionalLight(0xffffff, 0); scene.add(rim, rim.target);
const pts = [0, 1, 2].map(() => { const p = new T.PointLight(0xffffff, 0, 10, 2); scene.add(p); return p; });
scene.fog = new T.FogExp2(0x000000, 0);

// ---------- environment maps (made from small procedural rooms) ----------
const pmrem = new T.PMREMGenerator(renderer);
function makeEnv(top, mid, bot, panels) {
  const s = new T.Scene();
  const g = new T.Mesh(new T.SphereGeometry(50, 32, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false,
    uniforms: { top: { value: new T.Color(...top) }, mid: { value: new T.Color(...mid) }, bot: { value: new T.Color(...bot) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0. ? mix(mid, top, pow(y, .6)) : mix(mid, bot, pow(-y, .6)); gl_FragColor = vec4(c, 1.); }' }));
  s.add(g);
  for (const p of panels) {
    const m = new T.Mesh(new T.PlaneGeometry(p.s[0], p.s[1]), new T.MeshBasicMaterial({ color: new T.Color(...p.c), side: T.DoubleSide }));
    m.position.set(...p.p); m.lookAt(0, 0, 0); s.add(m);
  }
  const rt = pmrem.fromScene(s, 0.03); return rt.texture;
}

// ---------- materials ----------
const matCache = {};
function std(color, rough = 0.6, metal = 0, o = {}) {
  const key = JSON.stringify([color, rough, metal, o.emissive, o.ei, o.map && o.map.uuid, o.transparent, o.opacity, o.side, o.flat, o.ec]);
  if (matCache[key]) return matCache[key];
  const m = new T.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: !!o.flat });
  if (o.emissive !== undefined) { m.emissive = new T.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
  if (o.map) m.map = o.map;
  if (o.transparent) { m.transparent = true; m.opacity = o.opacity ?? 1; m.depthWrite = o.depthWrite ?? false; }
  if (o.side !== undefined) m.side = o.side;
  if (o.envInt !== undefined) m.envMapIntensity = o.envInt;
  return matCache[key] = m;
}
const basic = (color, o = {}) => new T.MeshBasicMaterial(Object.assign({ color, fog: o.fog ?? true }, o));
// outline: inverted hull, pushed out along the normal (thickness in world units)
const outCache = {};
function outlineMat(th, color = 0x14101c) {
  const k = th + '_' + color; if (outCache[k]) return outCache[k];
  const m = new T.MeshBasicMaterial({ color, side: T.BackSide, fog: true });
  m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normalize(normal) * ${th.toFixed(4)};`); };
  m.customProgramCacheKey = () => 'ol' + th.toFixed(4);
  return outCache[k] = m;
}
function addOutline(mesh, th = 0.035, color) { const o = new T.Mesh(mesh.geometry, outlineMat(th, color)); o.userData.isOutline = true; mesh.add(o); return mesh; }
function mesh(geo, mat, o = {}) {
  const m = new T.Mesh(geo, mat); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true;
  if (o.pos) m.position.set(...o.pos); if (o.rot) m.rotation.set(...o.rot); if (o.scl) m.scale.set(...o.scl);
  if (o.ol) addOutline(m, o.ol === true ? 0.03 : o.ol, o.olc);
  if (o.parent) o.parent.add(m); return m;
}
function group(parent, pos, rot) { const g = new T.Group(); if (pos) g.position.set(...pos); if (rot) g.rotation.set(...rot); if (parent) parent.add(g); return g; }

// ---------- geometry helpers ----------
function roundedBox(w, h, d, r, seg = 4) {
  const g = new T.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2); const p = g.attributes.position, n = g.attributes.normal;
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i));
    const ix = clamp(v.x, -hx, hx), iy = clamp(v.y, -hy, hy), iz = clamp(v.z, -hz, hz);
    const dx = v.x - ix, dy = v.y - iy, dz = v.z - iz; const l = Math.hypot(dx, dy, dz) || 1;
    p.setXYZ(i, ix + dx / l * r, iy + dy / l * r, iz + dz / l * r); n.setXYZ(i, dx / l, dy / l, dz / l);
  }
  return g;
}
function lathe(pts, seg = 28) { return new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), seg); }
// gear outline: n teeth, pitch radius r, tooth height th; spokes: number of round cut-outs (0 = solid disc), hole = axle radius
function gearGeo(n, r, th, depth, o = {}) {
  const sh = new T.Shape(), ro = r + th * 0.5, ri = r - th * 0.5, step = Math.PI * 2 / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    const pts = [[ri, -0.30], [ro * 0.985, -0.17], [ro, -0.10], [ro, 0.10], [ro * 0.985, 0.17], [ri, 0.30]];
    for (const [rr, f] of pts) { const aa = a + f * step; const x = Math.cos(aa) * rr, y = Math.sin(aa) * rr; (i === 0 && rr === ri && f < 0) ? sh.moveTo(x, y) : sh.lineTo(x, y); }
    const a2 = a + 0.5 * step; sh.lineTo(Math.cos(a2) * ri, Math.sin(a2) * ri);
  }
  sh.closePath();
  const hole = new T.Path(); hole.absarc(0, 0, o.hole ?? r * 0.12, 0, Math.PI * 2, true); sh.holes.push(hole);
  const sp = o.spokes ?? 0;
  if (sp) for (let i = 0; i < sp; i++) { const a = i / sp * Math.PI * 2, c = new T.Path(); c.absarc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * (o.spokeR ?? 0.2), 0, Math.PI * 2, true); sh.holes.push(c); }
  const g = new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.18, bevelSize: th * 0.12, bevelSegments: 1, curveSegments: 8 });
  g.translate(0, 0, -depth / 2); return g;
}
// gear that turns: returns object with mesh; set rotation.z each frame. Mesh pair: tooth of A points along the centre line when angle = alpha
function meshAngles(Na, Nb, theta, alpha) { return [alpha + theta, alpha + Math.PI - Math.PI / Nb - theta * Na / Nb]; }

// ---------- canvas textures ----------
function ctex(w, h, fn, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x, w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
  if (o.repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...o.repeat); }
  return t;
}

// ---------- cameras ----------
// shot camera spec: {p:[x,y,z], l:[x,y,z], fov, roll, focus, ap}; helpers build them from u in 0..1
const camV = { p: V3(0, 0, 0), l: V3(0, 0, 0) };
function applyCam(c, t) {
  camera.position.set(...c.p);
  // gentle hand-held life
  const hh = (c.shake ?? 0.012);
  camera.position.x += (vnoise(t * 1.3, 1.5) - .5) * hh * 2; camera.position.y += (vnoise(t * 1.1, 7.5) - .5) * hh * 2; camera.position.z += (vnoise(t * 0.9, 3.5) - .5) * hh;
  if (c.shk) { const k = c.shk; camera.position.x += (vnoise(t * 6.5, 21.5) - .5) * k; camera.position.y += (vnoise(t * 6.1, 31.5) - .5) * k; camera.position.z += (vnoise(t * 5.7, 41.5) - .5) * k * .6; }
  camera.up.set(0, 1, 0); camera.lookAt(...c.l);
  if (c.roll) camera.rotateZ(c.roll);
  camera.fov = c.fov ?? 40; camera.updateProjectionMatrix();
  const d = camera.position.distanceTo(V3(...c.l));
  U.focus.value = c.focus ?? d; U.ap.value = c.ap ?? 0;
}
const orbit = (cx, cy, cz, r, a, h, lookY) => ({ p: [cx + Math.sin(a) * r, h, cz + Math.cos(a) * r], l: [cx, lookY ?? cy, cz] });
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ---------- 2D overlay (captions, labels) ----------
const out2 = document.createElement('canvas'); out2.width = W; out2.height = H; const g2 = out2.getContext('2d');

const SHOTS = [];                 // filled by shots*.js: {id, t0, locs:[...], light, cam(u,t,s), update(u,t,s), over(ctx,u,t,s)}
const lineT = id => TL.lines[id].start;
