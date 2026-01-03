#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/init.ts
import fs2 from "fs-extra";
import chalk from "chalk";
import path2 from "path";

// src/confirm.ts
import readline from "readline";
function confirm(question2) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question2, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

// src/config/load-config.ts
import fs from "fs";
import path from "path";
var DEFAULT_CONFIG = {
  componentsDir: "src/components",
  style: "zend",
  autoDependencies: true,
  overwrite: false
};
function loadConfig() {
  const configPath = path.resolve(process.cwd(), "zend-theme.config.json");
  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }
  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return {
      ...DEFAULT_CONFIG,
      ...userConfig
    };
  } catch (error) {
    console.warn("\u26A0\uFE0F Failed to parse zend-theme.config.json, using defaults");
    return DEFAULT_CONFIG;
  }
}

// src/init.ts
import readline2 from "readline";
function question(query) {
  const rl = readline2.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
async function generateConfig() {
  const configPath = path2.resolve(process.cwd(), "zend-theme.config.json");
  if (await fs2.pathExists(configPath)) {
    const overwrite = await confirm("zend-theme.config.json already exists. Overwrite? (y/N) ");
    if (!overwrite) {
      return;
    }
  }
  console.log(chalk.cyan("\n\u{1F4DD} Let's set up your zend-theme config:\n"));
  const componentsDirAnswer = await question("Where should components live? (src/components) ");
  const componentsDir = componentsDirAnswer.trim() || "src/components";
  const autoDepsAnswer = await question("Enable auto dependencies? (Y/n) ");
  const autoDependencies = autoDepsAnswer.trim().toLowerCase() !== "n";
  const config = {
    componentsDir,
    style: "zend",
    autoDependencies,
    overwrite: false
  };
  await fs2.writeJson(configPath, config, { spaces: 2 });
  console.log(chalk.green(`
\u2714 Created zend-theme.config.json
`));
}
async function init() {
  const cwd = process.cwd();
  const configPath = path2.resolve(cwd, "zend-theme.config.json");
  if (!await fs2.pathExists(configPath)) {
    await generateConfig();
  }
  const config = loadConfig();
  await fs2.ensureDir(path2.join(cwd, "styles"));
  await fs2.copy(
    path2.join(import.meta.dirname, "../templates/styles"),
    path2.join(cwd, "styles")
  );
  const componentsDir = path2.join(cwd, config.componentsDir, "ui");
  await fs2.ensureDir(componentsDir);
  const templatesDir = path2.join(import.meta.dirname, "../templates/components");
  const sourceNew = path2.join(templatesDir, "button", "index.jsx");
  const sourceOld = path2.join(templatesDir, "button.jsx");
  let source;
  if (await fs2.pathExists(sourceNew)) {
    source = sourceNew;
  } else if (await fs2.pathExists(sourceOld)) {
    source = sourceOld;
  } else {
    console.log(chalk.yellow("\u26A0\uFE0F Button component not found in templates"));
    console.log("\u2728 Zend Theme initialized", chalk.green("\u2713"));
    return;
  }
  const target = path2.join(componentsDir, "button.jsx");
  await fs2.copy(source, target, { overwrite: true });
  console.log("\u2728 Zend Theme initialized", chalk.green("\u2713"));
}

// src/add.ts
import fs6 from "fs-extra";
import path6 from "path";
import chalk2 from "chalk";

// src/components.ts
import fs3 from "fs-extra";
import path3 from "path";
async function getAvailableComponents() {
  const componentsDir = path3.join(
    import.meta.dirname,
    "../templates/components"
  );
  if (!await fs3.pathExists(componentsDir)) {
    return [];
  }
  const entries = await fs3.readdir(componentsDir, { withFileTypes: true });
  const components = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      components.push(entry.name);
    } else if (entry.isFile() && entry.name.endsWith(".jsx")) {
      const componentName = entry.name.replace(/\.jsx$/, "");
      if (componentName !== "_meta") {
        components.push(componentName);
      }
    }
  }
  return components;
}

