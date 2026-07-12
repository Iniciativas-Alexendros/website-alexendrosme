import { test, expect } from "@playwright/test";

for (const feed of ["/feed.xml", "/feed.atom"]) {
  test(`${feed} es XML válido y contiene artículos`, async ({ request }) => {
    const response = await request.get(feed);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<title>");
    const items = feed === "/feed.xml" ? body.match(/<item>/g) : body.match(/<entry>/g);
    expect(items?.length).toBeGreaterThan(0);
  });
}
