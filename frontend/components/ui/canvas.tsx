const TRAIL_COLOR = "hsla(220, 93%, 50%, 0.025)";

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface TrailLine {
  spring: number;
  friction: number;
  nodes: NodePoint[];
}

const CONFIG = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

type RuntimeConfig = typeof CONFIG & {
  lineWidth: number;
  compositeOperation: GlobalCompositeOperation;
  pixelRatio: number;
  strokeColor: string;
};

function createLine(spring: number, pos: { x: number; y: number }, config: typeof CONFIG): TrailLine {
  return {
    spring: spring + 0.1 * Math.random() - 0.05,
    friction: CONFIG.friction + 0.01 * Math.random() - 0.005,
    nodes: Array.from({ length: config.size }, () => ({
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
    })),
  };
}

function updateLine(line: TrailLine, pos: { x: number; y: number }) {
  let spring = line.spring;
  const first = line.nodes[0];
  first.vx += (pos.x - first.x) * spring;
  first.vy += (pos.y - first.y) * spring;

  for (let i = 0; i < line.nodes.length; i++) {
    const node = line.nodes[i];
    if (i > 0) {
      const prev = line.nodes[i - 1];
      node.vx += (prev.x - node.x) * spring;
      node.vy += (prev.y - node.y) * spring;
      node.vx += prev.vx * CONFIG.dampening;
      node.vy += prev.vy * CONFIG.dampening;
    }
    node.vx *= line.friction;
    node.vy *= line.friction;
    node.x += node.vx;
    node.y += node.vy;
    spring *= CONFIG.tension;
  }
}

function drawLine(line: TrailLine, ctx: CanvasRenderingContext2D) {
  let x = line.nodes[0].x;
  let y = line.nodes[0].y;
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 1; i < line.nodes.length - 2; i++) {
    const curr = line.nodes[i];
    const next = line.nodes[i + 1];
    x = 0.5 * (curr.x + next.x);
    y = 0.5 * (curr.y + next.y);
    ctx.quadraticCurveTo(curr.x, curr.y, x, y);
  }

  const secondLast = line.nodes[line.nodes.length - 2];
  const last = line.nodes[line.nodes.length - 1];
  ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
  ctx.stroke();
  ctx.closePath();
}

export function renderCanvas() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx = context;

  let running = true;
  let hasStarted = false;
  let frameId = 0;
  const pos = { x: 0, y: 0 };
  let lines: TrailLine[] = [];
  let canvasRect = canvas.getBoundingClientRect();
  const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
  const runtimeConfig: RuntimeConfig = isFirefox
      ? {
        ...CONFIG,
        trails: 52,
        size: 38,
        lineWidth: 8.5,
        compositeOperation: "source-over",
        pixelRatio: 1,
        strokeColor: "hsla(220, 93%, 50%, 0.05)",
      }
    : {
        ...CONFIG,
        lineWidth: 10,
        compositeOperation: "lighter",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        strokeColor: TRAIL_COLOR,
      };

  function resize() {
    const width = window.innerWidth - 20;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * runtimeConfig.pixelRatio);
    canvas.height = Math.floor(height * runtimeConfig.pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(runtimeConfig.pixelRatio, 0, 0, runtimeConfig.pixelRatio, 0, 0);
    canvasRect = canvas.getBoundingClientRect();
  }

  function syncCanvasRect() {
    canvasRect = canvas.getBoundingClientRect();
  }

  function initLines() {
    lines = Array.from({ length: runtimeConfig.trails }, (_, i) =>
      createLine(0.45 + (i / runtimeConfig.trails) * 0.025, pos, runtimeConfig)
    );
  }

  function render() {
    if (!running) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = runtimeConfig.compositeOperation;
    ctx.strokeStyle = runtimeConfig.strokeColor;
    ctx.lineWidth = runtimeConfig.lineWidth;
    for (const line of lines) {
      updateLine(line, pos);
      drawLine(line, ctx);
    }
    frameId = requestAnimationFrame(render);
  }

  function getCanvasPos(clientX: number, clientY: number) {
    return { x: clientX - canvasRect.left, y: clientY - canvasRect.top };
  }

  function handlePointer(e: MouseEvent | TouchEvent) {
    if ("touches" in e) {
      const p = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
      pos.x = p.x;
      pos.y = p.y;
    } else {
      const p = getCanvasPos(e.clientX, e.clientY);
      pos.x = p.x;
      pos.y = p.y;
    }
    if ("touches" in e) e.preventDefault();
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      const p = getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
      pos.x = p.x;
      pos.y = p.y;
    }
  }

  function onFirstInteraction(e: MouseEvent | TouchEvent) {
    document.removeEventListener("mousemove", onFirstInteraction as EventListener);
    document.removeEventListener("touchstart", onFirstInteraction as EventListener);
    document.addEventListener("mousemove", handlePointer as EventListener);
    document.addEventListener("touchmove", handlePointer as EventListener, { passive: false });
    document.addEventListener("touchstart", handleTouchStart as EventListener);
    handlePointer(e);
    initLines();
    running = true;
    hasStarted = true;
    render();
  }

  function handleFocus() {
    if (hasStarted && !running) {
      running = true;
      render();
    }
  }

  function handleBlur() {
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  }

  document.addEventListener("mousemove", onFirstInteraction as EventListener);
  document.addEventListener("touchstart", onFirstInteraction as EventListener);
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", syncCanvasRect, { passive: true });
  window.addEventListener("focus", handleFocus);
  window.addEventListener("blur", handleBlur);

  resize();

  return () => {
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    document.removeEventListener("mousemove", onFirstInteraction as EventListener);
    document.removeEventListener("touchstart", onFirstInteraction as EventListener);
    document.removeEventListener("mousemove", handlePointer as EventListener);
    document.removeEventListener("touchmove", handlePointer as EventListener);
    document.removeEventListener("touchstart", handleTouchStart as EventListener);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", syncCanvasRect);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("blur", handleBlur);
  };
}
