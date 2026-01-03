import fs from "fs"
import path from "path"
import { loadConfig } from "../config/load-config.js"

const CANDIDATES = [
  "src/components",
  "components",
  "app/components",
]

export function resolveComponentDir(): string {
  const config = loadConfig()
  
  // If config specifies a directory, use it
  if (config.componentsDir) {
    return config.componentsDir
  }

  // Fallback to auto-detect
  for (const dir of CANDIDATES) {
    if (fs.existsSync(dir)) {
      return dir
    }
  }
  return "src/components"
}

export function findExistingComponent(name: string): string | null {
  const config = loadConfig()
  const dirs = config.componentsDir 
    ? [config.componentsDir]
    : ["src/components", "components", "app/components"]

  for (const dir of dirs) {
    const file = path.join(dir, "ui", `${name}.jsx`)
    if (fs.existsSync(file)) {
      return file
    }
  }
  return null
}

