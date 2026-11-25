'use client';

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeInUpProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export function FadeInUp({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 22,
  className,
  ...rest
}: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className,
  ...rest
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function StaggerItem({
  children,
  className,
  ...rest
}: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface ScaleOnHoverProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  liftY?: number;
}

export function ScaleOnHover({
  children,
  liftY = -5,
  className,
  ...rest
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ y: liftY, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  glareColor?: string;
}

export function Tilt3DCard({
  children,
  className,
  maxTilt = 8,
  glare = true,
  glareColor = 'rgba(255, 255, 255, 0.42)',
}: Tilt3DCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 220, damping: 22, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 220, damping: 22, mass: 0.6 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const glareX = useTransform(smoothX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(280px circle at ${glareX}% ${glareY}%, ${glareColor}, transparent 75%)`;

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion) {
      setTiltEnabled(false);
      return;
    }
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncCapability = () => setTiltEnabled(media.matches);
    syncCapability();
    media.addEventListener('change', syncCapability);
    return () => media.removeEventListener('change', syncCapability);
  }, [prefersReducedMotion]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(x);
    pointerY.set(y);
  };

  const handleMouseEnter = () => {
    if (!tiltEnabled) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div style={{ perspective: '1000px' }} className={cn('relative', className)}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={
          tiltEnabled
            ? {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
            : undefined
        }
        whileHover={tiltEnabled ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative h-full w-full will-change-transform"
      >
        {children}

        {glare && tiltEnabled && (
          <motion.div
            aria-hidden="true"
            style={{ background: glareBackground }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
          />
        )}
      </motion.div>
    </div>
  );
}

interface Floating3DElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yRange?: number;
  rotateRange?: number;
}

export function Floating3DElement({
  children,
  className,
  delay = 0,
  duration = 4.6,
  yRange = 6,
  rotateRange = 1.5,
}: Floating3DElementProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        y: [-yRange, yRange, -yRange],
        rotate: [-rotateRange, rotateRange, -rotateRange],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCounterProps {
  to: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

function formatCounterValue(value: number, decimals: number): string {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function AnimatedCounter({
  to,
  from = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.35,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.35 });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<string>(() =>
    formatCounterValue(to, decimals)
  );

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      setDisplayValue(formatCounterValue(to, decimals));
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(formatCounterValue(latest, decimals));
      },
    });

    return () => controls.stop();
  }, [isInView, prefersReducedMotion, from, to, decimals, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className }: ShimmerTextProps) {
  return (
    <span
      className={cn(
        'animate-shimmer-text inline-block bg-gradient-to-r from-emerald-500 via-sky-500 via-50% to-indigo-600 bg-[length:220%_auto] bg-clip-text text-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
