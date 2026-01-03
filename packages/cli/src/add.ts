import fs from "fs-extra"
import path from "path"
import chalk from "chalk"
import { confirm } from "./confirm.js"
import { getAvailableComponents } from "./components.js"
import { resolveComponentDir, findExistingComponent } from "./utils/resolve-component-dir.js"
import { loadMeta } from "./utils/load-meta.js"
import { loadConfig } from "./config/load-config.js"

/**
 * Add a single component (without dependencies)
 */
async function addComponent(component: string): Promise<void> {
  const cwd = process.cwd()
  const config = loadConfig()

  // Check if component template exists (new structure: component/index.jsx)
  const sourceNew = path.join(
    import.meta.dirname,
    "../templates/components",
    component,
    "index.jsx"
  )

  // Fallback to old structure: component.jsx
  const sourceOld = path.join(
    import.meta.dirname,
    "../templates/components",
    `${component}.jsx`
  )

  let source: string
  if (await fs.pathExists(sourceNew)) {
    source = sourceNew
  } else if (await fs.pathExists(sourceOld)) {
    source = sourceOld
  } else {
    console.log(chalk.red(`❌ Component "${component}" not found`))
    return
  }

  // ใช้ resolveComponentDir เพื่อหา directory ที่มีอยู่แล้ว
  const targetDir = resolveComponentDir()
  const target = path.join(cwd, targetDir, "ui", `${component}.jsx`)

  // ใช้ findExistingComponent เพื่อตรวจสอบว่ามีไฟล์อยู่แล้วหรือไม่
  const existingFile = findExistingComponent(component)
  if (existingFile) {
    // Check config.overwrite first
    if (!config.overwrite) {
      const ok = await confirm(
        `⚠️ ${component}.jsx already exists. Overwrite? (y/N) `
      )

      if (!ok) {
        console.log(chalk.yellow(`⏭ ${component} skipped`))
        return
      }
    }
    
    // Use existing file path if found
    const targetPath = path.join(cwd, existingFile)
    await fs.copy(source, targetPath, { overwrite: true })
    console.log(chalk.green(`✔ updated ${component}`))
    return
  }

  await fs.ensureDir(path.dirname(target))
  await fs.copy(source, target, { overwrite: true })
  console.log(chalk.green(`✔ added ${component}`))
}

/**
 * Add component with all dependencies (recursive)
 */
async function addWithDeps(
  component: string,
  installed: Set<string> = new Set()
): Promise<void> {
  // Prevent infinite loop
  if (installed.has(component)) {
    return
  }

  const meta = loadMeta(component)

  // Install dependencies first
  if (meta.dependencies && meta.dependencies.length > 0) {
    for (const dep of meta.dependencies) {
      await addWithDeps(dep, installed)
    }
  }

  // Install the component itself
  await addComponent(component)
  // Mark as installed even if it already existed (to prevent re-processing)
  installed.add(component)
}

export async function add(component?: string) {
  const config = loadConfig()

  // STEP 1: list component
  if (!component) {
    const components = await getAvailableComponents()
    console.log(chalk.cyan("Available components:"))
    components.forEach(c => console.log(`- ${c}`))
    return
  }

  // STEP 2: Add component with or without dependencies based on config
  if (config.autoDependencies) {
    await addWithDeps(component)
  } else {
    const meta = loadMeta(component)
    if (meta.dependencies && meta.dependencies.length > 0) {
      console.log(chalk.yellow(`⚠️ Dependencies skipped (autoDependencies=false): ${meta.dependencies.join(", ")}`))
    }
    await addComponent(component)
  }
}
