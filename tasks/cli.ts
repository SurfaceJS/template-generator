import commander from "commander";
import Tasks from "./internal/index.js";

const program = new commander.Command();

program.version("1.0.0");

program
    .command("generate <output>")
    .action(output => Tasks.generateTemplates(output))
    .parse(process.argv);