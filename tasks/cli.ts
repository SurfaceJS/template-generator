import commander from "commander";
import Tasks from "./index.js";

const program = new commander.Command();

program.version("1.0.0");

program
    .command("generate <output>")
    .action(output => Tasks.generateTemplates(output));

program.parse(process.argv);