import { createPathAsync, removePathAsync }   from "@surface/io";
import path                                   from "path";
import { fileURLToPath }                      from "url";
import { copyFile, readdir, stat, writeFile, readFile } from "node:fs/promises";
import { existsSync,  }                         from "fs";

const dirname     = path.dirname(fileURLToPath(import.meta.url));
const source      = path.resolve(dirname, "../templates");
const destination = path.resolve(dirname, "../../workbench/modules/packages/@surface/cli/internal/teplates");

export default class Tasks
{
    private static async *listFiles(filename: string): AsyncIterable<string>
    {
        const fileStat = await stat(filename);

        if (fileStat.isDirectory())
        {
            for (const item of await readdir(filename))
            {
                if (item != "node_modules")
                {
                    for await (const file of this.listFiles(path.join(filename, item)))
                    {
                        yield file;
                    }
                }
            }
        }
        else if (!filename.endsWith("package-lock.json"))
        {
            yield filename;
        }
    }

    public static async generateTemplates(): Promise<void>
    {
        const templateMap = new Map<string, Set<string>>();
        const conflicts   = new Set<string>();
        const allFiles    = new Map<string, Set<string>>();

        const templates = await readdir(source);

        for (const templateFolder of templates)
        {
            const items = new Set<string>();

            templateMap.set(templateFolder, items);

            for await (const file of this.listFiles(path.join(source, templateFolder)))
            {
                const relative = file.replace(path.join(source, templateFolder), "").replace(new RegExp(`^\\${path.sep}`), "");

                let owners = allFiles.get(relative);

                if (owners && !conflicts.has(relative))
                {
                    for (const ownerFolder of owners)
                    {
                        const left  = path.join(source, ownerFolder, relative);
                        const right = path.join(source, templateFolder, relative);

                        if ((await readFile(left)).compare(await readFile(right)) != 0)
                        {
                            conflicts.add(relative);
                        }
                    }
                }
                else if (!owners)
                {
                    allFiles.set(relative, owners = new Set());
                }

                owners.add(templateFolder);

                items.add(relative);
            }
        }

        await removePathAsync(destination);

        const filemap = new Map<string, string[]>();

        for (const [name, files] of templateMap)
        {
            const items: string[] = [];

            filemap.set(name, items);

            for (const file of files)
            {
                const extension = conflicts.has(file) ? `.${name}.template` : ".template";
                const mangled   = file.replace(/\\|\//g, "__") + extension;
                const template  = path.join(destination, mangled);

                items.push(mangled);

                if (!existsSync(template))
                {
                    await createPathAsync(path.dirname(template));

                    const filename  = path.join(source, name, file);

                    console.log(`${filename} => ${template}`);

                    await copyFile(filename, template);
                }

            }
        }

        await writeFile(path.join(destination, "filemap.json"), JSON.stringify(Object.fromEntries(filemap), null, 4));
    }
}

await Tasks.generateTemplates();