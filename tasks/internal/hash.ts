import crypto               from "crypto";
import { createReadStream } from "fs";

export default async function hash(filename: string): Promise<string>
{
    const sha1Sum = crypto.createHash("sha1");
    const reader  = createReadStream(filename);

    reader.on("data", x => sha1Sum.update(x));

    await new Promise(resolve => (reader.on("end", resolve)));

    return sha1Sum.digest('hex');
}