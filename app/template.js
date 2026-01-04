
"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
    return (
        <>
            {/* Layer 1: Accent Color (Pink) */}
            <motion.div
                initial={{ y: "0%" }}
                animate={{ y: "100%" }}
                exit={{ y: "0%" }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#ec4899", // Primary Pink
                    zIndex: 9999,
                    pointerEvents: "none",
                }}
            />

            {/* Layer 2: Black/Dark Blue (Main Background) */}
            <motion.div
                initial={{ y: "0%" }}
                animate={{ y: "100%" }}
                exit={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#0f172a", // Dark Background
                    zIndex: 9998, // Behind pink, but actually we want pink behind?
                    // Wait, if Pink is Z:9999 and Black is Z:9998.
                    // Pink slides down. Black slides down.
                    // If Pink is ON TOP, you see Pink, then it slides away revealing Black, which slides away revealing content.
                    // That creates a Pink flash.
                    // If we want [Content] -> [Black Cover] -> [Pink Cover] -> [Reveal].
                    // Let's do: Pink slides down, REVEALING Black. Black slides down, REVEALING Content.
                    // So Pink must be on top.
                }}
            />

            {children}
        </>
    );
}
