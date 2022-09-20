#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");
const ncp = require("copy-paste");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const packageJsonPath = "./package.json";
const pageSize = 5;

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
    if (keyObj.name === "down") {
        if (!(currentIndex < packageScripts.length - 1)) {
            return;
        }

        currentIndex++;
        logScripts(packageScripts);
        return;
    }

    if (keyObj.name === "up") {
        if (currentIndex <= 0) {
            return;
        }

        currentIndex--;
        logScripts(packageScripts);
        return;
    }

    if (keyObj.name === "pagedown") {
        currentIndex += pageSize;
        currentIndex = Math.min(currentIndex, packageScripts.length - 1);
        logScripts(packageScripts);
        return;
    }

    if (keyObj.name === "pageup") {
        currentIndex -= pageSize;
        currentIndex = Math.max(currentIndex, 0);
        logScripts(packageScripts);
        return;
    }

    if (keyObj.name === "return") {
        console.clear();

        // a random comment

        const scriptRunCmd = `npm run ${packageScripts[currentIndex]}`;
        ncp.copy(scriptRunCmd, () => {
            console.log("Launch Script copied to Clipboard:");
            console.log(scriptRunCmd);

            process.exit(0);
        });

        return;
    }

    if ((keyObj.name === "c" && keyObj.ctrl) || keyObj.name === "escape") {
        process.exit(0);
    }
});
