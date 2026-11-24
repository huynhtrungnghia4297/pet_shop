'use client';

import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

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
