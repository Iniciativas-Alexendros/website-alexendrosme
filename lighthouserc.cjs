/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: "out",
      startServerCommand: "npx serve out -p 4000",
      url: [
        "http://localhost:4000",
        "http://localhost:4000/legal/aviso-legal.html",
        "http://localhost:4000/legal/cookies.html",
        "http://localhost:4000/legal/privacidad.html",
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: ".*",
          assertions: {
            "categories:performance": ["error", { minScore: 0.85 }],
            "categories:accessibility": ["error", { minScore: 0.95 }],
            "categories:best-practices": ["error", { minScore: 0.9 }],
            "categories:seo": ["error", { minScore: 0.9 }],
            "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
            "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
            "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
            "total-blocking-time": ["warn", { maxNumericValue: 300 }],
            "resource-summary:document:size": ["warn", { maxNumericValue: 25000 }],
            "resource-summary:script:size": ["warn", { maxNumericValue: 250000 }],
            "resource-summary:stylesheet:size": ["warn", { maxNumericValue: 50000 }],
            "resource-summary:font:size": ["warn", { maxNumericValue: 150000 }],
            "resource-summary:total:size": ["warn", { maxNumericValue: 450000 }],
            "resource-summary:total:count": ["warn", { maxNumericValue: 25 }],
          },
        },
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
