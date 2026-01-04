"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
    return (
        <>
            {/* Left Curtain */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                exit={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "100%",
                    backgroundColor: "#0f172a",
                    zIndex: 9999,
                    transformOrigin: "left",
                    pointerEvents: "none"
                }}
            />

            {/* Right Curtain */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                exit={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    width: "50%",
                    height: "100%",
                    backgroundColor: "#0f172a",
                    zIndex: 9999,
                    transformOrigin: "right",
                    pointerEvents: "none"
                }}
            />

            {children}
        </>
    );
}
