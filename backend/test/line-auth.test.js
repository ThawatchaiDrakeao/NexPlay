const test = require("node:test");
const assert = require("node:assert/strict");

const {
  extractTrustedLineIdentity,
} = require("../src/modules/line/line.service");

test("extractTrustedLineIdentity rejects missing LINE subject", () => {
  assert.throws(() => extractTrustedLineIdentity({}), /LINE user id/i);
});

test("extractTrustedLineIdentity returns the trusted LINE subject", () => {
  const identity = extractTrustedLineIdentity({ sub: "U1234567890" });

  assert.deepEqual(identity, { lineUserId: "U1234567890" });
});
