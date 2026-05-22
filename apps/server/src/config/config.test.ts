import { describe, it } from "node:test";
import assert from "node:assert";
import { loadConfig } from "./index.js";

describe("Config", () => {
  it("loads with default dev fallbacks", () => {
    const config = loadConfig();

    assert.strictEqual(typeof config.server.port, "number");
    assert.strictEqual(typeof config.server.host, "string");
    assert.strictEqual(typeof config.mongodb.uri, "string");
    assert.strictEqual(typeof config.jwt.accessSecret, "string");
    assert.ok(Array.isArray(config.kafka.brokers));
    assert.strictEqual(typeof config.metrics.enabled, "boolean");
  });

  it("parses integer env overrides", () => {
    process.env.NEURODYNE_PORT = "9000";
    process.env.NEURODYNE_METRICS_ENABLED = "false";

    const config = loadConfig();
    assert.strictEqual(config.server.port, 9000);
    assert.strictEqual(config.metrics.enabled, false);

    delete process.env.NEURODYNE_PORT;
    delete process.env.NEURODYNE_METRICS_ENABLED;
  });
});
