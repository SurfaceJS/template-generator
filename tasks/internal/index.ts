import { createPathAsync, isDirectory, removePathAsync } from "@surface/io";
import path                                              from "path";
import { fileURLToPath }                                 from "url";
import { copyFile, readdir, writeFile }                  from "fs/promises";
import { existsSync,  }                                  from "fs";
import chalk                                             from "chalk";
import hash                                              from "./hash.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const source  = path.resolve(dirname, "../../templates");

const darkGreen = chalk.rgb(0, 128, 0);
const green     = chalk.rgb(0, 255, 0);

type Entry = { name: string, path: string };

export default class Tasks
{
    private static async *iterateFiles(filename: string): AsyncIterable<[filepath: string, checksum: string]>
    {
        if (isDirectory(filename))
        {
            for (const item of await readdir(filename))
            {
                if (item != "node_modules")
                {
                    for await (const file of this.iterateFiles(path.join(filename, item)))
                    {
                        yield file;
                    }
                }
            }
        }
        else if (!filename.endsWith("package-lock.json"))
        {
            yield [filename, await hash(filename)];
        }
    }

    public static async generateTemplates(output: string): Promise<void>
    {
        const destination = path.isAbsolute(output) ? output : path.resolve(process.cwd(), output);

        await removePathAsync(destination);

        const index = { } as Record<string, Entry[]>

        for (const template of await readdir(source))
        {
            const entry = index[template] = [] as Entry[];

            for await (const [filepath, checksum] of this.iterateFiles(path.join(source, template)))
            {
                const relative = filepath
                    .replace(path.join(source, template), "")
                    .replaceAll("\\", "/")
                    .replace(/^\//, "");

                entry.push({ name: checksum, path: relative })

                const targetPath = path.join(destination, checksum);

                console.log(`${darkGreen(filepath)} => ${green(targetPath)}`);

                if (!existsSync(targetPath))
                {
                    await createPathAsync(path.dirname(targetPath));

                    await copyFile(filepath, targetPath);
                }
            }
        }

        await writeFile(path.join(destination, "index.json"), JSON.stringify(index, null, 4));
    }
}