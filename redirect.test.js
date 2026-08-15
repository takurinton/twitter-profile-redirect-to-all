"use strict";

const assert = require("node:assert/strict");
const { redirect } = require("./redirect.js");

const cases = [
  ["https://x.com/example", "https://x.com/example/all"],
  ["https://x.com/example/", "https://x.com/example/all"],
  ["https://x.com/example?lang=ja#top", "https://x.com/example/all?lang=ja#top"],
  ["https://x.com/example/with_replies", null],
  ["https://x.com/example/all", null],
  ["https://x.com/home", null],
  ["https://x.com/i", null],
  ["http://x.com/example", null],
  ["https://twitter.com/example", null],
  ["https://x.com/too_long_username", null]
];

for (const [input, expected] of cases) {
  assert.equal(redirect(input), expected, input);
}

console.log(`${cases.length} tests passed`);
