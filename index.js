#!/usr/bin/env node

const express = require("express");
const app = express();

const parseCommandLineArgs = require("./cli");
const createCache = require("./cache");

const { port, origin } = parseCommandLineArgs();

console.log(`Starting caching proxy server on port ${port}`);
console.log(`Forwarding requests to ${origin}`);

const cache = createCache();

app.use(express.json());

app.use(async (req, res) => {
  console.log("here");
});

app.listen(port, () => {
  console.log(`Caching proxy server is running on port ${port}`);
});
