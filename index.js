#!/usr/bin/env node

import fileUrl from "file-url";
import isUrl from "is-url";
import parseUrl from "url-parse";
import puppeteer from "puppeteer";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";

function buildLaunchOptions() {
    const args = [];
    args.push(
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-site-isolation-trials",
        "--headless",
        "--no-default-browser-check",
        "--no-first-run",
        "--no-zygote",
        "--single-process"
    );

    return {
        headless: "new",
        args,
    };
}

function buildNavigationOptions({timeout, waitUntil}) {
    return {
        timeout,
        waitUntil,
    };
}

function buildCookies({url, cookie}) {
    return [...cookie].map((cookieString) => {
        const delimiterOffset = cookieString.indexOf(":");
        if (delimiterOffset === -1) {
            throw new Error("cookie must contain : delimiter");
        }

        const name = cookieString.substr(0, delimiterOffset);
        const value = cookieString.substr(delimiterOffset + 1);

        return {name, value, url};
    });
}

// common options for both print and screenshot commands
const commonOptions = {
    sandbox: {
        boolean: true,
        default: true,
    },
    timeout: {
        default: 30 * 1000,
        number: true,
    },
    "wait-until": {
        string: true,
        default: "load",
    },
    cookie: {
        describe: "Set a cookie in the form 'key:value'. May be repeated for multiple cookies.",
        type: "string",
    },
};

async function print(argv) {
    const browser = await puppeteer.launch(buildLaunchOptions(argv));
    const page = await browser.newPage();
    const url = isUrl(argv.url) ? parseUrl(argv.url).toString() : fileUrl(argv.url);

    if (argv.cookie) {
        console.error("Setting cookies");
        await page.setCookie(...buildCookies(argv));
    }

    console.error(`Loading ${url}`);
    await page.goto(url, buildNavigationOptions(argv));

    console.error(`Writing ${argv.output || "STDOUT"}`);
    const buffer = await page.pdf({
        path: argv.output || null,
        format: argv.format,
        landscape: argv.landscape,
        printBackground: argv.background,
        margin: {
            top: argv.marginTop,
            right: argv.marginRight,
            bottom: argv.marginBottom,
            left: argv.marginLeft,
        },
        displayHeaderFooter: argv.displayHeaderFooter,
        headerTemplate: argv.headerTemplate,
        footerTemplate: argv.footerTemplate,
    });

    if (!argv.output) {
        await process.stdout.write(buffer);
    }

    console.error("Done");
    await browser.close();
}

async function screenshot(argv) {
    const browser = await puppeteer.launch(buildLaunchOptions(argv));
    const page = await browser.newPage();
    const url = isUrl(argv.url) ? parseUrl(argv.url).toString() : fileUrl(argv.url);

    if (argv.viewport) {
        const formatMatch = argv.viewport.match(/^(<width>\d+)[xX](<height>\d+)$/);

        if (!formatMatch) {
            console.error("Option --viewport must be in the format ###x### e.g. 800x600");
            process.exit(1);
        }

        const {width, height} = formatMatch.groups;
        console.error(`Setting viewport to ${width}x${height}`);
        await page.setViewport({
            width: parseInt(width, 10),
            height: parseInt(height, 10),
        });
    }

    if (argv.cookie) {
        console.error("Setting cookies");
        await page.setCookie(...buildCookies(argv));
    }

    console.error(`Loading ${url}`);
    await page.goto(url, buildNavigationOptions(argv));

    console.error(`Writing ${argv.output || "STDOUT"}`);
    const buffer = await page.screenshot({
        path: argv.output || null,
        fullPage: argv.fullPage,
        omitBackground: argv.omitBackground,
    });

    if (!argv.output) {
        await process.stdout.write(buffer);
    }

    console.error("Done");
    await browser.close();
}

const argv = yargs(hideBin(process.argv))
    .command({
        command: "print <url> [output]",
        desc: "Print an HTML file or URL to PDF",
        builder: {
            ...commonOptions,
            background: {
                boolean: true,
                default: true,
            },
            "margin-top": {
                default: "6.25mm",
            },
            "margin-right": {
                default: "6.25mm",
            },
            "margin-bottom": {
                default: "14.11mm",
            },
            "margin-left": {
                default: "6.25mm",
            },
            format: {
                default: "Letter",
            },
            landscape: {
                boolean: true,
                default: false,
            },
            "display-header-footer": {
                boolean: true,
                default: false,
            },
            "header-template": {
                string: true,
                default: "",
            },
            "footer-template": {
                string: true,
                default: "",
            },
        },
        // eslint-disable-next-line no-shadow
        handler: async (argv) => {
            try {
                await print(argv);
            } catch (err) {
                console.error("Failed to generate pdf:", err);
                process.exit(1);
            }
        },
    }).command({
        command: "screenshot <url> [output]",
        desc: "Take screenshot of an HTML file or URL to PNG",
        builder: {
            ...commonOptions,
            "full-page": {
                boolean: true,
                default: true,
            },
            "omit-background": {
                boolean: true,
                default: false,
            },
            viewport: {
                describe: "Set viewport to a given size, e.g. 800x600",
                type: "string",
            },
        },
        // eslint-disable-next-line no-shadow
        handler: async (argv) => {
            try {
                await screenshot(argv);
            } catch (err) {
                console.error("Failed to take screenshot:", err);
                process.exit(1);
            }
        },
    })
    .demandCommand()
    .help()
    .argv;
