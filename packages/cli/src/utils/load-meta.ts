import fs from "fs"
import path from "path"
import { ComponentMeta } from "../schema/meta.schema.js"
import { validateMeta } from "../schema/validate-meta.js"

/**
 * Load and validate component meta.json
 * 
 * This function:
 * - Loads meta.json from template directory
 * - Validates against ComponentMeta schema
 * - Throws error if invalid (fail fast)
 * 
 * ⚠️ Important: 
 * - Adding new optional fields to meta.json is safe (won't break CLI)
 * - But changing required field types requires MAJOR version bump
 * - Invalid meta = CLI fails immediately with clear error
 */
export function loadMeta(component: string): ComponentMeta {
  // Check in templates/components first (for ui/layout)
  let metaPath = path.join(
    import.meta.dirname,
    "../templates/components",
    component,
    "meta.json"
  )

  // Check in templates/templates (for template type)
  if (!fs.existsSync(metaPath)) {
    metaPath = path.join(
      import.meta.dirname,
      "../templates/templates",
      component,
      "meta.json"
    )
  }

  if (!fs.existsSync(metaPath)) {
    throw new Error(
      `Component "${component}" not found. Missing meta.json at: ${metaPath}`
    )
  }

  try {
    const rawMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"))
    
    // Validate meta against schema
    validateMeta(rawMeta)
    
    // Return validated meta
    return rawMeta as ComponentMeta
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid meta.json for "${component}": ${error.message}`)
    }
    throw error
  }
}
