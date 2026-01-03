"use client"
import { motion } from "framer-motion"

export function Button({ children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className="bg-[hsl(var(--primary))] text-[hsl(var(--background))] px-4 py-2 rounded-[var(--radius)]"
    >
      {children}
    </motion.button>
  )
}
