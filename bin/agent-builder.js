#!/usr/bin/env node
"use strict";

const path = require("path");
const { install } = require("../lib/install");

const args = process.argv.slice(2);
const command = args[0];

const { INSTALL_DIR } = require("../lib/install");

function printUsage() {
  console.log(`
Usage: agent-builder <command> [options]

Commands:
  install   Copy skill files into ${INSTALL_DIR}/ in the current directory
  status    Show which files would be installed (dry-run)

Options:
  --force        Overwrite existing files (default for 'install')
  --no-overwrite Keep existing files, only add new ones
  --help         Show this help message

Examples:
  npx agent-builder install              # Install with overwrite
  npx agent-builder install --no-overwrite  # Keep existing files
  npx agent-builder status               # Preview changes
`);
}

if (!command || command === "--help" || command === "-h") {
  printUsage();
  process.exit(0);
}

const targetDir = process.cwd();

switch (command) {
  case "install": {
    const overwrite = !args.includes("--no-overwrite");
    const result = install(targetDir, { overwrite });
    if (result.copied.length === 0 && result.skipped.length === 0) {
      console.log("Nothing to install.");
    }
    break;
  }

  case "status": {
    const result = install(targetDir, { dryRun: true, overwrite: true, quiet: true });
    if (result.copied.length === 0) {
      console.log("No files to install.");
    } else {
      console.log(`Files that would be installed (${result.copied.length}):`);
      for (const f of result.copied) {
        const rel = path.relative(targetDir, f);
        const exists = require("fs").existsSync(f);
        console.log(`  ${exists ? "[overwrite]" : "[new]     "} ${rel}`);
      }
    }
    break;
  }

  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
