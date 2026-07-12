/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: 'out',
      startServerCommand: 'npx serve out -p 4000',
      url: [
        'http://localhost:4000',
        'http://localhost:4000/legal/aviso-legal.html',
        'http://localhost:4000/legal/cookies.html',
        'http://localhost:4000/legal/privacidad.html',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: '.*',
          assertions: {
            'categories:performance': ['warn', { minScore: 0.7 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['warn', { minScore: 0.85 }],
            'categories:seo': ['warn', { minScore: 0.85 }],
            'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
            'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
            'total-blocking-time': ['warn', { maxNumericValue: 1000 }],
          },
        },
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
