"use client";

import * as React from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";

export type CardStackItem = {
  id: string | number;
  title: string;
  imageSrc?: string;
};

// Simple clsx utility replacement
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;

  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

type CardStackProps<T extends CardStackItem> = {
  items: T[];
  initialIndex?: number;
  maxVisible?: number;
  cardWidth?: number;
  cardHeight?: number;
  overlap?: number;
  spreadDeg?: number;
  perspectivePx?: number;
  activeScale?: number;
  inactiveScale?: number;
  springStiffness?: number;
  springDamping?: number;
  loop?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
  className?: string;
};

function HeroCardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 7,
  cardWidth = 520,
  cardHeight = 320,
  overlap = 0.48,
  spreadDeg = 0,
  perspectivePx = 1100,
  activeScale = 1.03,
  inactiveScale = 0.94,
  springStiffness = 280,
  springDamping = 28,
  loop = true,
  autoAdvance = false,
  intervalMs = 2800,
  pauseOnHover = true,
  className,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const len = items.length;

  const [active, setActive] = React.useState(() => wrapIndex(initialIndex, len));
  const [hovering, setHovering] = React.useState(false);

  React.useEffect(() => {
    setActive((a) => wrapIndex(a, len));
  }, [len]);

  const maxOffset = Math.max(0, Math.floor(maxVisible / 2));
  const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)));
  const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;

  const canGoPrev = loop || active > 0;
  const canGoNext = loop || active < len - 1;

  const prev = React.useCallback(() => {
    if (!len) return;
    if (!canGoPrev) return;
    setActive((a) => wrapIndex(a - 1, len));
  }, [canGoPrev, len]);

  const next = React.useCallback(() => {
    if (!len) return;
    if (!canGoNext) return;
    setActive((a) => wrapIndex(a + 1, len));
  }, [canGoNext, len]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  React.useEffect(() => {
    if (!autoAdvance) return;
    if (reduceMotion) return;
    if (!len) return;
    if (pauseOnHover && hovering) return;

    const id = window.setInterval(
      () => {
        if (loop || active < len - 1) next();
      },
      Math.max(700, intervalMs),
    );

    return () => window.clearInterval(id);
  }, [autoAdvance, intervalMs, hovering, pauseOnHover, reduceMotion, len, loop, active, next]);

  if (!len) return null;

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="relative w-full flex justify-center"
        style={{ height: cardHeight }}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-48 w-[70%] rounded-full bg-black/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-40 w-[76%] rounded-full bg-black/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="relative flex items-end justify-center w-full"
          style={{ perspective: `${perspectivePx}px` }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const off = signedOffset(i, active, len, loop);
              const on = i === active;
              const abs = Math.abs(off);
              const visible = abs <= maxOffset;

              if (!visible) return null;

              const x = off * cardSpacing;
              const isActive = off === 0;
              const rotateZ = off * stepDeg;
              const scale = isActive ? activeScale : activeScale - (inactiveScale * abs);

              let zIndex = 100 - abs;
              if (off > 0) zIndex = 50 - off;

              const dragProps = isActive
                ? {
                    drag: "x" as const,
                    dragConstraints: { left: 0, right: 0 },
                    dragElastic: 0.18,
                    onDragEnd: (
                      _e: any,
                      info: { offset: { x: number }; velocity: { x: number } },
                    ) => {
                      if (reduceMotion) return;
                      const travel = info.offset.x;
                      const v = info.velocity.x;
                      const threshold = Math.min(160, cardWidth * 0.22);

                      if (travel > threshold || v > 650) prev();
                      else if (travel < -threshold || v < -650) next();
                    },
                  }
                : {};

              return (
                <m.div
                  key={item.id}
                  className={cn(
                    "absolute overflow-hidden rounded-2xl shadow-2xl",
                    "will-change-transform select-none",
                    isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                  )}
                  style={{ width: cardWidth, height: cardHeight, zIndex }}
                  initial={reduceMotion ? false : { opacity: 0, x: 0, rotateZ: 0, scale }}
                  animate={{ opacity: 1, x, rotateZ, scale, y: 0 }}
                  transition={{ type: "spring", stiffness: springStiffness, damping: springDamping }}
                  onClick={() => setActive(i)}
                  {...dragProps}
                >
                  <div className="h-full w-full">
                    <div className="relative h-full w-full">
                      {item.imageSrc ? (
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function HeroCarousel() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMd, setIsMd] = React.useState(true);

  React.useEffect(() => {
    setIsMounted(true);
    const checkMd = () => setIsMd(window.innerWidth >= 768);
    checkMd();
    window.addEventListener('resize', checkMd);
    return () => window.removeEventListener('resize', checkMd);
  }, []);

  const SLIDES = [
    {
      id: 1,
      title: "Gambar 1",
      imageSrc: "/images/carousel/gambar1.jpg",
    },
    {
      id: 2,
      title: "Gambar 2",
      imageSrc: "/images/carousel/gambar2.jpg",
    },
    {
      id: 3,
      title: "Gambar 3",
      imageSrc: "/images/carousel/gambar1.jpg", // Duplicating so that the CardStack has enough items to overlap nicely on both sides
    }
  ];

  if (!isMounted) {
    return (
      <section className="relative z-40 flex w-full justify-center px-4">
        <div className="relative -mt-10 md:-mt-32 z-40 w-full max-w-4xl px-2 md:px-4">
          <div className="relative h-64 overflow-hidden rounded-2xl md:h-96 shadow-xl bg-gray-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-40 flex w-full justify-center px-4">
      {/* We kept the exact same margins as the original yayasan HeroCarousel so the layout doesn't break */}
      <div className="relative -mt-10 md:-mt-32 z-40 w-full max-w-7xl pt-4 pb-20">
        <HeroCardStack
          items={SLIDES}
          initialIndex={0}
          autoAdvance
          intervalMs={2000}
          pauseOnHover
          maxVisible={isMd ? 7 : 1}
          cardWidth={isMd ? 735 : 330}
          cardHeight={isMd ? 530 : 220}
          activeScale={1}
          inactiveScale={0.1}
          overlap={0.85}
        />
      </div>
    </section>
  );
}
