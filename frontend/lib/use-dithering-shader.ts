"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

type DitheringShaderHookArgs = {
  animationRef: RefObject<number>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  colorBack: string;
  colorFront: string;
  createProgram: (gl: WebGL2RenderingContext, vs: string, fs: string) => WebGLProgram | null;
  fragmentShaderSource: string;
  glRef: RefObject<WebGL2RenderingContext | null>;
  height: number;
  hexToRgba: (hex: string) => [number, number, number, number];
  programRef: RefObject<WebGLProgram | null>;
  pxSize: number;
  speed: number;
  startTimeRef: RefObject<number>;
  uniformsRef: RefObject<Record<string, WebGLUniformLocation | null>>;
  vertexShaderSource: string;
  width: number;
};

export function useDitheringShader({
  animationRef,
  canvasRef,
  colorBack,
  colorFront,
  createProgram,
  fragmentShaderSource,
  glRef,
  height,
  hexToRgba,
  programRef,
  pxSize,
  speed,
  startTimeRef,
  uniformsRef,
  vertexShaderSource,
  width,
}: DitheringShaderHookArgs) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;
    glRef.current = gl;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;
    programRef.current = program;

    uniformsRef.current = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_colorBack: gl.getUniformLocation(program, "u_colorBack"),
      u_colorFront: gl.getUniformLocation(program, "u_colorFront"),
      u_shape: gl.getUniformLocation(program, "u_shape"),
      u_type: gl.getUniformLocation(program, "u_type"),
      u_pxSize: gl.getUniformLocation(program, "u_pxSize"),
    };

    const posLoc = gl.getAttribLocation(program, "a_position");
    const buf = gl.createBuffer();
    if (!buf) {
      gl.deleteProgram(program);
      programRef.current = null;
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    startTimeRef.current = performance.now();

    // This shader keeps drawing a full-size WebGL frame every tick forever, so
    // pause it whenever the canvas scrolls out of view instead of burning GPU
    // time on a section the user isn't looking at (e.g. the CTA near the footer).
    let isVisible = false;

    const render = () => {
      const t = (performance.now() - startTimeRef.current) * 0.001 * speed;
      const ctx = glRef.current;
      const prog = programRef.current;
      if (!ctx || !prog) return;

      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.useProgram(prog);

      const u = uniformsRef.current;
      if (u.u_time) ctx.uniform1f(u.u_time, t);
      if (u.u_resolution) ctx.uniform2f(u.u_resolution, width, height);
      if (u.u_colorBack) ctx.uniform4fv(u.u_colorBack, hexToRgba(colorBack));
      if (u.u_colorFront) ctx.uniform4fv(u.u_colorFront, hexToRgba(colorFront));
      if (u.u_shape) ctx.uniform1f(u.u_shape, 6);
      if (u.u_type) ctx.uniform1f(u.u_type, 3);
      if (u.u_pxSize) ctx.uniform1f(u.u_pxSize, pxSize);

      ctx.drawArrays(ctx.TRIANGLES, 0, 6);
      animationRef.current = isVisible ? requestAnimationFrame(render) : 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationRef.current) {
          animationRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      gl.deleteBuffer(buf);
      if (glRef.current && programRef.current) glRef.current.deleteProgram(programRef.current);
    };
  }, [
    animationRef,
    canvasRef,
    colorBack,
    colorFront,
    createProgram,
    fragmentShaderSource,
    glRef,
    height,
    hexToRgba,
    programRef,
    pxSize,
    speed,
    startTimeRef,
    uniformsRef,
    vertexShaderSource,
    width,
  ]);
}
