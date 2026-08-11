import { useRef, useEffect } from 'react';



const PatternShapes = { Checks: 0, Stripes: 1, Edge: 2 };

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
    float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);

    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float t = .5 * u_time;

    float noise_scale = .0005 + .006 * u_scale;

    uv -= .5;
    uv *= (noise_scale * u_resolution);
    uv = rotate(uv, u_rotation * .5 * PI);
    uv /= u_pixelRatio;
    uv += .5;

    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += 4. * u_distortion * n2 * cos(angle);
    uv.y += 4. * u_distortion * n2 * sin(angle);

    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (float i = 1.; i <= iterations_number; i++) {
        uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
    }

    float proportion = clamp(u_proportion, 0., 1.);

    float shape = 0.;
    float mixer = 0.;
    if (u_shape < .5) {
      vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
      shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else if (u_shape < 1.5) {
      vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
      float f = fract(stripes_shape_uv.y);
      shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
      mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
    } else {
      float sh = 1. - uv.y;
      sh -= .5;
      sh /= (noise_scale * u_resolution.y);
      sh += .5;
      float shape_scaling = .2 * (1. - u_shapeScale);
      shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
      mixer = shape;
    }

    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);

    fragColor = vec4(color_mix.rgb, color_mix.a);
}
`;

const parseColor = (colorStr, defaultArray = [0, 0, 0, 1]) => {
    if (!colorStr) return defaultArray;
    if (colorStr.startsWith('#')) {
        let hex = colorStr.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map((c) => c + c).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16) / 255 || 0;
        const g = parseInt(hex.slice(2, 4), 16) / 255 || 0;
        const b = parseInt(hex.slice(4, 6), 16) / 255 || 0;
        const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1.0;
        return [r, g, b, a];
    }
    if (colorStr.startsWith('rgb')) {
        const match = colorStr.match(/[\d.]+/g);
        if (match && match.length >= 3) {
            return [
                parseFloat(match[0]) / 255,
                parseFloat(match[1]) / 255,
                parseFloat(match[2]) / 255,
                match[3] ? parseFloat(match[3]) : 1.0
            ];
        }
    }
    return defaultArray;
};

const AnimatedLiquidBackground = ({
    color1 = '#0f0c29',
    color2 = '#4f46e5',
    color3 = '#7c3aed',
    scale = 0.55,
    rotation = -0.5,
    proportion = 0.4,
    distortion = 0.3,
    swirl = 0.7,
    swirlIterations = 12,
    softness = 0.95,
    shape = PatternShapes.Checks,
    shapeSize = 0.25,
    speed = 0.35,
    opacity = 0.9
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2', { alpha: true, powerPreference: 'high-performance' });
        if (!gl) {
            console.warn('WebGL2 not supported for AnimatedLiquidBackground');
            return;
        }

        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertexShaderSource);
        gl.compileShader(vertShader);

        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragmentShaderSource);
        gl.compileShader(fragShader);

        const program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader compilation failed:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        );

        const posAttribLocation = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(posAttribLocation);
        gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, 'u_time');
        const uPixelRatio = gl.getUniformLocation(program, 'u_pixelRatio');
        const uResolution = gl.getUniformLocation(program, 'u_resolution');
        const uScale = gl.getUniformLocation(program, 'u_scale');
        const uRotation = gl.getUniformLocation(program, 'u_rotation');
        const uColor1 = gl.getUniformLocation(program, 'u_color1');
        const uColor2 = gl.getUniformLocation(program, 'u_color2');
        const uColor3 = gl.getUniformLocation(program, 'u_color3');
        const uProportion = gl.getUniformLocation(program, 'u_proportion');
        const uSoftness = gl.getUniformLocation(program, 'u_softness');
        const uShape = gl.getUniformLocation(program, 'u_shape');
        const uShapeScale = gl.getUniformLocation(program, 'u_shapeScale');
        const uDistortion = gl.getUniformLocation(program, 'u_distortion');
        const uSwirl = gl.getUniformLocation(program, 'u_swirl');
        const uSwirlIterations = gl.getUniformLocation(program, 'u_swirlIterations');

        let animationFrameId;
        let isIntersecting = true;
        let startTime = performance.now();

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        handleResize();

        const render = (time) => {
            animationFrameId = requestAnimationFrame(render);
            if (!isIntersecting) return;

            const isLight = document.body.classList.contains('light-theme');

            // Dynamic theme colors matching project palette:
            // Dark Mode: Deep Midnight (#0f0c29), Primary Indigo (#4f46e5), Admin Purple (#7c3aed)
            // Light Mode: Slate White (#f8fafc), Soft Indigo Tint (#c7d2fe), Soft Violet Tint (#e9d5ff)
            const activeColor1 = isLight ? '#f8fafc' : color1;
            const activeColor2 = isLight ? '#c7d2fe' : color2;
            const activeColor3 = isLight ? '#e9d5ff' : color3;

            const elapsedTime = (time - startTime) * 0.001 * speed;

            const width = canvas.width;
            const height = canvas.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            gl.useProgram(program);
            gl.uniform1f(uTime, elapsedTime);
            gl.uniform1f(uPixelRatio, dpr);
            gl.uniform2f(uResolution, width, height);

            gl.uniform1f(uScale, scale);
            gl.uniform1f(uRotation, rotation);
            gl.uniform4fv(uColor1, parseColor(activeColor1, [0.06, 0.05, 0.16, 1]));
            gl.uniform4fv(uColor2, parseColor(activeColor2, [0.31, 0.27, 0.90, 1]));
            gl.uniform4fv(uColor3, parseColor(activeColor3, [0.49, 0.23, 0.93, 1]));

            gl.uniform1f(uProportion, proportion);
            gl.uniform1f(uSoftness, softness);
            gl.uniform1f(uShape, shape);
            gl.uniform1f(uShapeScale, shapeSize);
            gl.uniform1f(uDistortion, distortion);
            gl.uniform1f(uSwirl, swirl);
            gl.uniform1f(uSwirlIterations, swirlIterations);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        animationFrameId = requestAnimationFrame(render);

        const observer = new IntersectionObserver((entries) => {
            if (entries[0]) {
                isIntersecting = entries[0].isIntersecting;
            }
        });
        observer.observe(canvas);

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            gl.deleteBuffer(positionBuffer);
        };
    }, [
        color1, color2, color3, scale, rotation, proportion,
        distortion, swirl, swirlIterations, softness, shape,
        shapeSize, speed
    ]);

    return (
        <div
            className="full-body-liquid-bg"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: -1,
                overflow: 'hidden',
                opacity
            }}
            aria-hidden="true"
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block'
                }}
            />
        </div>
    );
};

export default AnimatedLiquidBackground;
