import fs from "fs-extra"
import path from "path"
import chalk from "chalk"
import { confirm } from "./confirm.js"
import { getAvailableComponents } from "./components.js"
import { resolveComponentDir, findExistingComponent } from "./utils/resolve-component-dir.js"
import { loadMeta } from "./utils/load-meta.js"
import { loadConfig } from "./config/load-config.js"
import { resolveTargetPath } from "./utils/resolve-target-path.js"

/**
 * Add a single component (without dependencies)
 * Now supports type-based behavior:
 * - ui: copy file → components/ui
 * - layout: copy folder → components/layout
 * - template: copy page + layout + route → app
 */
async function addComponent(component: string): Promise<void> {
  const cwd = process.cwd()
  const config = loadConfig()

  // Load and validate meta
  let meta
  try {
    meta = loadMeta(component)
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`❌ ${error.message}`))
    } else {
      console.log(chalk.red(`❌ Component "${component}" not found`))
    }
    return
  }

  // Resolve template directory
  let templateDir: string
  const componentsTemplateDir = path.join(
    import.meta.dirname,
    "../templates/components",
    component
  )
  const templatesTemplateDir = path.join(
    import.meta.dirname,
    "../templates/templates",
    component
  )

  if (await fs.pathExists(templatesTemplateDir)) {
    templateDir = templatesTemplateDir
  } else if (await fs.pathExists(componentsTemplateDir)) {
    templateDir = componentsTemplateDir
  } else {
    console.log(chalk.red(`❌ Template directory not found for "${component}"`))
    return
  }

  // Resolve target path based on type (with smart detection)
  // targetBase is relative path (e.g., "src/app", "components/ui")
  const targetBase = resolveTargetPath(meta, cwd)

  // Handle different types
  if (meta.type === "template") {
    // Template: copy entire folder (except meta.json) to app/
    // targetBase is relative path (e.g., "src/app")
    await handleTemplate(templateDir, targetBase, meta, config, cwd)
  } else if (meta.type === "layout") {
    // Layout: copy folder to components/layout
    await handleLayout(templateDir, targetBase, meta, config, cwd)
  } else if (meta.type === "ui" && meta.category === "section") {
    // Section: copy folder to components/ (not components/ui)
    await handleSection(templateDir, targetBase, meta, config, cwd)
  } else {
    // UI (primitive/composite): copy file to components/ui
    await handleUI(templateDir, targetBase, meta, config, cwd)
  }
}

/**
 * Handle UI component (single file)
 * 
 * Smart detection: uses existing component directory structure
 */
async function handleUI(
  templateDir: string,
  targetBase: string,
  meta: any,
  config: any,
  cwd: string
): Promise<void> {

  // Find source file
  const sourceNew = path.join(templateDir, "index.jsx")
  const sourceOld = path.join(templateDir, "index.tsx")
  const sourceFallback = path.join(
    import.meta.dirname,
    "../templates/components",
    `${meta.name}.jsx`
  )

  let source: string | null = null
  if (await fs.pathExists(sourceNew)) {
    source = sourceNew
  } else if (await fs.pathExists(sourceOld)) {
    source = sourceOld
  } else if (await fs.pathExists(sourceFallback)) {
    source = sourceFallback
  }

  if (!source) {
    console.log(chalk.red(`❌ Component file not found for "${meta.name}"`))
    return
  }

  // Use resolveComponentDir to find existing structure
  const actualTargetDir = resolveComponentDir()
  const target = path.join(cwd, actualTargetDir, "ui", `${meta.name}.jsx`)

  // Check if exists using findExistingComponent (which checks all possible locations)
  const existingFile = findExistingComponent(meta.name)
  if (existingFile || (await fs.pathExists(target))) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false

    if (!shouldOverwrite) {
      const ok = await confirm(
        `⚠️ ${meta.name}.jsx already exists. Overwrite? (y/N) `
      )

      if (!ok) {
        console.log(chalk.yellow(`⏭ ${meta.name} skipped`))
        return
      }
    }

    // Use existing file path if found, otherwise use target
    const finalTarget = existingFile ? path.join(cwd, existingFile) : target
    await fs.copy(source, finalTarget, { overwrite: true })
    console.log(chalk.green(`✔ updated ${meta.name}`))
    return
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(target))
  await fs.copy(source, target, { overwrite: true })
  console.log(chalk.green(`✔ added ${meta.name} to ${actualTargetDir}/ui`))
}

/**
 * Handle Section component (single file in components/, not components/ui)
 */
