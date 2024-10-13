#!/usr/bin/env node

const express = require("express");
const app = express();

const parseCommandLineArgs = require("./cli");
const { createCache, isCacheExpired } = require("./cache");

const { port, origin } = parseCommandLineArgs();

console.log(`Starting caching proxy server on port ${port}`);
console.log(`Forwarding requests to ${origin}`);

const cache = createCache();

app.use(async (req, res) => {
  const cacheKey = req.originalUrl;
  const cachedResponse = cache.getKey(cacheKey);

  if (cachedResponse && !isCacheExpired(cachedResponse)) {
    console.log(`Serving from cache: ${cacheKey}`);

    res.set("X-Cache", "HIT");

    // Set content type header from cached response
    res.set("Content-Type", cachedResponse.contentType);

    // Handle JSON responses properly
    if (cachedResponse.contentType.includes("application/json")) {
      return res.json(JSON.parse(cachedResponse.data));
    }

    // Send cached text response
    return res.send(cachedResponse.data);
  } else {
    console.log(`Cache miss or expired for: ${cacheKey}`);
    console.log("Fetching from origin...");

    try {
      const response = await fetch(`${origin}${cacheKey}`, {
        method: "GET",
        headers: { ...req.headers, host: new URL(origin).hostname },
      });

      const contentType = await response.headers.get("content-type");
      const data = await response.text();

      // Cache the response with timestamp and content type
      cache.setKey(cacheKey, {
        timestamp: Date.now(),
        contentType,
        data,
      });
      cache.save(true);

      res.set("X-Cache", "MISS");

      // Forward response headers from origin server, except transfer-encoding and content-encoding
      response.headers.forEach((value, key) => {
        if (
          key.toLowerCase() !== "transfer-encoding" &&
          key.toLowerCase() !== "content-encoding"
        ) {
          res.set(key, value);
        }
      });

      // Send the response data from the origin server
      if (contentType && contentType.includes("application/json")) {
        return res.json(JSON.parse(data));
      } else {
        return res.status(response.status).send(data);
      }
    } catch (error) {
      console.error("Error fetching from origin:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
});

app.listen(port, () => {
  console.log(`Caching proxy server is running on port ${port}`);
});
