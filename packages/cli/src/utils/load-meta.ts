import fs from "fs"
import path from "path"

export interface ComponentMeta {
  name: string
  dependencies: string[]
}

export function loadMeta(component: string): ComponentMeta {
  // Use the same path resolution as addComponent
  const metaPath = path.join(
    import.meta.dirname,
    "../templates/components",
    component,
    "meta.json"
  )

  if (!fs.existsSync(metaPath)) {
    return { name: component, dependencies: [] }
  }

  return JSON.parse(fs.readFileSync(metaPath, "utf-8"))
}

