#!/usr/bin/env node
const { Command } = require("commander");

function parseCommandLineArgs() {
  const program = new Command();

  program
    .name("caching-proxy")
    .description("Start a caching proxy server")
    .option("--port <number>", "Port to run the proxy server on", "3000")
    .option("--origin <url>", "Origin server URL", "http://dummyjson.com");

  program.parse(process.argv);

  const options = program.opts();

  return {
    port: options.port,
    origin: options.origin,
  };
}

module.exports = parseCommandLineArgs;
