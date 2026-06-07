/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: "out",
      url: [
        "http://localhost/index.html",
        "http://localhost/legal/aviso-legal.html",
        "http://localhost/legal/cookies.html",
        "http://localhost/legal/privacidad.html",
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertMatrix: [
        {
          /* Fase 1 — aviso temprano (margen de 0.20 sobre el objetivo) */
          matchingUrlPattern: ".*",
          assertions: {
            "categories:performance": ["warn", { minScore: 0.7 }],
            "categories:accessibility": ["warn", { minScore: 0.75 }],
            "categories:best-practices": ["warn", { minScore: 0.7 }],
            "categories:seo": ["warn", { minScore: 0.75 }],
          },
        },
        {
          /* Fase 2 — límite obligatorio (objetivos CLAUDE.md) + CWV */
          matchingUrlPattern: ".*",
          assertions: {
            "categories:performance": ["error", { minScore: 0.9 }],
            "categories:accessibility": ["error", { minScore: 0.95 }],
            "categories:best-practices": ["error", { minScore: 0.9 }],
            "categories:seo": ["error", { minScore: 0.95 }],
            "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
            "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
            "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
            "total-blocking-time": ["warn", { maxNumericValue: 300 }],
          },
        },
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
