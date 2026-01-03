import fs from "fs"
import path from "path"

export interface ZendThemeConfig {
  componentsDir: string
  style: string
  autoDependencies: boolean
  overwrite: boolean
}

const DEFAULT_CONFIG: ZendThemeConfig = {
  componentsDir: "src/components",
  style: "zend",
  autoDependencies: true,
  overwrite: false,
}

export function loadConfig(): ZendThemeConfig {
  const configPath = path.resolve(process.cwd(), "zend-theme.config.json")

  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG
  }

  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
    }
  } catch (error) {
    console.warn("⚠️ Failed to parse zend-theme.config.json, using defaults")
    return DEFAULT_CONFIG
  }
}

