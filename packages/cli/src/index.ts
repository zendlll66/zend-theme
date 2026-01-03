import { Command } from "commander"
import { init } from "./init.js"
import { add } from "./add.js"

const program = new Command()

program
  .name("zend-theme")
  .description("Zend Theme CLI")
  .version("0.0.1")

program
  .command("init")
  .description("Initialize zend theme")
  .action(init)

  program
  .command("add [component]")
  .description("Add a UI component")
  .action(add)

    
program.parse()
