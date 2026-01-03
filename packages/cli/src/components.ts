import fs from "fs-extra"
import path from "path"

export async function getAvailableComponents(): Promise<string[]> {
  const componentsDir = path.join(
    import.meta.dirname,
    "../templates/components"
  )

  if (!(await fs.pathExists(componentsDir))) {
    return []
  }

  const entries = await fs.readdir(componentsDir, { withFileTypes: true })
  const components: string[] = []

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

  return components
}

