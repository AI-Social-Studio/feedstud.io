interface WaveConfig {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

class Wave {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;
  private current: number = 0;

  constructor(config: WaveConfig = {}) {
    this.phase = config.phase ?? 0;
    this.offset = config.offset ?? 0;
    this.frequency = config.frequency ?? 0.001;
    this.amplitude = config.amplitude ?? 1;
  }

  update(): number {
    this.phase += this.frequency;
    this.current = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.current;
  }
}

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

function createLine(spring: number, pos: { x: number; y: number }): TrailLine {
  return {
    spring: spring + 0.1 * Math.random() - 0.05,
    friction: CONFIG.friction + 0.01 * Math.random() - 0.005,
    nodes: Array.from({ length: CONFIG.size }, () => ({
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
  let frameId = 0;
  const pos = { x: 0, y: 0 };
  let lines: TrailLine[] = [];

  const wave = new Wave({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });

  function resize() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight;
  }

  function initLines() {
    lines = Array.from({ length: CONFIG.trails }, (_, i) =>
      createLine(0.45 + (i / CONFIG.trails) * 0.025, pos)
    );
  }

  function render() {
    if (!running) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `hsla(${Math.round(wave.update())},100%,50%,0.025)`;
    ctx.lineWidth = 10;
    for (const line of lines) {
      updateLine(line, pos);
      drawLine(line, ctx);
    }
    frameId = requestAnimationFrame(render);
  }

  function handlePointer(e: MouseEvent | TouchEvent) {
    if ("touches" in e) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    } else {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }
    e.preventDefault();
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
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
    render();
  }

  function handleFocus() {
    if (!running) {
      running = true;
      render();
    }
  }

  function handleBlur() {
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
  }

  document.addEventListener("mousemove", onFirstInteraction as EventListener);
  document.addEventListener("touchstart", onFirstInteraction as EventListener);
  window.addEventListener("resize", resize);
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
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("blur", handleBlur);
  };
}
