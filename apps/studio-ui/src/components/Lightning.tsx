import React, { useRef, useEffect } from 'react';
import './Lightning.css';

interface LightningProps {
    hue?: number;
    xOffset?: number;
    speed?: number;
    intensity?: number;
    size?: number;
}

const Lightning: React.FC<LightningProps> = ({
    hue = 230,
    xOffset = 0,
    speed = 1,
    intensity = 1,
    size = 1
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Optimization: Render at 0.5 scale
                const scale = 0.5;
                canvas.width = parent.clientWidth * scale;
                canvas.height = parent.clientHeight * scale;
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

        const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      
      #define OCTAVE_COUNT 4

      // --- Utilities ---
      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      // 2D Noise
      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      // Fractal Brownian Motion for Clouds
      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p = rot * p * 2.0 + vec2(100.0);
              amplitude *= 0.5;
          }
          return value;
      }

      // Star Field
      float stars(vec2 uv, float t) {
          // Increase scale for smaller, sharper stars
          float n = hash12(uv * 400.0); 
          
          // Much higher threshold for fewer stars (0.995 -> 0.9992)
          float star = step(0.9992, n); 
          
          // Subtle Twinkle: range [0.7, 1.0] instead of [0.0, 1.0]
          // Slower speed (t * 1.5)
          float twinkle = sin(t * 1.5 + n * 100.0) * 0.15 + 0.85;
          
          return star * twinkle;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= iResolution.x / iResolution.y;

          // --- 1. Lightning Logic (Determine position & intensity first) ---
          float timeBucket = floor(iTime * 1.5); 
          float strikeChance = hash12(vec2(timeBucket, 12.34));
          
          float lightningIntensity = 0.0;
          float boltX = 0.0;
          
          if (strikeChance > 0.6) { // 40% chance of strike in a bucket
              float localTime = fract(iTime * 1.5);
              
              // Random X pos for this bucket
              boltX = (hash12(vec2(timeBucket, 56.78)) - 0.5) * 3.0;
              
              // Flash pulse (sharp rise, slow decay)
              float flash = max(0.0, 1.0 - abs(localTime * 8.0 - 1.0)); // simple spike
              
              // Add some flicker
              flash *= step(0.2, hash12(vec2(iTime * 20.0, 0.0))); 
              
              lightningIntensity = flash * uIntensity;
          }

          // --- 2. Background Sky ---
          vec3 skyCol = vec3(0.0, 0.0, 0.05); // Very dark blue/black base
          
          // Add Stars
          float s = stars(uv, iTime);
          skyCol += vec3(s);

          // --- 3. Clouds ---
          // Two layers of clouds for depth
          float cloudTime = iTime * 0.05 * uSpeed;
          float q = fbm(uv * 3.0 + vec2(cloudTime, 0.0));
          
          // Second warmer layer
          float r = fbm(uv * 6.0 + q + vec2(cloudTime * 1.5, 10.0));
          
          float cloudDensity = smoothstep(0.2, 0.8, r);
          
          // Cloud Color: Normally dark grey/blue
          vec3 cloudCol = vec3(0.08, 0.1, 0.15); 
          
          // --- 4. Lightning Integration ---
          // Draw the Bolt Shape
          float boltDist = abs(p.x - boltX + fbm(p * 2.0 + iTime*5.0) * 0.5);
          float boltShape = 0.02 / max(boltDist, 0.001);
          boltShape *= lightningIntensity;

          // Light up clouds based on lightning intensity
          // The clouds near the bolt get brighter
          vec3 lightingColor = hsv2rgb(vec3(uHue / 360.0, 0.6, 0.9));
          
          // Ambient lighting for clouds (global flash)
          cloudCol += lightingColor * lightningIntensity * 0.3; 
          
          // Direct lightning glow on clouds
          float proximity = 1.0 / (abs(p.x - boltX) + 0.5);
          cloudCol += lightingColor * lightningIntensity * proximity * cloudDensity * 2.0;

          // Mix Sky and Clouds
          vec3 finalCol = mix(skyCol, cloudCol, cloudDensity);
          
          // Add the visible bolt on top
          finalCol += lightingColor * boltShape;

          fragColor = vec4(finalCol, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

        const compileShader = (source: string, type: number) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
        const iTimeLocation = gl.getUniformLocation(program, 'iTime');
        const uHueLocation = gl.getUniformLocation(program, 'uHue');
        const uXOffsetLocation = gl.getUniformLocation(program, 'uXOffset');
        const uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
        const uIntensityLocation = gl.getUniformLocation(program, 'uIntensity');
        const uSizeLocation = gl.getUniformLocation(program, 'uSize');

        const startTime = performance.now();
        let animationFrameId: number;
        let lastDrawTime = 0;
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        const render = (time: number) => {
            animationFrameId = requestAnimationFrame(render);

            const elapsed = time - lastDrawTime;
            if (elapsed < frameInterval) return;

            lastDrawTime = time - (elapsed % frameInterval);

            // Check resize (account for scale 0.5)
            const parent = canvas.parentElement;
            if (parent && (canvas.width !== parent.clientWidth * 0.5 || canvas.height !== parent.clientHeight * 0.5)) {
                resizeCanvas();
            }

            gl.viewport(0, 0, canvas.width, canvas.height);
            if (iResolutionLocation) gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);

            const currentTime = performance.now();
            if (iTimeLocation) gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
            if (uHueLocation) gl.uniform1f(uHueLocation, hue);
            if (uXOffsetLocation) gl.uniform1f(uXOffsetLocation, xOffset);
            if (uSpeedLocation) gl.uniform1f(uSpeedLocation, speed);
            if (uIntensityLocation) gl.uniform1f(uIntensityLocation, intensity);
            if (uSizeLocation) gl.uniform1f(uSizeLocation, size);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        render(performance.now());

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [hue, xOffset, speed, intensity, size]);

    return <canvas ref={canvasRef} className="lightning-container" />;
};

export default Lightning;
