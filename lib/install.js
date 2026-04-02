"use strict";

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = ".github";
const INSTALL_DIR = ".github";

/**
 * Recursively copy a directory, creating target dirs as needed.
 * @param {string} src  - absolute source path
 * @param {string} dest - absolute destination path
 * @param {{overwrite: boolean, dryRun: boolean}} opts
 * @returns {{copied: string[], skipped: string[]}}
 */
function copyDir(src, dest, opts = {}) {
  const overwrite = opts.overwrite !== false;
  const dryRun = opts.dryRun === true;
  const copied = [];
  const skipped = [];

  if (!fs.existsSync(src)) {
    throw new Error(`Source directory not found: ${src}`);
  }

  if (!dryRun) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const sub = copyDir(srcPath, destPath, opts);
      copied.push(...sub.copied);
      skipped.push(...sub.skipped);
    } else {
      if (!overwrite && fs.existsSync(destPath)) {
        skipped.push(destPath);
      } else {
        if (!dryRun) {
          fs.copyFileSync(srcPath, destPath);
        }
        copied.push(destPath);
      }
    }
  }
  return { copied, skipped };
}

/**
 * Install template files into a target project directory.
 * Source: .github/ in the package
 * Destination: .github/ in the target project
 * @param {string} targetDir - project root to install into
 * @param {{overwrite?: boolean, dryRun?: boolean, quiet?: boolean}} opts
 */
function install(targetDir, opts = {}) {
  const quiet = opts.quiet === true;
  const packageRoot = path.resolve(__dirname, "..");
  const src = path.join(packageRoot, SOURCE_DIR);
  const dest = path.join(targetDir, INSTALL_DIR);

  if (!fs.existsSync(src)) {
    throw new Error(
      `Template directory not found in package: ${src}\n` +
        "The package may be corrupted. Try reinstalling."
    );
  }

  // Guard: don't install into the package's own directory
  if (path.resolve(targetDir) === path.resolve(packageRoot)) {
    if (!quiet) {
      console.log("agent-builder: skipping self-install");
    }
    return { copied: [], skipped: [] };
  }

  const result = copyDir(src, dest, opts);

  if (!quiet) {
    if (result.copied.length > 0) {
      console.log(
        `agent-builder: installed ${result.copied.length} file(s) into ${dest}`
      );
    }
    if (result.skipped.length > 0) {
      console.log(
        `agent-builder: skipped ${result.skipped.length} existing file(s) (use --force to overwrite)`
      );
    }
  }

  return result;
}

module.exports = { install, copyDir, SOURCE_DIR, INSTALL_DIR };
