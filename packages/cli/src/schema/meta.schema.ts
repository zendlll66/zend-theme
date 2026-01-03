/**
 * Component Meta Schema v1.0
 * 
 * This is the central schema that all components/pages/templates must follow.
 * 
 * Key concepts:
 * - type = CLI behavior (how to install)
 * - category = UX / mental model (how to group)
 * - type and category are not strictly coupled (flexible)
 */

export type ComponentType = "ui" | "layout" | "template"

export type ComponentCategory = "primitive" | "composite" | "section" | "page"

export interface ComponentMeta {
  // Required fields
  name: string
  type: ComponentType
  category: ComponentCategory

  // Optional descriptive fields
  description?: string

  // Dependency and composition fields
  dependencies?: string[]
  slots?: string[]
  variants?: string[]

  // Behavior fields
  customizable?: boolean
  overwrite?: boolean

  // Allow unknown fields for forward compatibility
  [key: string]: unknown
}

