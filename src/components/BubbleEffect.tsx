"use client";

import { useEffect, useRef } from "react";

export default function BubbleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const bubbleCount = isTouchDevice ? 12 : 25;
    const bubbles: Bubble[] = [];
    let mouseX = -500;
    let mouseY = -500;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      container.style.pointerEvents = "auto";
    }

    class Bubble {
      element: HTMLDivElement;
      x: number = 0;
      y: number = 0;
      speedX: number = 0;
      speedY: number = 0;
      scale: number = 1;
      opacity: number = 1;
      popping: boolean = false;

      constructor() {
        this.element = document.createElement("div");
        this.element.className = "heart-bubble";
        container?.appendChild(this.element);
        this.reset(true);

        if (isTouchDevice) {
          this.element.addEventListener("click", (e) => this.pop(e));
          this.element.addEventListener(
            "touchstart",
            (e) => e.stopPropagation(),
            { passive: true }
          );
        }
      }

      reset(initial = false) {
        this.popping = false;
        this.element.classList.remove("popping");
        this.x = Math.random() * window.innerWidth;
        this.y = initial
          ? Math.random() * window.innerHeight
          : window.innerHeight + 50;
        this.speedY = 0.5 + Math.random() * 1.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.scale = 0.5 + Math.random() * 0.7;
        this.opacity = 0.3 + Math.random() * 0.5;
        this.element.style.opacity = this.opacity.toString();
        this.updateTransform();
      }

      pop(e: Event) {
        if (this.popping) return;
        this.popping = true;
        this.element.classList.add("popping");
        setTimeout(() => {
          this.reset();
        }, 300);
      }

      update() {
        if (this.popping) return;
        this.y -= this.speedY;
        this.x += this.speedX;

        if (!isTouchDevice) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const attractionRadius = 150;
          if (distance < attractionRadius) {
            const force = (attractionRadius - distance) / attractionRadius;
            this.x += dx * force * 0.03;
            this.y += dy * force * 0.03;
          }
        }

        if (this.y < -50) {
          this.reset();
        }
        this.updateTransform();
      }

      updateTransform() {
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(45deg) scale(${this.scale})`;
      }
    }

    // Initialize bubbles
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push(new Bubble());
    }

    let animationFrameId: number;
    function animate() {
      bubbles.forEach((b) => b.update());
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      if (!isTouchDevice) {
        bubbles.forEach((b) => b.reset(true));
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="bubble-container"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden"
    />
  );
}
