"use strict";

/**
 * postinstall hook — automatically copies .github/ into the consumer project.
 * Runs after `npm install agent-builder`.
 *
 * Uses INIT_CWD (set by npm) to determine the consumer's project root.
 * Skips when installed globally or inside CI without INIT_CWD.
 */

const path = require("path");
const { install } = require("./install");

const targetDir = process.env.INIT_CWD;

if (!targetDir) {
  // INIT_CWD is unavailable (global install, or unusual environment)
  console.log("agent-builder: INIT_CWD not set, skipping postinstall copy.");
  process.exit(0);
}

try {
  install(targetDir, { overwrite: true, quiet: false });
} catch (err) {
  // postinstall failures should not break the consumer's npm install
  console.error(`agent-builder: postinstall warning — ${err.message}`);
}
