import fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function main(browser) {
    const buildDir = `build/${browser}`;

    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    const manifestJson = JSON.parse(await readFile("src/manifest.json"));
    const browserManifestJson = JSON.parse(await readFile(`src/manifest.${browser}.json`));

    let mergedManifest = { ...manifestJson, ...browserManifestJson };
    await writeFile(`${buildDir}/manifest.json`, JSON.stringify(mergedManifest, null, 2));
}

main(process.argv[2]).catch(err => console.error(err.stack));
