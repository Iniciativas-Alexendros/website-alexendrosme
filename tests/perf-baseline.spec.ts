import { test, expect } from "@playwright/test";

const perfThresholds = {
  lcp: 2500,
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
    return new Promise<{ lcp: number | null; cls: number }>((resolve) => {
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutShift.hadRecentInput && typeof layoutShift.value === "number") {
            cls += layoutShift.value;
          }
        }
      });
      try {
        clsObserver.observe({ type: "layout-shift", buffered: true });
      } catch {
        // layout-shift unsupported
      }

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries.find((e) => e.entryType === "largest-contentful-paint");
        if (lcp) {
          clsObserver.disconnect();
          resolve({ lcp: lcp.startTime, cls });
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      setTimeout(() => {
        clsObserver.disconnect();
        resolve({ lcp: null, cls });
      }, 5000);
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

  test.info().attach("cls", {
    body: String(metrics.cls),
    contentType: "text/plain",
  });
  expect(metrics.cls).toBeLessThanOrEqual(perfThresholds.cls);
});
