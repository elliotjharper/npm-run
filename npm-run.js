#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");
const clipboardy = require("clipboardy");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const packageJsonPath = "./package.json";

if (!fs.existsSync(packageJsonPath)) {
    console.log("No package.json file found. Exiting.");
    process.exit(1);
}

const package = JSON.parse(fs.readFileSync(packageJsonPath));
const packageScripts = Object.keys(package.scripts).sort();
let currentIndex = 0;
const limit = 4;

function logScripts(scripts) {
    console.clear();

    let logged = 0;

    console.log("  START");
    if (currentIndex > 0) {
        console.log("  ...");
    }

    let limitReached = false;

    scripts.forEach((script, scriptIndex) => {
        if (logged > limit) {
            limitReached = true;
        }

        if (scriptIndex >= currentIndex && !limitReached) {
            console.log(
                `${scriptIndex === currentIndex ? "> " : "  "}${script}`
            );
            logged++;
        }
    });

    if (limitReached) {
        console.log("  ...");
    }
    console.log("  END");
}

logScripts(packageScripts);

process.stdin.on("keypress", (keyString, keyObj) => {
    if (keyObj.name === "down" && currentIndex < packageScripts.length - 1) {
        currentIndex++;
        logScripts(packageScripts);
    } else if (keyObj.name === "up" && currentIndex > 0) {
        currentIndex--;
        logScripts(packageScripts);
    } else if (keyObj.name === "return") {
        console.clear();

        // a random comment

        const scriptRunCmd = `npm run ${packageScripts[currentIndex]}`;
        clipboardy.writeSync(scriptRunCmd);

        console.log("Launch Script copied to Clipboard:");
        console.log(scriptRunCmd);

        process.exit(0);
    } else if (keyObj.name === "c" && keyObj.ctrl) {
        process.exit(0);
    }
});
