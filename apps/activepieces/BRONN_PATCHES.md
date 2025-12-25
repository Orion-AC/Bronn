# Bronn-Activepieces Integration Patches

This document tracks all patches applied to Activepieces for Bronn white-label integration.
When upgrading Activepieces upstream, re-apply these patches or verify they're still present.

## Patch Index

| ID | File | Type | Purpose |
|----|------|------|---------|
| P1 | `show-powered-by.tsx` | Branding | Hide "Powered by" badge |
| P2 | `navigation-utils.tsx` | Branding | Rename login param |
| P3 | `telemetry-provider.tsx` | Branding | Rename telemetry vars |
| P4 | `flow-chat.tsx` | Branding | Bot name fallback |
| P5 | `api.ts` | SaaS Removal | Remove cloud URL |
| P6 | `request-trial-api.ts` | SaaS Removal | Disable sales form |
| P7 | `language-toggle.tsx` | Branding | Remove help link |
| P8 | `add-todo-step-dialog.tsx` | Branding | Rename todos label |
| P9 | `docker-entrypoint.sh` | Branding | Default title/favicon |
| P10 | `bronn-auth-bypass.ts` | Auth | NEW FILE - bypass module |
| P11 | `authentication.module.ts` | Auth | Conditional bypass |
| P12 | `billing/index.ts` | OSS Config | **CRITICAL** - Enable API keys |
| P13 | `app.ts` | OSS Config | **CRITICAL** - Register EE modules in CE |


---

## Patch Details

### P1: show-powered-by.tsx
**Location:** `packages/react-ui/src/components/show-powered-by.tsx`
```diff
- const ShowPoweredBy = ({ show, position = 'sticky' }: ShowPoweredByProps) => {
-   if (!show) { return null; }
-   return (<div>... Activepieces badge ...</div>);
- };
+ const ShowPoweredBy = ({ show, position = 'sticky' }: ShowPoweredByProps) => {
+   return null; // Bronn white-label: always hide
+ };
```

### P5: api.ts
**Location:** `packages/react-ui/src/lib/api.ts`
```diff
- export const API_BASE_URL = import.meta.env.MODE === 'cloud'
-   ? 'https://cloud.activepieces.com'
-   : window.location.origin;
+ // Bronn white-label: Always use current origin
+ export const API_BASE_URL = window.location.origin;
```

### P10: bronn-auth-bypass.ts (NEW FILE)
**Location:** `packages/server/api/src/app/authentication/bronn-auth-bypass.ts`
- Created new file
- Exports `isBronnManagedAuthEnabled()` 
- Blocks `/sign-up`, `/sign-in` when `AP_BRONN_AUTH_MODE=managed`

### P11: authentication.module.ts
**Location:** `packages/server/api/src/app/authentication/authentication.module.ts`
```diff
+ import { bronnAuthBypassController, isBronnManagedAuthEnabled } from './bronn-auth-bypass'
+ 
  export const authenticationModule: FastifyPluginAsyncTypebox = async (app) => {
+   if (isBronnManagedAuthEnabled()) {
+     await app.register(bronnAuthBypassController, { prefix: '/v1/authentication' })
+     return
+   }
    await app.register(authenticationController, { prefix: '/v1/authentication' })
  }
```

### P12: billing/index.ts (CRITICAL - OSS API Keys)
**Location:** `packages/ee/shared/src/lib/billing/index.ts`
```diff
  export const OPEN_SOURCE_PLAN: PlatformPlanWithOnlyLimits = {
      embeddingEnabled: false,
-     globalConnectionsEnabled: false,
+     globalConnectionsEnabled: true,  // BRONN: Enable for self-hosted
      // ...
-     managePiecesEnabled: false,
+     managePiecesEnabled: true,  // BRONN: Enable for self-hosted
      // ...
-     apiKeysEnabled: false,
+     apiKeysEnabled: true,  // BRONN: CRITICAL - Enable API keys for self-hosted
      // ...
  }
```
**Why:** Without this patch, Community Edition shows "Contact Sales" for API keys.
Backend cannot authenticate with Activepieces, causing `/api/flows-proxy/*` to return 503.

---

## Upgrade Procedure


1. **Before upgrading Activepieces:**
   ```bash
   git stash  # Save local changes
   ```

2. **Pull upstream:**
   ```bash
   cd apps/activepieces
   git fetch upstream
   git merge upstream/main
   ```

3. **Re-apply patches:**
   - Run CI validation: `gh workflow run pr-check.yml`
   - CI will fail if patches are missing
   - Re-apply manually or cherry-pick from this branch

4. **Verify:**
   ```bash
   make up
   curl -X POST http://localhost:8080/api/v1/authentication/sign-in
   # Must return 403
   ```
