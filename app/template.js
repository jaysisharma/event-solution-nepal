```
"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
    // 10 columns for a smoother waterfall effect
    const columns = 10;
    
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
                    zIndex: 9999,
                    pointerEvents: "none",
                }}
            >
                {[...Array(columns)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: "0%" }}
                        animate={{ y: "100%" }}
                        exit={{ y: "0%" }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.05, // Staggered delay for wave/waterfall effect
                            ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier
                        }}
                        style={{
                            flex: 1,
                            height: "100%",
                            backgroundColor: "#ec4899", // Pink Waterfall
                            // Alternate colors for a cooler effect? Or keep it solid.
                            // Let's keep it solid pink for standard branding.
                            borderRight: "1px solid rgba(0,0,0,0.05)",
                        }}
                    />
                ))}
            </div>
            {children}
        </>
    );
}
```