async function handleSection(
  templateDir: string,
  targetBase: string,
  meta: any,
  config: any,
  cwd: string
): Promise<void> {
  // Find source file
  const sourceNew = path.join(templateDir, "index.jsx")
  const sourceOld = path.join(templateDir, "index.tsx")

  let source: string | null = null
  if (await fs.pathExists(sourceNew)) {
    source = sourceNew
  } else if (await fs.pathExists(sourceOld)) {
    source = sourceOld
  }

  if (!source) {
    console.log(chalk.red(`❌ Section file not found for "${meta.name}"`))
    return
  }

  // targetBase is components directory (e.g., "src/components")
  const target = path.join(cwd, targetBase, `${meta.name}.jsx`)

  // Check if exists
  if (await fs.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false

    if (!shouldOverwrite) {
      const ok = await confirm(
        `⚠️ ${meta.name}.jsx already exists. Overwrite? (y/N) `
      )

      if (!ok) {
        console.log(chalk.yellow(`⏭ ${meta.name} skipped`))
        return
      }
    }

    await fs.copy(source, target, { overwrite: true })
    console.log(chalk.green(`✔ updated section ${meta.name}`))
    return
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(target))
  await fs.copy(source, target, { overwrite: true })
  console.log(chalk.green(`✔ added section ${meta.name} to ${targetBase}/${meta.name}.jsx`))
}

/**
 * Handle Layout component (folder)
 */
async function handleLayout(
  templateDir: string,
  targetBase: string,
  meta: any,
  config: any,
  cwd: string
): Promise<void> {
  // targetBase is relative path (e.g., "src/components/layout")
  const target = path.join(cwd, targetBase, meta.name)

  // Check if exists
  if (await fs.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false

    if (!shouldOverwrite) {
      const ok = await confirm(
        `⚠️ Layout "${meta.name}" already exists. Overwrite? (y/N) `
      )

      if (!ok) {
        console.log(chalk.yellow(`⏭ ${meta.name} skipped`))
        return
      }
    }
  }

  await fs.ensureDir(target)
  
  // Copy all files except meta.json
  const files = await fs.readdir(templateDir)
  for (const file of files) {
    if (file === "meta.json") continue

    const sourceFile = path.join(templateDir, file)
    const targetFile = path.join(target, file)

    if ((await fs.stat(sourceFile)).isDirectory()) {
      await fs.copy(sourceFile, targetFile, { overwrite: true })
    } else {
      await fs.copy(sourceFile, targetFile, { overwrite: true })
    }
  }

  console.log(chalk.green(`✔ added layout ${meta.name}`))
}

/**
 * Handle Template (page + layout + route)
 * 
 * Smart detection: finds existing app structure and places dashboard folder there
 */
async function handleTemplate(
  templateDir: string,
  targetBase: string,
  meta: any,
  config: any,
  cwd: string
): Promise<void> {
  // targetBase is relative path (e.g., "src/app" or "app")
  const target = path.join(cwd, targetBase, meta.name)

  // Check if exists
  if (await fs.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false

    if (!shouldOverwrite) {
      // Heavy confirm for templates
      console.log(chalk.yellow(`\n⚠️  Template "${meta.name}" will overwrite existing files:`))
      console.log(chalk.gray(`   ${target}`))
      const ok = await confirm(`\n⚠️  Are you sure you want to overwrite? (y/N) `)

      if (!ok) {
        console.log(chalk.yellow(`⏭ ${meta.name} skipped`))
        return
      }
    }
  }

  await fs.ensureDir(target)

  // Copy all files except meta.json
  const files = await fs.readdir(templateDir)
  for (const file of files) {
    if (file === "meta.json") continue

    const sourceFile = path.join(templateDir, file)
    const targetFile = path.join(target, file)

    if ((await fs.stat(sourceFile)).isDirectory()) {
      await fs.copy(sourceFile, targetFile, { overwrite: true })
    } else {
      await fs.copy(sourceFile, targetFile, { overwrite: true })
    }
  }

  console.log(chalk.green(`✔ added template ${meta.name}`))
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

  let meta
  try {
    meta = loadMeta(component)
  } catch (error) {
    // Skip if meta not found (might be a dependency that doesn't exist)
    return
  }

  // Install dependencies first (using optional chaining for safety)
  const dependencies = meta.dependencies ?? []
  if (dependencies.length > 0) {
    for (const dep of dependencies) {
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
    let meta
    try {
      meta = loadMeta(component)
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`❌ ${error.message}`))
      }
      return
    }

    const dependencies = meta.dependencies ?? []
    if (dependencies.length > 0) {
      console.log(chalk.yellow(`⚠️ Dependencies skipped (autoDependencies=false): ${dependencies.join(", ")}`))
    }
    await addComponent(component)
  }
}
