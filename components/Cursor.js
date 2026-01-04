'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import styles from './Cursor.module.css'

export default function Cursor() {
    const [isHovered, setIsHovered] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smoother spring config to reduce jitter
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
    const cursorX = useSpring(mouseX, springConfig)
    const cursorY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const moveCursor = (e) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
            if (!isVisible) setIsVisible(true)
        }

        // Event delegation for hover effects
        const handleMouseOver = (e) => {
            const target = e.target

            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('[role="button"]') ||
                target.closest('input') ||
                target.closest('textarea') ||
                target.closest('select') ||
                target.classList.contains('hover-target')

            setIsHovered(!!isClickable)
        }

        const handleMouseOut = () => {
            setIsHovered(false)
        }

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mouseover', handleMouseOver)
        window.addEventListener('mouseout', handleMouseOut)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mouseover', handleMouseOver)
            window.removeEventListener('mouseout', handleMouseOut)
        }
    }, [mouseX, mouseY, isVisible])

    if (!isVisible) return null

    return (
        <div className={styles.cursorWrapper}>
            <motion.div
                className={styles.cursorDot}
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    x: '-50%',
                    y: '-50%',
                }}
            />
            <motion.div
                className={styles.cursorRing}
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.5 : 1,
                    backgroundColor: isHovered ? 'var(--primary)' : 'transparent',
                    borderWidth: isHovered ? '0px' : '1px',
                }}
                transition={{
                    scale: { duration: 0.15, ease: "easeOut" },
                    opacity: { duration: 0.15, ease: "easeOut" },
                    backgroundColor: { duration: 0.15 },
                }}
            />
        </div>
    )
}
