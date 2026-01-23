'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

export default function SmoothScroll() {
    const pathname = usePathname();

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        })

        window.lenis = lenis

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            window.lenis = null
            lenis.destroy()
        }
    }, [])

    useEffect(() => {
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true })
        }
    }, [pathname])

    return null
}
