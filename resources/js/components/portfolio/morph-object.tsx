import { useEffect, useRef } from 'react';

/**
 * Scroll-driven abstract object for the hero.
 *
 * Morphs across three states as you scroll through the hero:
 *   0.0 → particle cloud (dissolved shell)
 *   0.5 → dense speckled ring
 *   1.0 → solid topographic sphere
 *
 * Implementation notes:
 *   - No Three.js. Screen coords are projected onto a sphere analytically, so
 *     there is no geometry, no raymarch, and no library — one fragment shader.
 *   - Contour bands come from fract() on a domain-warped noise field, which is
 *     what gives the gyroid/topographic surface.
 *   - Renders premultiplied over a transparent canvas so GridBackground's dots
 *     stay visible behind it.
 *   - Scroll is sampled once per frame inside the rAF loop, never via a scroll
 *     listener.
 *   - Pauses when off-screen or the tab is hidden. Static frame under
 *     prefers-reduced-motion.
 */

// Peak opacity of the object. Held low so hero text keeps its measured
// contrast against the background rather than against the object.
const ALPHA = 0.42;

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FS = `precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform float u_morph;
uniform vec3 u_accent;
uniform float u_alpha;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

float noise(vec3 p){
  vec3 i=floor(p);vec3 f=fract(p);
  f=f*f*(3.0-2.0*f);
  vec2 uv=i.xy+vec2(37.0,17.0)*i.z;
  float a=hash(uv);
  float b=hash(uv+vec2(1.0,0.0));
  float c=hash(uv+vec2(0.0,1.0));
  float d=hash(uv+vec2(1.0,1.0));
  float n0=mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
  vec2 uv2=uv+vec2(37.0,17.0);
  float a2=hash(uv2);
  float b2=hash(uv2+vec2(1.0,0.0));
  float c2=hash(uv2+vec2(0.0,1.0));
  float d2=hash(uv2+vec2(1.0,1.0));
  float n1=mix(mix(a2,b2,f.x),mix(c2,d2,f.x),f.y);
  return mix(n0,n1,f.z);
}

float fbm(vec3 p){
  float v=0.0;float a=0.5;
  for(int i=0;i<4;i++){v+=a*noise(p);p*=2.02;a*=0.5;}
  return v;
}

void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/min(u_res.x,u_res.y);
  float r2=dot(uv,uv);
  float R=0.36;

  if(r2>R*R*2.6){discard;}

  float inside=step(r2,R*R);
  float z=sqrt(max(R*R-r2,0.0));
  vec3 n=normalize(vec3(uv,z));

  vec3 q=n*2.6;
  q.xz=mat2(cos(u_t*0.12),-sin(u_t*0.12),sin(u_t*0.12),cos(u_t*0.12))*q.xz;
  float f=fbm(q+vec3(0.0,u_t*0.05,0.0));
  float warp=fbm(q*1.7+f*1.4);

  // Topographic contour bands
  float bands=fract(warp*7.0);
  float ridge=smoothstep(0.42,0.5,bands)*smoothstep(0.58,0.5,bands);
  float shade=0.35+0.65*max(dot(n,normalize(vec3(-0.4,0.7,0.6))),0.0);
  float rim=pow(1.0-max(z/R,0.0),2.2);

  vec3 solid=u_accent*(shade*0.9+ridge*0.55)+u_accent*rim*0.5;
  float solidA=inside*(0.10+0.42*ridge)+inside*rim*0.30;

  // Particle shell — dissolve the surface into speckles that drift outward
  float spread=1.0+(1.0-u_morph)*0.62;
  float rd=sqrt(r2)/(R*spread);
  float shell=smoothstep(1.05,0.62,rd)*smoothstep(0.30,0.68,rd);
  vec2 cell=floor(gl_FragCoord.xy/2.0);
  float grain=hash(cell+floor(u_t*6.0)*0.0);
  float keep=step(grain,0.10+0.26*warp);
  float partA=shell*keep*(0.6+0.5*ridge);
  vec3 part=u_accent*(0.75+0.75*ridge)+vec3(0.55)*ridge*0.5;

  float m=smoothstep(0.0,1.0,u_morph);
  vec3 col=mix(part,solid,m);
  float a=mix(partA,solidA,m)*u_alpha;

  if(a<0.004){discard;}
  gl_FragColor=vec4(col*a,a);
}`;

export default function MorphObject({ className = '' }: { className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
        if (!gl) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const compile = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
            return s;
        };
        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(prog));
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        const U = {
            res: gl.getUniformLocation(prog, 'u_res'),
            t: gl.getUniformLocation(prog, 'u_t'),
            morph: gl.getUniformLocation(prog, 'u_morph'),
            accent: gl.getUniformLocation(prog, 'u_accent'),
            alpha: gl.getUniformLocation(prog, 'u_alpha'),
        };

        // Accent is read from the theme token so the object flips with the site
        const readAccent = (): [number, number, number] => {
            const hex =
                getComputedStyle(document.documentElement).getPropertyValue('--portfolio-accent').trim() || '#7DD96E';
            const h = hex.replace('#', '');
            return [
                parseInt(h.slice(0, 2), 16) / 255,
                parseInt(h.slice(2, 4), 16) / 255,
                parseInt(h.slice(4, 6), 16) / 255,
            ];
        };
        let accent = readAccent();
        const themeWatch = new MutationObserver(() => {
            accent = readAccent();
        });
        themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            canvas.width = Math.max(Math.floor(rect.width * dpr), 1);
            canvas.height = Math.max(Math.floor(rect.height * dpr), 1);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        let visible = true;
        const io = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible && !raf && !reduced) raf = requestAnimationFrame(frame);
            },
            { rootMargin: '160px' },
        );
        io.observe(canvas);

        let raf = 0;
        const start = performance.now();

        const frame = (now: number) => {
            // Morph is driven by how far the object has travelled up the viewport.
            // Sampled here, once per frame — never in a scroll listener.
            const vh = window.innerHeight;
            const morph = Math.min(window.scrollY / (vh * 0.85), 1);
            // Hand off to the page: hold through the morph, then fade out over
            // half a viewport so the object never just pops away.
            const fade = 1 - Math.min(Math.max((window.scrollY - vh * 0.85) / (vh * 0.5), 0), 1);

            gl.uniform2f(U.res, canvas.width, canvas.height);
            gl.uniform1f(U.t, reduced ? 6 : (now - start) / 1000);
            gl.uniform1f(U.morph, reduced ? 1 : morph);
            gl.uniform3fv(U.accent, accent);
            gl.uniform1f(U.alpha, ALPHA * fade);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            raf = visible && !reduced ? requestAnimationFrame(frame) : 0;
        };

        const onVisibility = () => {
            if (document.hidden) {
                if (raf) cancelAnimationFrame(raf);
                raf = 0;
            } else if (!raf && visible && !reduced) {
                raf = requestAnimationFrame(frame);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        frame(performance.now());

        return () => {
            if (raf) cancelAnimationFrame(raf);
            io.disconnect();
            themeWatch.disconnect();
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    return <canvas ref={ref} aria-hidden="true" className={className} />;
}
