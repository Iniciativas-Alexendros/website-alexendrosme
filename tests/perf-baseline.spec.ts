import { test, expect } from "@playwright/test";

const perfThresholds = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  ttfb: process.env["CI"] ? 1500 : 5000,
};

test("home page performance baseline", async ({ page }) => {
  test.skip(
    !process.env["CI"],
    "Perf baseline solo en CI (static export); next dev TTFB no es representativo",
  );
  const start = Date.now();

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const ttfb = Date.now() - start;

  const metrics = await page.evaluate(() => {
    return new Promise<{ lcp: number | null }>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries.find((e) => e.entryType === "largest-contentful-paint");
        if (lcp) resolve({ lcp: lcp.startTime });
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      setTimeout(() => resolve({ lcp: null }), 5000);
    });
  });

  test.info().attach("ttfb", {
    body: String(ttfb),
    contentType: "text/plain",
  });

  expect(ttfb).toBeLessThanOrEqual(perfThresholds.ttfb);

  if (metrics.lcp) {
    test.info().attach("lcp", {
      body: String(metrics.lcp),
      contentType: "text/plain",
    });
    expect(metrics.lcp).toBeLessThanOrEqual(perfThresholds.lcp);
  }
});
