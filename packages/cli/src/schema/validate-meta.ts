import { ComponentMeta, ComponentType, ComponentCategory } from "./meta.schema.js"

const VALID_TYPES: ComponentType[] = ["ui", "layout", "template"]
const VALID_CATEGORIES: ComponentCategory[] = [
  "primitive",
  "composite",
  "section",
  "page",
]

/**
 * Validate component meta.json
 * 
 * Throws error if meta is invalid
 * This ensures CLI fails fast with clear error messages
 * 
 * @param meta - Raw meta object to validate
 * @throws Error if meta is invalid
 */
export function validateMeta(meta: unknown): asserts meta is ComponentMeta {
  if (!meta || typeof meta !== "object") {
    throw new Error("meta must be an object")
  }

  const m = meta as Record<string, unknown>

  // Required: name
  if (!m.name || typeof m.name !== "string") {
    throw new Error("meta.name is required and must be a string")
  }

  // Required: type
  if (!m.type || typeof m.type !== "string") {
    throw new Error("meta.type is required and must be a string")
  }

  if (!VALID_TYPES.includes(m.type as ComponentType)) {
    throw new Error(
      `Invalid type "${m.type}". Valid types: ${VALID_TYPES.join(", ")}`
    )
  }

  // Required: category
  if (!m.category || typeof m.category !== "string") {
    throw new Error("meta.category is required and must be a string")
  }

  if (!VALID_CATEGORIES.includes(m.category as ComponentCategory)) {
    throw new Error(
      `Invalid category "${m.category}". Valid categories: ${VALID_CATEGORIES.join(", ")}`
    )
  }

  // Optional: dependencies (must be array if present)
  if (m.dependencies !== undefined && !Array.isArray(m.dependencies)) {
    throw new Error("meta.dependencies must be an array")
  }

  // Optional: slots (must be array if present)
  if (m.slots !== undefined && !Array.isArray(m.slots)) {
    throw new Error("meta.slots must be an array")
  }

  // Optional: variants (must be array if present)
  if (m.variants !== undefined && !Array.isArray(m.variants)) {
    throw new Error("meta.variants must be an array")
  }

  // Optional: customizable (must be boolean if present)
  if (m.customizable !== undefined && typeof m.customizable !== "boolean") {
    throw new Error("meta.customizable must be a boolean")
  }

  // Optional: overwrite (must be boolean if present)
  if (m.overwrite !== undefined && typeof m.overwrite !== "boolean") {
    throw new Error("meta.overwrite must be a boolean")
  }
}

