import fs from "fs"
import path from "path"
import { ComponentMeta } from "../schema/meta.schema.js"
import { loadConfig } from "../config/load-config.js"

/**
 * Resolve target path based on component type
 * 
 * This is the official contract for CLI behavior:
 * 
 * - ui      → copy file → components/ui
 * - layout  → copy folder → components/layout
 * - template → copy page + layout + route → app
 * 
 * Smart detection: checks existing structure first
 */
export function resolveTargetPath(meta: ComponentMeta, cwd: string = process.cwd()): string {
  const config = loadConfig()
  const baseDir = config.componentsDir || "src/components"

  switch (meta.type) {
    case "ui":
      // Check category: section goes to components/, not components/ui
      if (meta.category === "section") {
        return baseDir
      }
      // Primitive and composite go to components/ui
      return `${baseDir}/ui`

    case "layout":
      return `${baseDir}/layout`

    case "template":
      // Smart detection: check for src/app first, then app
      const srcAppPath = path.join(cwd, "src/app")
      const appPath = path.join(cwd, "app")
      
      if (fs.existsSync(srcAppPath)) {
        return "src/app"
      } else if (fs.existsSync(appPath)) {
        return "app"
      } else {
        // Default to src/app for Next.js
        return "src/app"
      }

    default:
      throw new Error(`Unknown component type: ${meta.type}`)
  }
}

