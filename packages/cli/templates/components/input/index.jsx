"use client"

export function Input({ ...props }) {
  return (
    <input
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
      {...props}
    />
  )
}

