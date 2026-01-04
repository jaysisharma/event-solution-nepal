```
"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
  return (
    <>
      <motion.div
        initial={{ clipPath: "circle(150% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        exit={{ clipPath: "circle(150% at 50% 50%)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#0f172a",
            zIndex: 9999,
            pointerEvents: "none"
        }}
      />
      {children}
    </>
  );
}
```
