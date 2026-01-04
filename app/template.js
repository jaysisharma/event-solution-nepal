"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function Template({ children }) {
    // 10 columns for a smoother waterfall effect
    const columns = 10;
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Theme Logic:
    // Dark Mode Selected -> Transition Color = White (#ffffff)
    // Light Mode Selected -> Transition Color = Dark Slate (#334155) - Less vibrant than Blue
    const transitionColor = theme === 'dark' ? '#ffffff' : '#334155';

    const transitionOverlay = (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                zIndex: 9999,
                pointerEvents: "none",
            }}
        >
            {[...Array(columns)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "0%" }}
                    animate={{ y: "-100%" }}
                    exit={{ y: "0%" }}
                    transition={{
                        duration: 0.8,
                        delay: i * 0.05, // Staggered delay for wave/waterfall effect
                        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier
                    }}
                    style={{
                        flex: 1,
                        height: "100%",
                        backgroundColor: transitionColor,
                        borderRight: "1px solid rgba(0,0,0,0.05)",
                    }}
                />
            ))}
        </div>
    );

    return (
        <>
            {mounted && createPortal(transitionOverlay, document.body)}
            {children}
        </>
    );
}
