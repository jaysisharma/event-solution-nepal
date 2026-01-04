
"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
    // 5 columns x 5 rows = 25 tiles
    const tiles = [...Array(25)].map((_, i) => i);

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexWrap: "wrap",
                    zIndex: 9999,
                    pointerEvents: "none",
                }}
            >
                {tiles.map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: Math.random() * 0.4, // Random 'digital' noise effect
                            ease: "easeInOut",
                        }}
                        style={{
                            width: "20vw",
                            height: "20vh",
                            backgroundColor: "#0f172a",
                        }}
                    />
                ))}
            </div>
            {children}
        </>
    );
}
