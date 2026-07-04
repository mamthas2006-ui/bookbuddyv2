import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Health APIs Unit & Integration Tests", () => {
  it("GET /api/v1/health should return operational status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("healthy");
    expect(res.body.data.services).toBeDefined();
  });

  it("GET /api/v1/metrics should return system runtime metrics", async () => {
    const res = await request(app).get("/api/v1/metrics");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uptime_seconds).toBeGreaterThanOrEqual(0);
    expect(res.body.data.database_metrics).toBeDefined();
  });

  it("GET /api/v1/version should return build and version metadata", async () => {
    const res = await request(app).get("/api/v1/version");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe("1.0.0");
    expect(res.body.data.api_version).toBe("v1");
  });

  it("GET /api/v1/qa-suite should execute and pass all 7 QA and protection test domains", async () => {
    const res = await request(app).get("/api/v1/qa-suite");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PASS");
    expect(res.body.data.overallScore).toBe(100);
    expect(res.body.data.tests.dispatchTesting.status).toBe("PASS");
    expect(res.body.data.tests.performanceTesting).toBeDefined();
    expect(res.body.data.tests.loadTesting.status).toBe("PASS");
    expect(res.body.data.tests.stressTesting.status).toBe("PASS");
    expect(res.body.data.tests.volumeTesting.status).toBe("PASS");
    expect(res.body.data.tests.configurationAndSecurity.status).toBe("PASS");
    expect(res.body.data.tests.stabilityTesting.status).toBe("PASS");
  });
});