// src/utils/resolve-component-dir.ts
import fs4 from "fs";
import path4 from "path";
var CANDIDATES = [
  "src/components",
  "components",
  "app/components"
];
function resolveComponentDir() {
  const config = loadConfig();
  if (config.componentsDir) {
    return config.componentsDir;
  }
  for (const dir of CANDIDATES) {
    if (fs4.existsSync(dir)) {
      return dir;
    }
  }
  return "src/components";
}
function findExistingComponent(name) {
  const config = loadConfig();
  const dirs = config.componentsDir ? [config.componentsDir] : ["src/components", "components", "app/components"];
  for (const dir of dirs) {
    const file = path4.join(dir, "ui", `${name}.jsx`);
    if (fs4.existsSync(file)) {
      return file;
    }
  }
  return null;
}

// src/utils/load-meta.ts
import fs5 from "fs";
import path5 from "path";
function loadMeta(component) {
  const metaPath = path5.join(
    import.meta.dirname,
    "../templates/components",
    component,
    "meta.json"
  );
  if (!fs5.existsSync(metaPath)) {
    return { name: component, dependencies: [] };
  }
  return JSON.parse(fs5.readFileSync(metaPath, "utf-8"));
}

// src/add.ts
async function addComponent(component) {
  const cwd = process.cwd();
  const config = loadConfig();
  const sourceNew = path6.join(
    import.meta.dirname,
    "../templates/components",
    component,
    "index.jsx"
  );
  const sourceOld = path6.join(
    import.meta.dirname,
    "../templates/components",
    `${component}.jsx`
  );
  let source;
  if (await fs6.pathExists(sourceNew)) {
    source = sourceNew;
  } else if (await fs6.pathExists(sourceOld)) {
    source = sourceOld;
  } else {
    console.log(chalk2.red(`\u274C Component "${component}" not found`));
    return;
  }
  const targetDir = resolveComponentDir();
  const target = path6.join(cwd, targetDir, "ui", `${component}.jsx`);
  const existingFile = findExistingComponent(component);
  if (existingFile) {
    if (!config.overwrite) {
      const ok = await confirm(
        `\u26A0\uFE0F ${component}.jsx already exists. Overwrite? (y/N) `
      );
      if (!ok) {
        console.log(chalk2.yellow(`\u23ED ${component} skipped`));
        return;
      }
    }
    const targetPath = path6.join(cwd, existingFile);
    await fs6.copy(source, targetPath, { overwrite: true });
    console.log(chalk2.green(`\u2714 updated ${component}`));
    return;
  }
  await fs6.ensureDir(path6.dirname(target));
  await fs6.copy(source, target, { overwrite: true });
  console.log(chalk2.green(`\u2714 added ${component}`));
}
async function addWithDeps(component, installed = /* @__PURE__ */ new Set()) {
  if (installed.has(component)) {
    return;
  }
  const meta = loadMeta(component);
  if (meta.dependencies && meta.dependencies.length > 0) {
    for (const dep of meta.dependencies) {
      await addWithDeps(dep, installed);
    }
  }
  await addComponent(component);
  installed.add(component);
}
async function add(component) {
  const config = loadConfig();
  if (!component) {
    const components = await getAvailableComponents();
    console.log(chalk2.cyan("Available components:"));
    components.forEach((c) => console.log(`- ${c}`));
    return;
  }
  if (config.autoDependencies) {
    await addWithDeps(component);
  } else {
    const meta = loadMeta(component);
    if (meta.dependencies && meta.dependencies.length > 0) {
      console.log(chalk2.yellow(`\u26A0\uFE0F Dependencies skipped (autoDependencies=false): ${meta.dependencies.join(", ")}`));
    }
    await addComponent(component);
  }
}

// src/index.ts
var program = new Command();
program.name("zend-theme").description("Zend Theme CLI").version("0.0.1");
program.command("init").description("Initialize zend theme").action(init);
program.command("add [component]").description("Add a UI component").action(add);
program.parse();
