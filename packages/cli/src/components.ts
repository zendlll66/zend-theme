import fs from "fs-extra"
import path from "path"

export async function getAvailableComponents(): Promise<string[]> {
  const components: string[] = []

  // Get UI components from templates/components
  const componentsDir = path.join(
    import.meta.dirname,
    "../templates/components"
  )

  if (await fs.pathExists(componentsDir)) {
    const entries = await fs.readdir(componentsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // New structure: component/index.jsx
        components.push(entry.name)
      } else if (entry.isFile() && entry.name.endsWith(".jsx")) {
        // Old structure: component.jsx
        const componentName = entry.name.replace(/\.jsx$/, "")
        if (componentName !== "_meta") {
          // Skip _meta.json if it exists
          components.push(componentName)
        }
      }
    }
  }

  // Get templates from templates/templates
  const templatesDir = path.join(
    import.meta.dirname,
    "../templates/templates"
  )

  if (await fs.pathExists(templatesDir)) {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        components.push(entry.name)
      }
    }
  }

  return components
}

