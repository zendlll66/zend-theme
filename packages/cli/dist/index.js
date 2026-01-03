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
import fs7 from "fs-extra";
import path7 from "path";
import chalk2 from "chalk";

// src/components.ts
import fs3 from "fs-extra";
import path3 from "path";
async function getAvailableComponents() {
  const components = [];
  const componentsDir = path3.join(
    import.meta.dirname,
    "../templates/components"
  );
  if (await fs3.pathExists(componentsDir)) {
    const entries = await fs3.readdir(componentsDir, { withFileTypes: true });
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
  }
  const templatesDir = path3.join(
    import.meta.dirname,
    "../templates/templates"
  );
  if (await fs3.pathExists(templatesDir)) {
    const entries = await fs3.readdir(templatesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        components.push(entry.name);
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

// src/schema/validate-meta.ts
var VALID_TYPES = ["ui", "layout", "template"];
var VALID_CATEGORIES = [
  "primitive",
  "composite",
  "section",
  "page"
];
function validateMeta(meta) {
  if (!meta || typeof meta !== "object") {
    throw new Error("meta must be an object");
  }
  const m = meta;
  if (!m.name || typeof m.name !== "string") {
    throw new Error("meta.name is required and must be a string");
  }
  if (!m.type || typeof m.type !== "string") {
    throw new Error("meta.type is required and must be a string");
  }
  if (!VALID_TYPES.includes(m.type)) {
    throw new Error(
      `Invalid type "${m.type}". Valid types: ${VALID_TYPES.join(", ")}`
    );
  }
  if (!m.category || typeof m.category !== "string") {
    throw new Error("meta.category is required and must be a string");
  }
  if (!VALID_CATEGORIES.includes(m.category)) {
    throw new Error(
      `Invalid category "${m.category}". Valid categories: ${VALID_CATEGORIES.join(", ")}`
    );
  }
  if (m.dependencies !== void 0 && !Array.isArray(m.dependencies)) {
    throw new Error("meta.dependencies must be an array");
  }
  if (m.slots !== void 0 && !Array.isArray(m.slots)) {
    throw new Error("meta.slots must be an array");
  }
  if (m.variants !== void 0 && !Array.isArray(m.variants)) {
    throw new Error("meta.variants must be an array");
  }
  if (m.customizable !== void 0 && typeof m.customizable !== "boolean") {
    throw new Error("meta.customizable must be a boolean");
  }
  if (m.overwrite !== void 0 && typeof m.overwrite !== "boolean") {
    throw new Error("meta.overwrite must be a boolean");
  }
}

// src/utils/load-meta.ts
function loadMeta(component) {
  let metaPath = path5.join(
    import.meta.dirname,
    "../templates/components",
    component,
    "meta.json"
  );
  if (!fs5.existsSync(metaPath)) {
    metaPath = path5.join(
      import.meta.dirname,
      "../templates/templates",
      component,
      "meta.json"
    );
  }
  if (!fs5.existsSync(metaPath)) {
    throw new Error(
      `Component "${component}" not found. Missing meta.json at: ${metaPath}`
    );
  }
  try {
    const rawMeta = JSON.parse(fs5.readFileSync(metaPath, "utf-8"));
    validateMeta(rawMeta);
    return rawMeta;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid meta.json for "${component}": ${error.message}`);
    }
    throw error;
  }
}

// src/utils/resolve-target-path.ts
import fs6 from "fs";
import path6 from "path";
function resolveTargetPath(meta, cwd = process.cwd()) {
  const config = loadConfig();
  const baseDir = config.componentsDir || "src/components";
  switch (meta.type) {
    case "ui":
      if (meta.category === "section") {
        return baseDir;
      }
      return `${baseDir}/ui`;
    case "layout":
      return `${baseDir}/layout`;
    case "template":
      const srcAppPath = path6.join(cwd, "src/app");
      const appPath = path6.join(cwd, "app");
      if (fs6.existsSync(srcAppPath)) {
        return "src/app";
      } else if (fs6.existsSync(appPath)) {
        return "app";
      } else {
        return "src/app";
      }
    default:
      throw new Error(`Unknown component type: ${meta.type}`);
  }
}

// src/add.ts
async function addComponent(component) {
  const cwd = process.cwd();
  const config = loadConfig();
  let meta;
  try {
    meta = loadMeta(component);
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk2.red(`\u274C ${error.message}`));
    } else {
      console.log(chalk2.red(`\u274C Component "${component}" not found`));
    }
    return;
  }
  let templateDir;
  const componentsTemplateDir = path7.join(
    import.meta.dirname,
    "../templates/components",
    component
  );
  const templatesTemplateDir = path7.join(
    import.meta.dirname,
    "../templates/templates",
    component
  );
  if (await fs7.pathExists(templatesTemplateDir)) {
    templateDir = templatesTemplateDir;
  } else if (await fs7.pathExists(componentsTemplateDir)) {
    templateDir = componentsTemplateDir;
  } else {
    console.log(chalk2.red(`\u274C Template directory not found for "${component}"`));
    return;
  }
  const targetBase = resolveTargetPath(meta, cwd);
  if (meta.type === "template") {
    await handleTemplate(templateDir, targetBase, meta, config, cwd);
  } else if (meta.type === "layout") {
    await handleLayout(templateDir, targetBase, meta, config, cwd);
  } else if (meta.type === "ui" && meta.category === "section") {
    await handleSection(templateDir, targetBase, meta, config, cwd);
  } else {
    await handleUI(templateDir, targetBase, meta, config, cwd);
  }
}
async function handleUI(templateDir, targetBase, meta, config, cwd) {
  const sourceNew = path7.join(templateDir, "index.jsx");
  const sourceOld = path7.join(templateDir, "index.tsx");
  const sourceFallback = path7.join(
    import.meta.dirname,
    "../templates/components",
    `${meta.name}.jsx`
  );
  let source = null;
  if (await fs7.pathExists(sourceNew)) {
    source = sourceNew;
  } else if (await fs7.pathExists(sourceOld)) {
    source = sourceOld;
  } else if (await fs7.pathExists(sourceFallback)) {
    source = sourceFallback;
  }
  if (!source) {
    console.log(chalk2.red(`\u274C Component file not found for "${meta.name}"`));
    return;
  }
  const actualTargetDir = resolveComponentDir();
  const target = path7.join(cwd, actualTargetDir, "ui", `${meta.name}.jsx`);
  const existingFile = findExistingComponent(meta.name);
  if (existingFile || await fs7.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false;
    if (!shouldOverwrite) {
      const ok = await confirm(
        `\u26A0\uFE0F ${meta.name}.jsx already exists. Overwrite? (y/N) `
      );
      if (!ok) {
        console.log(chalk2.yellow(`\u23ED ${meta.name} skipped`));
        return;
      }
    }
    const finalTarget = existingFile ? path7.join(cwd, existingFile) : target;
    await fs7.copy(source, finalTarget, { overwrite: true });
    console.log(chalk2.green(`\u2714 updated ${meta.name}`));
    return;
  }
  await fs7.ensureDir(path7.dirname(target));
  await fs7.copy(source, target, { overwrite: true });
  console.log(chalk2.green(`\u2714 added ${meta.name} to ${actualTargetDir}/ui`));
}
async function handleSection(templateDir, targetBase, meta, config, cwd) {
  const sourceNew = path7.join(templateDir, "index.jsx");
  const sourceOld = path7.join(templateDir, "index.tsx");
  let source = null;
  if (await fs7.pathExists(sourceNew)) {
    source = sourceNew;
  } else if (await fs7.pathExists(sourceOld)) {
    source = sourceOld;
  }
  if (!source) {
    console.log(chalk2.red(`\u274C Section file not found for "${meta.name}"`));
    return;
  }
  const target = path7.join(cwd, targetBase, `${meta.name}.jsx`);
  if (await fs7.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false;
    if (!shouldOverwrite) {
      const ok = await confirm(
        `\u26A0\uFE0F ${meta.name}.jsx already exists. Overwrite? (y/N) `
      );
      if (!ok) {
        console.log(chalk2.yellow(`\u23ED ${meta.name} skipped`));
        return;
      }
    }
    await fs7.copy(source, target, { overwrite: true });
    console.log(chalk2.green(`\u2714 updated section ${meta.name}`));
    return;
  }
  await fs7.ensureDir(path7.dirname(target));
  await fs7.copy(source, target, { overwrite: true });
  console.log(chalk2.green(`\u2714 added section ${meta.name} to ${targetBase}/${meta.name}.jsx`));
}
async function handleLayout(templateDir, targetBase, meta, config, cwd) {
  const target = path7.join(cwd, targetBase, meta.name);
  if (await fs7.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false;
    if (!shouldOverwrite) {
      const ok = await confirm(
        `\u26A0\uFE0F Layout "${meta.name}" already exists. Overwrite? (y/N) `
      );
      if (!ok) {
        console.log(chalk2.yellow(`\u23ED ${meta.name} skipped`));
        return;
      }
    }
  }
  await fs7.ensureDir(target);
  const files = await fs7.readdir(templateDir);
  for (const file of files) {
    if (file === "meta.json") continue;
    const sourceFile = path7.join(templateDir, file);
    const targetFile = path7.join(target, file);
    if ((await fs7.stat(sourceFile)).isDirectory()) {
      await fs7.copy(sourceFile, targetFile, { overwrite: true });
    } else {
      await fs7.copy(sourceFile, targetFile, { overwrite: true });
    }
  }
  console.log(chalk2.green(`\u2714 added layout ${meta.name}`));
}
async function handleTemplate(templateDir, targetBase, meta, config, cwd) {
  const target = path7.join(cwd, targetBase, meta.name);
  if (await fs7.pathExists(target)) {
    const shouldOverwrite = meta.overwrite ?? config.overwrite ?? false;
    if (!shouldOverwrite) {
      console.log(chalk2.yellow(`
\u26A0\uFE0F  Template "${meta.name}" will overwrite existing files:`));
      console.log(chalk2.gray(`   ${target}`));
      const ok = await confirm(`
\u26A0\uFE0F  Are you sure you want to overwrite? (y/N) `);
      if (!ok) {
        console.log(chalk2.yellow(`\u23ED ${meta.name} skipped`));
        return;
      }
    }
  }
  await fs7.ensureDir(target);
  const files = await fs7.readdir(templateDir);
  for (const file of files) {
    if (file === "meta.json") continue;
    const sourceFile = path7.join(templateDir, file);
    const targetFile = path7.join(target, file);
    if ((await fs7.stat(sourceFile)).isDirectory()) {
      await fs7.copy(sourceFile, targetFile, { overwrite: true });
    } else {
      await fs7.copy(sourceFile, targetFile, { overwrite: true });
    }
  }
  console.log(chalk2.green(`\u2714 added template ${meta.name}`));
}
async function addWithDeps(component, installed = /* @__PURE__ */ new Set()) {
  if (installed.has(component)) {
    return;
  }
  let meta;
  try {
    meta = loadMeta(component);
  } catch (error) {
    return;
  }
  const dependencies = meta.dependencies ?? [];
  if (dependencies.length > 0) {
    for (const dep of dependencies) {
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
    let meta;
    try {
      meta = loadMeta(component);
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk2.red(`\u274C ${error.message}`));
      }
      return;
    }
    const dependencies = meta.dependencies ?? [];
    if (dependencies.length > 0) {
      console.log(chalk2.yellow(`\u26A0\uFE0F Dependencies skipped (autoDependencies=false): ${dependencies.join(", ")}`));
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
