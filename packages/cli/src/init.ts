import fs from "fs-extra"
import chalk from "chalk"
import path from "path"
import { confirm } from "./confirm.js"
import { loadConfig } from "./config/load-config.js"
import readline from "readline"

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

async function generateConfig(): Promise<void> {
  const configPath = path.resolve(process.cwd(), "zend-theme.config.json")

  if (await fs.pathExists(configPath)) {
    const overwrite = await confirm("zend-theme.config.json already exists. Overwrite? (y/N) ")
    if (!overwrite) {
      return
    }
  }

  console.log(chalk.cyan("\n📝 Let's set up your zend-theme config:\n"))

  const componentsDirAnswer = await question("Where should components live? (src/components) ")
  const componentsDir = componentsDirAnswer.trim() || "src/components"

  const autoDepsAnswer = await question("Enable auto dependencies? (Y/n) ")
  const autoDependencies = autoDepsAnswer.trim().toLowerCase() !== "n"

  const config = {
    componentsDir,
    style: "zend",
    autoDependencies,
    overwrite: false,
  }

  await fs.writeJson(configPath, config, { spaces: 2 })
  console.log(chalk.green(`\n✔ Created zend-theme.config.json\n`))
}

export async function init(): Promise<void> {
  const cwd = process.cwd()

  // Generate config if it doesn't exist
  const configPath = path.resolve(cwd, "zend-theme.config.json")
  if (!(await fs.pathExists(configPath))) {
    await generateConfig()
  }

  const config = loadConfig()

  // 1. styles
  await fs.ensureDir(path.join(cwd, "styles"))
  await fs.copy(
    path.join(import.meta.dirname, "../templates/styles"),
    path.join(cwd, "styles")
  )

  // 2. components - copy only button component
  const componentsDir = path.join(cwd, config.componentsDir, "ui")
  await fs.ensureDir(componentsDir)

  const templatesDir = path.join(import.meta.dirname, "../templates/components")

  // Check for new structure: button/index.jsx
  const sourceNew = path.join(templatesDir, "button", "index.jsx")
  // Fallback to old structure: button.jsx
  const sourceOld = path.join(templatesDir, "button.jsx")

  let source: string
  if (await fs.pathExists(sourceNew)) {
    source = sourceNew
  } else if (await fs.pathExists(sourceOld)) {
    source = sourceOld
  } else {
    console.log(chalk.yellow("⚠️ Button component not found in templates"))
    console.log("✨ Zend Theme initialized", chalk.green("✓"))
    return
  }

  // Copy only the button component file
  const target = path.join(componentsDir, "button.jsx")
  await fs.copy(source, target, { overwrite: true })

  console.log("✨ Zend Theme initialized", chalk.green("✓"))
}
