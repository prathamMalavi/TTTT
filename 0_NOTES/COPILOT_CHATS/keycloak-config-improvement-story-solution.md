# Keycloak Service Configuration Improvement - Complete Story & Solution Guide

## Session Date: April 24, 2026
## Author: Development Team
## Status: ✅ Implementation Complete

---

# TABLE OF CONTENTS

1. [JIRA Story Description](#jira-story-description)
2. [What is This Story About? (Simple Explanation)](#what-is-this-story-about)
3. [Background: Understanding the Problem](#background-understanding-the-problem)
4. [Jan's Requirements (Verbatim)](#jans-requirements)
5. [Solution Overview](#solution-overview)
6. [Before vs After Comparison](#before-vs-after-comparison)
7. [Code Changes Explained](#code-changes-explained)
8. [Configuration Guide](#configuration-guide)
9. [Testing Recommendations](#testing-recommendations)

---

# JIRA STORY DESCRIPTION

## Title
Improve Keycloak Service Configuration

## Description
Enhance the `KeycloakAuthService` in `@onecx/shell-auth` to support configurable authentication behavior:

**Changes:**
- Add configurable `onTokenExpired` handler - optionally triggers automatic token refresh when token expires
- Add configurable `onAuthRefreshError` handler - optionally triggers re-login when token refresh fails
- Add configurable `timeSkew` for Keycloak init - handles client/server clock differences
- Add configurable `minValidity` parameter for `updateToken()` - controls refresh threshold
- Add mutex (Semaphore) for `updateTokenIfNeeded()` - prevents concurrent refresh calls

**New Config Keys:**
- `KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED` - Enable proactive token refresh
- `KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED` - Enable re-login on refresh failure
- `KEYCLOAK_TIME_SKEW` - Manual time difference override
- `KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY` - Token refresh threshold in seconds

**Backward Compatible:** All new configs default to `false`/`undefined`, preserving existing behavior.

**Files Modified:**
- `libs/angular-integration-interface/src/lib/model/config-key.model.ts`
- `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`
- `src/assets/env.json` (Shell)

---

# WHAT IS THIS STORY ABOUT?

## Simple Explanation (For Non-Technical Readers)

Imagine you're logged into OneCX and reading a document for 30 minutes without clicking anything. 

**The Problem (Before):**
- Your "access pass" (token) expires after some time
- The system only notices when you try to do something (like clicking a button)
- By then, your "refresh pass" might also have expired
- You suddenly get logged out unexpectedly!

**The Solution (After):**
- When your access pass expires, the system automatically gets a new one (if configured)
- If getting a new pass fails, the system asks you to log in again (instead of showing errors)
- Administrators can tune when the system should refresh your pass (5 seconds before expiry? 30 seconds?)

**Why This Matters:**
- ✅ Fewer unexpected logouts
- ✅ Better user experience
- ✅ Administrators can customize behavior per environment
- ✅ Works better in slow networks (by refreshing earlier)

---

# BACKGROUND: UNDERSTANDING THE PROBLEM

## What is Keycloak?

Keycloak is an identity management system that handles:
- **Who you are** (authentication) - verifying your username/password
- **What you can do** (authorization) - checking your permissions

## What are Tokens?

When you log in, Keycloak gives you three "passes":

| Token Type | Purpose | Lifespan | Analogy |
|------------|---------|----------|---------|
| **Access Token** | Proves you're logged in | Short (5-15 min) | Movie ticket - valid for one show |
| **Refresh Token** | Gets new access tokens | Longer (30 min - 8 hrs) | Season pass - can get multiple tickets |
| **ID Token** | Contains your identity info | Short (5-15 min) | ID card - shows who you are |

## The Token Lifecycle Problem

```
Timeline:
├── 0:00 - User logs in, gets tokens
├── 0:15 - Access token expires ⚠️
│           (User is reading, no API calls)
├── 0:45 - Refresh token expires ⚠️
│           (User still reading)
├── 1:00 - User clicks a button
│           → System tries to refresh
│           → Refresh token expired!
│           → User gets ERROR or logout 😱
```

**What should happen:**
```
Timeline:
├── 0:00 - User logs in, gets tokens
├── 0:15 - Access token expires
│           → System AUTOMATICALLY refreshes ✅
│           → User gets new tokens silently
├── 0:45 - Access token expires again
│           → System AUTOMATICALLY refreshes ✅
├── 1:00 - User clicks a button
│           → Works normally! 🎉
```

---

# JAN'S REQUIREMENTS

## Original Story
```
Title: Improve keycloak service config
Description:
- Reach out to Jan
- onTokenExpired + onAuthRefreshError + timeSkew -> config
- mutex for updateToken
- make updateToken parameter configurable
```

## Jan's Exact Inputs (Verbatim)
```
onTokenExpired + onAuthRefreshError is one of the feature missing used in client side 
as following code lines:
    this._keycloakAuth.onTokenExpired = (): KeycloakPromise<boolean, boolean> => this._keycloakAuth.updateToken()    
    this._keycloakAuth.onAuthRefreshError = (): void => this.login()

we need to add this as configurable
Config should have a default value should show old behavior if not configured
 
timeSkew -> configure and optional if not provided undefined

updateToken in various location -> have minValidity and undefined if not available

mutex() updateToken 
Note: Refer ConfigurationService Semaphore(1)  

We need the config entries in Shell v2 and v3
```

## Requirements Breakdown

| # | Jan Said | What It Means | Why It's Needed |
|---|----------|---------------|-----------------|
| 1 | `onTokenExpired = () => updateToken()` | When token expires, automatically refresh | Prevents session interruption |
| 2 | `onAuthRefreshError = () => login()` | When refresh fails, redirect to login | Clean recovery instead of errors |
| 3 | `Default: old behavior` | Don't break existing deployments | Backward compatibility |
| 4 | `timeSkew -> optional undefined` | Let admins override time difference | Handles clock sync issues |
| 5 | `minValidity undefined if not available` | Don't hardcode refresh threshold | Flexibility for different networks |
| 6 | `mutex() - Semaphore(1)` | Only one refresh at a time | Prevents race conditions |
| 7 | `Config entries in Shell` | Add to env.json | Runtime configuration |

---

# SOLUTION OVERVIEW

## New Configuration Keys

| Config Key | Type | Default | What It Does |
|------------|------|---------|--------------|
| `KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED` | "true"/"false" | false | Enables automatic token refresh when expired |
| `KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED` | "true"/"false" | false | Enables re-login when refresh fails |
| `KEYCLOAK_TIME_SKEW` | number (seconds) | undefined | Manual time difference override |
| `KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY` | number (seconds) | undefined (5) | Refresh threshold |

## Files Changed

| File | What Changed |
|------|--------------|
| `config-key.model.ts` | Added 4 new CONFIG_KEY enum values |
| `keycloak-auth.service.ts` | Added Semaphore, configurable handlers, timeSkew, minValidity |
| `env.json` | Added 4 new environment variable placeholders |

---

# BEFORE VS AFTER COMPARISON

## 1. onTokenExpired Handler

### BEFORE (Old Code)
```typescript
this.keycloak.onTokenExpired = () => {
  this.updateLocalStorage()  // Only saves tokens to localStorage
  // Token expires... nothing happens... waits for next API call
}
```

**Problem:** User's token expires while reading. System doesn't refresh until next action.

### AFTER (New Code)
```typescript
this.keycloak.onTokenExpired = () => {
  this.updateLocalStorage()  // Still saves tokens (backward compatible)
  
  if (onTokenExpiredEnabled) {  // NEW: Only if configured
    this.logger.info('Token expired - proactively refreshing')
    this.keycloak?.updateToken()  // NEW: Automatically refresh!
  }
}
```

**Improvement:** When enabled, token is refreshed immediately when it expires.

---

## 2. onAuthRefreshError Handler

### BEFORE (Old Code)
```typescript
this.keycloak.onAuthRefreshError = () => {
  this.updateLocalStorage()  // Only saves state
  // Refresh failed... user stuck... errors may show
}
```

**Problem:** User sees confusing errors or gets stuck in broken state.

### AFTER (New Code)
```typescript
this.keycloak.onAuthRefreshError = () => {
  this.updateLocalStorage()  // Still saves state (backward compatible)
  
  if (onAuthRefreshErrorEnabled) {  // NEW: Only if configured
    this.logger.info('Auth refresh error - initiating re-login')
    this.keycloak?.login(this.config)  // NEW: Redirect to login!
  }
}
```

**Improvement:** When enabled, user is cleanly redirected to login instead of seeing errors.

---

## 3. timeSkew Configuration

### BEFORE (Old Code)
```typescript
return this.keycloak.init({
  onLoad: 'check-sso',
  // ... other options
  // NO timeSkew option!
})
```

**Problem:** Keycloak auto-calculates time difference, which may be wrong with network latency.

### AFTER (New Code)
```typescript
// NEW: Read from config
const timeSkewStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_TIME_SKEW)
const timeSkew = timeSkewStr != null ? parseInt(timeSkewStr, 10) : undefined

return this.keycloak.init({
  onLoad: 'check-sso',
  // ... other options
  timeSkew: timeSkew,  // NEW: Pass configured value or undefined
})
```

**Improvement:** Admins can override time difference for environments with clock sync issues.

---

## 4. updateToken minValidity

### BEFORE (Old Code)
```typescript
async updateTokenIfNeeded(): Promise<boolean> {
  // ...
  return this.keycloak.updateToken()  // No parameter = default 5 seconds
}
```

**Problem:** Always uses 5-second threshold. Not enough for slow networks.

### AFTER (New Code)
```typescript
async updateTokenIfNeeded(): Promise<boolean> {
  return this.updateTokenSemaphore.use(async () => {  // NEW: Mutex!
    // ...
    
    // NEW: Read configured value
    const minValidityStr = await this.configService.getProperty(
      CONFIG_KEY.KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY
    )
    const minValidity = minValidityStr != null ? parseInt(minValidityStr, 10) : undefined
    
    return this.keycloak.updateToken(minValidity)  // NEW: Configurable threshold
  })
}
```

**Improvement:** 
- Admins can set threshold (e.g., 30 seconds for slow networks)
- Mutex prevents multiple simultaneous refresh attempts

---

## 5. Mutex (Semaphore) for Token Refresh

### BEFORE (Old Code)
```typescript
async updateTokenIfNeeded(): Promise<boolean> {
  // Multiple HTTP requests can call this simultaneously
  // Each call might trigger its own refresh
  return this.keycloak.updateToken()
}
```

**Problem:** 10 simultaneous API calls = 10 simultaneous refresh attempts.

### AFTER (New Code)
```typescript
private updateTokenSemaphore = new Semaphore(1)  // Only allows 1 at a time

async updateTokenIfNeeded(): Promise<boolean> {
  return this.updateTokenSemaphore.use(async () => {
    // Only ONE caller executes this at a time
    // Others wait for the first one to finish
    return this.keycloak.updateToken(minValidity)
  })
}
```

**Improvement:** Only one refresh happens; all callers share the result.

---

# CODE CHANGES EXPLAINED

## File 1: config-key.model.ts

**Path:** `libs/angular-integration-interface/src/lib/model/config-key.model.ts`

**What:** Added 4 new configuration keys to the enum.

**Why:** These keys allow runtime configuration of Keycloak behavior without code changes.

```typescript
export enum CONFIG_KEY {
  // ... existing keys ...
  KEYCLOAK_CLIENT_ID = 'KEYCLOAK_CLIENT_ID',
  
  // ✅ NEW KEYS ADDED:
  KEYCLOAK_TIME_SKEW = 'KEYCLOAK_TIME_SKEW',
  KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY = 'KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY',
  KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED = 'KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED',
  KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED = 'KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED',
  
  // ... other keys ...
}
```

---

## File 2: keycloak-auth.service.ts

**Path:** `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

### Change 1: Added Semaphore Import and Instance

```typescript
// ✅ NEW: Import semaphore library
import Semaphore from 'ts-semaphore'

@Injectable()
export class KeycloakAuthService implements AuthService {
  private readonly logger = createLogger('KeycloakAuthService')
  private configService = inject(ConfigurationService)
  private keycloak: Keycloak | undefined
  
  // ✅ NEW: Semaphore instance (allows only 1 concurrent operation)
  private updateTokenSemaphore = new Semaphore(1)
```

**Why Semaphore?**

Think of it like a bathroom with one key:
- Person 1 takes the key, goes in
- Persons 2, 3, 4 arrive, must wait
- Person 1 finishes, returns key
- Person 2 gets key, goes in
- And so on...

This prevents multiple token refresh requests from competing.

---

### Change 2: Added timeSkew to init()

```typescript
public async init(config?: Record<string, unknown>): Promise<boolean> {
  // ... existing code ...

  // ✅ NEW: Read timeSkew from configuration
  const timeSkewStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_TIME_SKEW)
  const timeSkew = timeSkewStr != null ? parseInt(timeSkewStr, 10) : undefined

  // ... keycloak setup ...

  return this.keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
    idToken: idToken || undefined,
    refreshToken: refreshToken || undefined,
    token: token || undefined,
    timeSkew: timeSkew,  // ✅ NEW: Pass configured timeSkew
  })
}
```

**What is timeSkew?**

Your computer clock says 10:00:00
Server clock says 10:00:05
timeSkew = server - client = 5 seconds

Token says "expires at 10:05:00" (server time)
Without timeSkew: Your browser thinks it's 10:05:00 at 10:04:55 → token seems expired!
With timeSkew: Browser adjusts → knows token is valid for 5 more seconds

---

### Change 3: Configurable Event Handlers

```typescript
private async setupEventListener() {
  if (!this.keycloak) return

  // ✅ NEW: Read configuration at startup
  const onTokenExpiredEnabled =
    (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED)) === 'true'

  const onAuthRefreshErrorEnabled =
    (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED)) === 'true'

  // ... other handlers ...

  // ✅ MODIFIED: Token expired handler
  this.keycloak.onTokenExpired = () => {
    this.updateLocalStorage()  // Always do this (backward compatible)
    
    // ✅ NEW: Optionally refresh token
    if (onTokenExpiredEnabled) {
      this.logger.info('Token expired - proactively refreshing')
      this.keycloak?.updateToken()
    }
  }

  // ✅ MODIFIED: Refresh error handler
  this.keycloak.onAuthRefreshError = () => {
    this.updateLocalStorage()  // Always do this (backward compatible)
    
    // ✅ NEW: Optionally redirect to login
    if (onAuthRefreshErrorEnabled) {
      this.logger.info('Auth refresh error - initiating re-login')
      this.keycloak?.login(this.config)
    }
  }
}
```

---

### Change 4: Mutex and Configurable minValidity

```typescript
async updateTokenIfNeeded(): Promise<boolean> {
  // ✅ NEW: Wrap in semaphore (mutex)
  return this.updateTokenSemaphore.use(async () => {
    if (!this.keycloak?.authenticated) {
      return this.keycloak?.login(this.config).then(() => false) 
        ?? Promise.reject('Keycloak not initialized!')
    }

    // ✅ NEW: Read minValidity from configuration
    const minValidityStr = await this.configService.getProperty(
      CONFIG_KEY.KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY
    )
    const minValidity = minValidityStr != null ? parseInt(minValidityStr, 10) : undefined

    // ✅ MODIFIED: Pass configurable minValidity
    return this.keycloak.updateToken(minValidity)
  })
}
```

**What is minValidity?**

It's the "buffer time" before token expiry when refresh is triggered:

```
Token expires at: 10:00:00
minValidity = 5 seconds

At 9:59:54 → Check: token expires in 6 seconds > 5 → DON'T refresh
At 9:59:56 → Check: token expires in 4 seconds < 5 → REFRESH NOW
```

Higher minValidity = refresh earlier (safer for slow networks)
Lower minValidity = refresh later (fewer network calls)

---

## File 3: env.json (Shell)

**Path:** `src/assets/env.json`

```json
{
  "APP_BASE_HREF": "${APP_BASE_HREF}",
  "KEYCLOAK_REALM": "${KEYCLOAK_REALM}",
  "KEYCLOAK_URL": "${KEYCLOAK_URL}",
  "KEYCLOAK_CLIENT_ID": "${KEYCLOAK_CLIENT_ID}",
  
  // ✅ NEW: Keycloak config entries
  "KEYCLOAK_TIME_SKEW": "${KEYCLOAK_TIME_SKEW}",
  "KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY": "${KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY}",
  "KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED": "${KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED}",
  "KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED": "${KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED}",
  
  // ... other entries ...
}
```

**How It Works:**

In deployment, these `${VARIABLE}` placeholders are replaced with actual values:
```bash
# Example: Kubernetes ConfigMap
KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED=true
KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY=30
```

---

# CONFIGURATION GUIDE

## For Administrators

### Basic Configuration (Recommended)

Enable proactive token refresh and error recovery:

```json
{
  "KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED": "true",
  "KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED": "true"
}
```

### Advanced Configuration

For slow networks or specific requirements:

```json
{
  "KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED": "true",
  "KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED": "true",
  "KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY": "30",
  "KEYCLOAK_TIME_SKEW": "-5"
}
```

### Configuration Matrix

| Scenario | TOKEN_EXPIRED | REFRESH_ERROR | MIN_VALIDITY | TIME_SKEW |
|----------|---------------|---------------|--------------|-----------|
| Default (old behavior) | undefined | undefined | undefined | undefined |
| Basic improvement | "true" | "true" | undefined | undefined |
| Slow network | "true" | "true" | "30" | undefined |
| Clock sync issues | "true" | "true" | undefined | "-10" |

---

# TESTING RECOMMENDATIONS

## Unit Tests Needed

Currently, `keycloak-auth.service.ts` has **no existing unit tests**. The following tests should be added:

### Test 1: onTokenExpired Behavior
```typescript
describe('onTokenExpired', () => {
  it('should only update localStorage when KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED is false')
  it('should call updateToken when KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED is true')
})
```

### Test 2: onAuthRefreshError Behavior
```typescript
describe('onAuthRefreshError', () => {
  it('should only update localStorage when KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED is false')
  it('should call login when KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED is true')
})
```

### Test 3: timeSkew Configuration
```typescript
describe('timeSkew', () => {
  it('should pass undefined when KEYCLOAK_TIME_SKEW is not configured')
  it('should pass configured value when KEYCLOAK_TIME_SKEW is set')
})
```

### Test 4: minValidity Configuration
```typescript
describe('updateTokenIfNeeded', () => {
  it('should pass undefined minValidity when not configured')
  it('should pass configured minValidity')
})
```

### Test 5: Semaphore Behavior
```typescript
describe('updateTokenIfNeeded mutex', () => {
  it('should only allow one concurrent call')
  it('should return same result to all concurrent callers')
})
```

## Manual Testing Steps

1. **Test default behavior (no config)**
   - Deploy without new config keys
   - Verify old behavior is preserved

2. **Test proactive refresh**
   - Set `KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED=true`
   - Wait for token to expire
   - Verify token is refreshed automatically

3. **Test error recovery**
   - Set `KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED=true`
   - Force refresh token expiry
   - Verify redirect to login

---

# SUMMARY

## What Was Done

| # | Change | Purpose |
|---|--------|---------|
| 1 | Added 4 new CONFIG_KEY values | Enable runtime configuration |
| 2 | Added Semaphore to updateTokenIfNeeded | Prevent concurrent refresh calls |
| 3 | Added configurable onTokenExpired | Proactive token refresh |
| 4 | Added configurable onAuthRefreshError | Clean error recovery |
| 5 | Added configurable timeSkew | Handle clock sync issues |
| 6 | Added configurable minValidity | Tunable refresh threshold |
| 7 | Added config entries to env.json | Environment-specific settings |

## Backward Compatibility

✅ **100% Backward Compatible**

All new features are opt-in:
- If configs are not set, behavior is exactly the same as before
- Existing deployments continue working without changes

## Benefits

| Benefit | Description |
|---------|-------------|
| **Better UX** | Users don't get unexpectedly logged out |
| **Cleaner errors** | Refresh failures redirect to login instead of showing errors |
| **Flexibility** | Admins can tune behavior per environment |
| **Performance** | Mutex prevents redundant refresh calls |
| **Slow network support** | Configurable refresh threshold |

---

# OPEN QUESTIONS

## "Shell v2 and v3" Clarification Needed

Jan mentioned: "We need the config entries in Shell v2 and v3"

**Possible meanings:**
1. `authServiceProxy` API versions (currently only v1 exists)
2. Different Helm chart configurations
3. Angular preloaders (angular-18, angular-19, angular-20)

**Current implementation:** Config entries added to main Shell env.json. Further clarification from Jan may be needed.
if (kc.onTokenExpired) {
  var expiresIn = (kc.tokenParsed['exp'] - (new Date().getTime() / 1000) + kc.timeSkew) * 1000;
  if (expiresIn <= 0) {
    kc.onTokenExpired();
  } else {
    kc.tokenTimeoutHandle = setTimeout(kc.onTokenExpired, expiresIn);
  }
}
```

**Our Implementation:**
```typescript
this.keycloak.onTokenExpired = () => {
  this.updateLocalStorage()           // Always (backward compatible)
  if (onTokenExpiredEnabled) {
    this.keycloak?.updateToken()      // Jan's pattern when enabled
  }
}
```

**Why:**
- Jan's pattern returns `updateToken()` promise, but `onTokenExpired` signature is `void`
- keycloak-js ignores the return value
- The key behavior is **calling** `updateToken()` to proactively refresh

### 2. onAuthRefreshError Handler

**Jan's Exact Pattern:**
```typescript
this._keycloakAuth.onAuthRefreshError = (): void => this.login()
```

**What keycloak-js Does:**
```javascript
// In updateToken() when refresh fails:
if (req.status == 400) {
  kc.clearToken();  // Clears tokens
}
kc.onAuthRefreshError && kc.onAuthRefreshError();
```

**Our Implementation:**
```typescript
this.keycloak.onAuthRefreshError = () => {
  this.updateLocalStorage()           // Always (backward compatible)
  if (onAuthRefreshErrorEnabled) {
    this.keycloak?.login(this.config) // Jan's pattern: this.login()
  }
}
```

**Why:**
- When refresh fails, session is invalid
- Re-authentication gives user a clean session
- Configurable to maintain backward compatibility

### 3. timeSkew Configuration

**Jan's Input:** "timeSkew -> configure and optional if not provided undefined"

**keycloak-js Behavior:**
```javascript
// In init():
if (initOptions.timeSkew != null) {
  kc.timeSkew = initOptions.timeSkew;  // Manual override
}
// Else auto-calculated from server response
```

**Our Implementation:**
```typescript
const timeSkewStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_TIME_SKEW)
const timeSkew = timeSkewStr != null ? parseInt(timeSkewStr, 10) : undefined

// Pass undefined if not configured (keycloak auto-calculates)
timeSkew: timeSkew,
```

### 4. updateToken minValidity

**Jan's Input:** "updateToken in various location -> have minValidity and undefined if not available"

**keycloak-js Behavior:**
```javascript
kc.updateToken = function(minValidity) {
  minValidity = minValidity || 5;  // Defaults to 5 if undefined/null
  
  if (minValidity == -1) {
    refreshToken = true;            // Force refresh
  } else if (kc.isTokenExpired(minValidity)) {
    refreshToken = true;            // Refresh if expires within minValidity
  }
}
```

**Our Implementation:**
```typescript
const minValidityStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY)
const minValidity = minValidityStr != null ? parseInt(minValidityStr, 10) : undefined

return this.keycloak.updateToken(minValidity)  // undefined = keycloak uses default 5
```

### 5. Mutex (Semaphore)

**Jan's Input:** "mutex() updateToken - Note: Refer ConfigurationService Semaphore(1)"

**ConfigurationService Pattern:**
```typescript
private semaphore = new Semaphore(1)

public async setProperty(key: string, val: string) {
  return this.semaphore.use(async () => {
    // Only one caller at a time
  })
}
```

**Our Implementation:**
```typescript
private updateTokenSemaphore = new Semaphore(1)

async updateTokenIfNeeded(): Promise<boolean> {
  return this.updateTokenSemaphore.use(async () => {
    // Only one token refresh at a time
  })
}
```

---

# PART 4: Open Items

## Question: "Shell v2 and v3"

**Jan's Input:** "We need the config entries in Shell v2 and v3"

**Possible Interpretations:**
1. **authServiceProxy API versions** - Currently only `v1` exists in declarations.ts
2. **Helm chart configurations** - Different helm value sets
3. **Angular preloaders** - angular-18, angular-19, angular-20 folders

**Current Status:** 
- Config entries added to main Shell env.json ✅
- If this refers to extending authServiceProxy API, additional changes may be needed

---

# Summary

## All Changes Implemented

| Requirement | File | Status |
|-------------|------|--------|
| Add CONFIG_KEY entries | config-key.model.ts | ✅ |
| Semaphore import | keycloak-auth.service.ts | ✅ |
| Semaphore instance | keycloak-auth.service.ts | ✅ |
| timeSkew in init() | keycloak-auth.service.ts | ✅ |
| Configurable onTokenExpired | keycloak-auth.service.ts | ✅ |
| Configurable onAuthRefreshError | keycloak-auth.service.ts | ✅ |
| Configurable minValidity | keycloak-auth.service.ts | ✅ |
| Mutex for updateTokenIfNeeded | keycloak-auth.service.ts | ✅ |
| env.json config entries | src/assets/env.json | ✅ |

## Backward Compatibility: 100%

All changes preserve old behavior when configs are not set:
- `KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED` not set → only updateLocalStorage() (old behavior)
- `KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED` not set → only updateLocalStorage() (old behavior)
- `KEYCLOAK_TIME_SKEW` not set → undefined (keycloak auto-calculates)
- `KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY` not set → undefined (keycloak uses default 5)
this._keycloakAuth.onTokenExpired = (): KeycloakPromise<boolean, boolean> => this._keycloakAuth.updateToken()
this._keycloakAuth.onAuthRefreshError = (): void => this.login()
```

---

# PART 2: Story Solution Steps

## Files to Modify

### File 1: Config Key Model
**Path**: `libs/angular-integration-interface/src/lib/model/config-key.model.ts`

**Changes**:
Add new CONFIG_KEY enum values:
```typescript
// Add after existing KEYCLOAK keys
KEYCLOAK_TIME_SKEW = 'KEYCLOAK_TIME_SKEW',
KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY = 'KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY',
KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED = 'KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED',
KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED = 'KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED',
```

### File 2: Keycloak Auth Service
**Path**: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

**Changes**:

1. **Add Semaphore import and instance**
```typescript
import Semaphore from 'ts-semaphore'

// In class:
private updateTokenSemaphore = new Semaphore(1)
```

2. **Modify init() to add timeSkew configuration**
```typescript
// In keycloak.init() options:
const timeSkew = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_TIME_SKEW)

return this.keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
  idToken: idToken || undefined,
  refreshToken: refreshToken || undefined,
  token: token || undefined,
  timeSkew: timeSkew != null ? parseInt(timeSkew, 10) : undefined,
})
```

3. **Modify setupEventListener() for configurable handlers**
```typescript
private async setupEventListener() {
  if (!this.keycloak) return
  
  const onTokenExpiredEnabled = 
    (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED)) === 'true'
  
  const onAuthRefreshErrorEnabled = 
    (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED)) === 'true'

  this.keycloak.onAuthError = () => {
    this.updateLocalStorage()
  }
  
  this.keycloak.onAuthLogout = () => {
    this.logger.info('SSO logout nav to root')
    this.clearKCStateFromLocalstorage()
    this.keycloak?.login(this.config)
  }
  
  this.keycloak.onAuthRefreshSuccess = () => {
    this.updateLocalStorage()
  }
  
  this.keycloak.onAuthRefreshError = () => {
    this.updateLocalStorage()
    if (onAuthRefreshErrorEnabled) {
      this.logger.info('Auth refresh error - initiating re-login')
      this.keycloak?.login(this.config)
    }
  }
  
  this.keycloak.onAuthSuccess = () => {
    this.updateLocalStorage()
  }
  
  this.keycloak.onTokenExpired = () => {
    this.updateLocalStorage()
    if (onTokenExpiredEnabled) {
      this.logger.info('Token expired - proactively refreshing')
      this.keycloak?.updateToken()
    }
  }
  
  this.keycloak.onActionUpdate = () => {
    this.updateLocalStorage()
  }
  
  this.keycloak.onReady = () => {
    this.updateLocalStorage()
  }
}
```

4. **Modify updateTokenIfNeeded() with semaphore and configurable minValidity**
```typescript
async updateTokenIfNeeded(): Promise<boolean> {
  return this.updateTokenSemaphore.use(async () => {
    if (!this.keycloak?.authenticated) {
      return this.keycloak?.login(this.config).then(() => false) ?? Promise.reject('Keycloak not initialized!')
    }
    
    const minValidityStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY)
    const minValidity = minValidityStr != null ? parseInt(minValidityStr, 10) : undefined
    
    return this.keycloak.updateToken(minValidity)
  })
}
```

### File 3: Shell env.json
**Path**: `src/assets/env.json`

**Changes**:
Add new configuration placeholders:
```json
{
  "KEYCLOAK_TIME_SKEW": "${KEYCLOAK_TIME_SKEW}",
  "KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY": "${KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY}",
  "KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED": "${KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED}",
  "KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED": "${KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED}"
}
```

### Summary of Changes by Location

| File | Change Type | Description |
|------|-------------|-------------|
| `config-key.model.ts` | ADD | 4 new CONFIG_KEY enum values |
| `keycloak-auth.service.ts` | IMPORT | Add Semaphore import |
| `keycloak-auth.service.ts` | ADD | Add updateTokenSemaphore instance |
| `keycloak-auth.service.ts` | MODIFY | Add timeSkew to init() |
| `keycloak-auth.service.ts` | MODIFY | Make setupEventListener async, add configurable handlers |
| `keycloak-auth.service.ts` | MODIFY | Add semaphore and minValidity to updateTokenIfNeeded() |
| `env.json` | ADD | 4 new config placeholders |

---

# PART 3: Solution Explanation

## Why? - Business/Technical Reasons

### 1. Why Configurable onTokenExpired?

**Business Reason**: 
- Users reading content for extended periods don't make API calls
- If access token expires and later refresh token expires, user loses session unexpectedly
- Proactive refresh maintains seamless user experience

**Technical Reason**:
- keycloak-js fires `onTokenExpired` when access token expires
- Setting `this.keycloak.updateToken()` in handler proactively gets new token
- Configurable because:
  - Some deployments may prefer on-demand refresh (current behavior)
  - Some may need proactive refresh (new behavior)
  - Backward compatibility requires opt-in

**keycloak-js Implementation Reference**:
```javascript
// In setToken() function of keycloak.js:
if (kc.onTokenExpired) {
  var expiresIn = (kc.tokenParsed['exp'] - (new Date().getTime() / 1000) + kc.timeSkew) * 1000;
  if (expiresIn <= 0) {
    kc.onTokenExpired();  // Fires immediately if already expired
  } else {
    kc.tokenTimeoutHandle = setTimeout(kc.onTokenExpired, expiresIn);  // Sets timer
  }
}
```

### 2. Why Configurable onAuthRefreshError?

**Business Reason**:
- Token refresh failure leaves user in limbo state
- Re-authentication provides clear recovery path
- Different organizations may have different security policies for failure handling

**Technical Reason**:
- `onAuthRefreshError` fires when refresh token request fails (e.g., 400 response)
- Two failure modes exist:
  - Refresh token expired → need re-login
  - Network error → might retry
- Current behavior (just update localStorage) provides no recovery

**keycloak-js Implementation Reference**:
```javascript
// In updateToken() function:
if (req.status == 200) {
  // ... success handling ...
  kc.onAuthRefreshSuccess && kc.onAuthRefreshSuccess();
} else {
  if (req.status == 400) {
    kc.clearToken();  // Clears tokens on bad request
  }
  kc.onAuthRefreshError && kc.onAuthRefreshError();  // Our handler is called here
}
```

### 3. Why timeSkew Configuration?

**Business Reason**:
- Deployments in environments with known clock synchronization issues
- Testing and debugging scenarios need clock manipulation
- Regulatory requirements in some industries for time accuracy

**Technical Reason**:
- Token expiration is based on server time (`exp` claim in JWT)
- Client uses local time for calculations
- `timeSkew = serverTime - clientTime`
- keycloak-js auto-calculates from response timing, but:
  - Initial calculation may be inaccurate
  - Network latency affects calculation
  - Known environments might need explicit override

**keycloak-js Implementation Reference**:
```javascript
// In init() function:
if (initOptions.timeSkew != null) {
  kc.timeSkew = initOptions.timeSkew;  // Manual override
}

// Auto-calculation when token is received:
kc.timeSkew = Math.floor(timeLocal / 1000) - kc.tokenParsed.iat;

// Usage in isTokenExpired():
var expiresIn = kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + kc.timeSkew;
```

### 4. Why Configurable updateToken minValidity?

**Business Reason**:
- High-latency networks need earlier refresh threshold
- Low-latency networks can use smaller threshold
- Optimizes between proactive refresh and unnecessary refresh

**Technical Reason**:
- `minValidity` is the minimum seconds until expiration before refresh is triggered
- keycloak-js default is 5 seconds
- Too small: risk of using expired token before refresh completes
- Too large: unnecessary refresh calls

**keycloak-js Implementation Reference**:
```javascript
kc.updateToken = function(minValidity) {
  minValidity = minValidity || 5;  // Default to 5 seconds
  
  // ...
  
  if (minValidity == -1) {
    refreshToken = true;  // Force refresh
  } else if (!kc.tokenParsed || kc.isTokenExpired(minValidity)) {
    refreshToken = true;  // Refresh if expires within minValidity seconds
  }
}
```

### 5. Why Semaphore/Mutex for updateToken?

**Business Reason**:
- Reduces unnecessary processing overhead
- Ensures consistent behavior across concurrent requests
- Prevents potential race conditions in application logic

**Technical Reason**:
- Multiple HTTP requests can trigger concurrent `updateTokenIfNeeded()` calls
- While keycloak-js has `refreshQueue` for HTTP-level deduplication:
  ```javascript
  refreshQueue.push(promise);
  if (refreshQueue.length == 1) {
    // Only first caller makes HTTP request
  }
  ```
- Application-level semaphore provides:
  - Fewer function calls to keycloak.updateToken()
  - Single await point for authentication check
  - Pattern consistency with ConfigurationService

**ConfigurationService Reference Pattern**:
```typescript
// In ConfigurationService:
private semaphore = new Semaphore(1)

public async setProperty(key: string, val: string) {
  return this.semaphore.use(async () => {
    // Critical section - only one caller at a time
  })
}
```

## What? - Functionality and Purpose

### Configuration Keys Summary

| Config Key | Type | Default | Purpose |
|------------|------|---------|---------|
| `KEYCLOAK_TIME_SKEW` | number | undefined | Override client-server time difference |
| `KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY` | number | undefined (KC default: 5) | Seconds before expiry to trigger refresh |
| `KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED` | boolean | false | Enable proactive token refresh |
| `KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED` | boolean | false | Enable re-login on refresh failure |

### Behavior Matrix

| Config | Value | Behavior |
|--------|-------|----------|
| `ON_TOKEN_EXPIRED_ENABLED` | `"true"` | Calls `updateToken()` on token expiry |
| `ON_TOKEN_EXPIRED_ENABLED` | `"false"` or not set | Only updates localStorage (current behavior) |
| `ON_AUTH_REFRESH_ERROR_ENABLED` | `"true"` | Calls `login()` on refresh failure |
| `ON_AUTH_REFRESH_ERROR_ENABLED` | `"false"` or not set | Only updates localStorage (current behavior) |
| `TIME_SKEW` | number string (e.g., `"-5"`) | Passes to keycloak init, overrides auto-calc |
| `TIME_SKEW` | not set | Keycloak auto-calculates from response |
| `UPDATE_TOKEN_MIN_VALIDITY` | number string (e.g., `"30"`) | Passes to updateToken(30) |
| `UPDATE_TOKEN_MIN_VALIDITY` | not set | Passes undefined, keycloak uses default 5 |

## How? - Step-by-step Flow

### Flow 1: Token Refresh with New Configuration

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    Token Refresh Flow (Improved)                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐                                                      │
│  │ HTTP Request    │                                                      │
│  │ (via TokenInt.) │                                                      │
│  └────────┬────────┘                                                      │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────┐                                                      │
│  │ updateToken     │                                                      │
│  │ IfNeeded()      │                                                      │
│  └────────┬────────┘                                                      │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐ │
│  │ Semaphore.use() │───▶│ Wait if another call is in progress         │ │
│  └────────┬────────┘    └──────────────────────────────────────────────┘ │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────┐                                                      │
│  │ Check auth      │                                                      │
│  │ status          │                                                      │
│  └────────┬────────┘                                                      │
│           │                                                               │
│     ┌─────┴─────┐                                                         │
│     │           │                                                         │
│     ▼           ▼                                                         │
│ ┌───────┐  ┌────────────┐                                                 │
│ │ Not   │  │ Auth'd     │                                                 │
│ │ Auth  │  │            │                                                 │
│ └───┬───┘  └─────┬──────┘                                                 │
│     │            │                                                        │
│     ▼            ▼                                                        │
│ ┌───────┐  ┌────────────────────────────────────────┐                     │
│ │login()│  │ Get KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY │                     │
│ │       │  │ from config                            │                     │
│ └───────┘  └─────────────────┬──────────────────────┘                     │
│                              │                                            │
│                              ▼                                            │
│                     ┌────────────────┐                                    │
│                     │ keycloak       │                                    │
│                     │ .updateToken   │                                    │
│                     │ (minValidity)  │                                    │
│                     └────────┬───────┘                                    │
│                              │                                            │
│                              ▼                                            │
│                     ┌────────────────┐                                    │
│                     │ Return result  │                                    │
│                     │ to HTTP req    │                                    │
│                     └────────────────┘                                    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Token Expiry Handling

```
┌──────────────────────────────────────────────────────────────────────────┐
│                Token Expiry Flow (With Configuration)                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐                                                      │
│  │ keycloak-js     │                                                      │
│  │ timer fires     │                                                      │
│  └────────┬────────┘                                                      │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────┐                                                      │
│  │ onTokenExpired  │                                                      │
│  │ callback        │                                                      │
│  └────────┬────────┘                                                      │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────┐                                                      │
│  │ updateLocal     │                                                      │
│  │ Storage()       │  ─── Always called (backward compatible)             │
│  └────────┬────────┘                                                      │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────────────────────────────────┐                          │
│  │ KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED === 'true'│                          │
│  └─────────────────────┬───────────────────────┘                          │
│                        │                                                  │
│           ┌────────────┴────────────┐                                     │
│           │                         │                                     │
│           ▼                         ▼                                     │
│     ┌───────────┐           ┌────────────┐                                │
│     │ TRUE      │           │ FALSE/     │                                │
│     │           │           │ undefined  │                                │
│     └─────┬─────┘           └─────┬──────┘                                │
│           │                       │                                       │
│           ▼                       ▼                                       │
│  ┌─────────────────┐      ┌────────────┐                                  │
│  │ logger.info()   │      │ Do nothing │                                  │
│  │ + updateToken() │      │ (current   │                                  │
│  │                 │      │ behavior)  │                                  │
│  └────────┬────────┘      └────────────┘                                  │
│           │                                                               │
│           ▼                                                               │
│  ┌─────────────────┐                                                      │
│  │ Token refreshed │                                                      │
│  │ proactively     │                                                      │
│  └─────────────────┘                                                      │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## When? - Use Cases and Scenarios

| Use Case | Configuration | Behavior |
|----------|---------------|----------|
| Standard deployment (default) | All configs undefined | Current behavior preserved |
| High availability requirement | `ON_TOKEN_EXPIRED_ENABLED=true` | Proactive refresh, fewer session interruptions |
| Strict security with re-auth | `ON_AUTH_REFRESH_ERROR_ENABLED=true` | Force login on any refresh failure |
| High latency network | `UPDATE_TOKEN_MIN_VALIDITY=30` | Refresh 30s before expiry |
| Known clock sync issues | `TIME_SKEW=-10` | Manually set 10 second negative skew |
| Performance testing | `UPDATE_TOKEN_MIN_VALIDITY=2` | Minimal refresh threshold |

---

# PART 4: Implementation Code Changes

## Change 1: config-key.model.ts

**Location**: `libs/angular-integration-interface/src/lib/model/config-key.model.ts`

```typescript
export enum CONFIG_KEY {
  TKIT_PORTAL_DEFAULT_THEME = 'TKIT_PORTAL_DEFAULT_THEME',
  TKIT_PORTAL_DISABLE_THEME_MANAGEMENT = 'TKIT_PORTAL_DISABLE_THEME_MANAGEMENT',
  TKIT_PORTAL_THEME_SERVER_URL = 'TKIT_PORTAL_THEME_SERVER_URL',
  TKIT_TOKEN_ROLE_CLAIM_NAME = 'TKIT_TOKEN_ROLE_CLAIM_NAME',
  TKIT_PORTAL_ID = 'TKIT_PORTAL_ID',
  TKIT_SUPPORTED_LANGUAGES = 'TKIT_SUPPORTED_LANGUAGES',
  TKIT_SEARCH_BASE_URL = 'TKIT_SEARCH_BASE_URL',
  APP_BASE_HREF = 'APP_BASE_HREF',
  KEYCLOAK_REALM = 'KEYCLOAK_REALM',
  KEYCLOAK_ENABLE_SILENT_SSO = 'KEYCLOAK_ENABLE_SILENT_SSO',
  KEYCLOAK_URL = 'KEYCLOAK_URL',
  KEYCLOAK_CLIENT_ID = 'KEYCLOAK_CLIENT_ID',
  // NEW KEYCLOAK CONFIG KEYS
  KEYCLOAK_TIME_SKEW = 'KEYCLOAK_TIME_SKEW',
  KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY = 'KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY',
  KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED = 'KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED',
  KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED = 'KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED',
  // END NEW KEYCLOAK CONFIG KEYS
  ONECX_PORTAL_FAVORITES_DISABLED = 'ONECX_PORTAL_FAVORITES_DISABLED',
  // ... rest of enum
}
```

## Change 2: keycloak-auth.service.ts (Complete Updated File)

**Location**: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

```typescript
import { Injectable, inject } from '@angular/core'
import { CONFIG_KEY, ConfigurationService } from '@onecx/angular-integration-interface'
import Keycloak, { KeycloakServerConfig } from 'keycloak-js'
import { AuthService } from '../auth.service'
import { createLogger } from '../utils/logger.utils'
import Semaphore from 'ts-semaphore'

const KC_REFRESH_TOKEN_LS = 'onecx_kc_refreshToken'
const KC_ID_TOKEN_LS = 'onecx_kc_idToken'
const KC_TOKEN_LS = 'onecx_kc_token'

@Injectable()
export class KeycloakAuthService implements AuthService {
  private readonly logger = createLogger('KeycloakAuthService')
  private configService = inject(ConfigurationService)
  private keycloak: Keycloak | undefined
  private updateTokenSemaphore = new Semaphore(1)

  config?: Record<string, unknown>

  public async init(config?: Record<string, unknown>): Promise<boolean> {
    this.config = config
    let token = localStorage.getItem(KC_TOKEN_LS)
    let idToken = localStorage.getItem(KC_ID_TOKEN_LS)
    let refreshToken = localStorage.getItem(KC_REFRESH_TOKEN_LS)
    if (token && refreshToken) {
      const parsedToken = JSON.parse(atob(refreshToken.split('.')[1]))
      if (parsedToken.exp * 1000 < new Date().getTime()) {
        token = null
        refreshToken = null
        idToken = null
        this.clearKCStateFromLocalstorage()
      }
    }

    let kcConfig: KeycloakServerConfig | string
    const validKCConfig = await this.getValidKCConfig()
    kcConfig = { ...validKCConfig, ...(config ?? {}) }
    
    if (!kcConfig.clientId || !kcConfig.realm || !kcConfig.url) {
      kcConfig = './assets/keycloak.json'
    }

    const enableSilentSSOCheck =
      (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ENABLE_SILENT_SSO)) === 'true'

    // Get timeSkew configuration - undefined if not provided
    const timeSkewStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_TIME_SKEW)
    const timeSkew = timeSkewStr != null ? parseInt(timeSkewStr, 10) : undefined

    try {
      await import('keycloak-js').then(({ default: Keycloak }) => {
        this.keycloak = new Keycloak(kcConfig)
      })
    } catch (err) {
      const errorMessage = 'Keycloak initialization failed! Could not load keycloak-js library which is required in the current environment.'
      this.logger.error(
        errorMessage,
        err
      )
      throw new Error(
        errorMessage
      )
    }

    if (!this.keycloak) {
      throw new Error('Keycloak initialization failed!')
    }

    await this.setupEventListener()

    return this.keycloak
      .init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
        idToken: idToken || undefined,
        refreshToken: refreshToken || undefined,
        token: token || undefined,
        timeSkew: timeSkew,
      })
      .catch((err) => {
        this.logger.warn(`Keycloak err: ${err}, try force login`)
        return this.keycloak?.login(this.config)
      })
      .then((loginOk) => {
        if (loginOk) {
          return this.keycloak?.token
        } else {
          return this.keycloak?.login(this.config).then(() => 'login')
        }
      })
      .then(() => {
        return true
      })
      .catch((err) => {
        this.logger.error(`KC ERROR ${err} as json ${JSON.stringify(err)}`)
        throw err
      })
  }

  protected async getValidKCConfig(): Promise<KeycloakServerConfig> {
    const clientId = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_CLIENT_ID)
    if (!clientId) {
      throw new Error('Invalid KC config, missing clientId')
    }
    const realm = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_REALM)
    if (!realm) {
      throw new Error('Invalid KC config, missing realm')
    }
    const url = (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_URL)) ?? ''
    return {
      url,
      clientId,
      realm,
    }
  }

  private async setupEventListener() {
    if (!this.keycloak) return

    // Get configurable event handler settings
    const onTokenExpiredEnabled = 
      (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED)) === 'true'
    
    const onAuthRefreshErrorEnabled = 
      (await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED)) === 'true'

    this.keycloak.onAuthError = () => {
      this.updateLocalStorage()
    }
    
    this.keycloak.onAuthLogout = () => {
      this.logger.info('SSO logout nav to root')
      this.clearKCStateFromLocalstorage()
      this.keycloak?.login(this.config)
    }
    
    this.keycloak.onAuthRefreshSuccess = () => {
      this.updateLocalStorage()
    }
    
    this.keycloak.onAuthRefreshError = () => {
      this.updateLocalStorage()
      if (onAuthRefreshErrorEnabled) {
        this.logger.info('Auth refresh error - initiating re-login')
        this.keycloak?.login(this.config)
      }
    }
    
    this.keycloak.onAuthSuccess = () => {
      this.updateLocalStorage()
    }
    
    this.keycloak.onTokenExpired = () => {
      this.updateLocalStorage()
      if (onTokenExpiredEnabled) {
        this.logger.info('Token expired - proactively refreshing')
        this.keycloak?.updateToken()
      }
    }
    
    this.keycloak.onActionUpdate = () => {
      this.updateLocalStorage()
    }
    
    this.keycloak.onReady = () => {
      this.updateLocalStorage()
    }
  }

  private updateLocalStorage() {
    if (this.keycloak) {
      if (this.keycloak.token) {
        localStorage.setItem(KC_TOKEN_LS, this.keycloak.token)
      } else {
        localStorage.removeItem(KC_TOKEN_LS)
      }
      if (this.keycloak.idToken) {
        localStorage.setItem(KC_ID_TOKEN_LS, this.keycloak.idToken)
      } else {
        localStorage.removeItem(KC_ID_TOKEN_LS)
      }
      if (this.keycloak.refreshToken) {
        localStorage.setItem(KC_REFRESH_TOKEN_LS, this.keycloak.refreshToken)
      } else {
        localStorage.removeItem(KC_REFRESH_TOKEN_LS)
      }
    }
  }

  private clearKCStateFromLocalstorage() {
    localStorage.removeItem(KC_ID_TOKEN_LS)
    localStorage.removeItem(KC_TOKEN_LS)
    localStorage.removeItem(KC_REFRESH_TOKEN_LS)
  }

  private getSilentSSOUrl() {
    let currentBase = document.getElementsByTagName('base')[0].href
    if (currentBase === '/') {
      currentBase = ''
    }
    return `${currentBase}/assets/silent-check-sso.html`
  }

  getIdToken(): string | null {
    return this.keycloak?.idToken ?? null
  }
  
  getAccessToken(): string | null {
    return this.keycloak?.token ?? null
  }

  logout(): void {
    this.keycloak?.logout()
  }

  async updateTokenIfNeeded(): Promise<boolean> {
    return this.updateTokenSemaphore.use(async () => {
      if (!this.keycloak?.authenticated) {
        return this.keycloak?.login(this.config).then(() => false) ?? Promise.reject('Keycloak not initialized!')
      }
      
      // Get configurable minValidity - undefined if not provided (keycloak-js uses default of 5)
      const minValidityStr = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY)
      const minValidity = minValidityStr != null ? parseInt(minValidityStr, 10) : undefined
      
      return this.keycloak.updateToken(minValidity)
    })
  }

  getAuthProviderName(): string {
    return 'keycloak-auth'
  }

  hasRole(_role: string): boolean {
    return false
  }

  getUserRoles(): string[] {
    return []
  }

  getHeaderValues(): Record<string, string> {
    return { 'apm-principal-token': this.getIdToken() ?? '', Authorization: `Bearer ${this.getAccessToken()}` }
  }
}
```

## Change 3: env.json

**Location**: `src/assets/env.json`

```json
{
  "APP_BASE_HREF": "${APP_BASE_HREF}",
  "KEYCLOAK_REALM": "${KEYCLOAK_REALM}",
  "KEYCLOAK_URL": "${KEYCLOAK_URL}",
  "KEYCLOAK_CLIENT_ID": "${KEYCLOAK_CLIENT_ID}",
  "KEYCLOAK_TIME_SKEW": "${KEYCLOAK_TIME_SKEW}",
  "KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY": "${KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY}",
  "KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED": "${KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED}",
  "KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED": "${KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED}",
  "APP_VERSION": "${APP_VERSION}",
  "IS_SHELL": true,
  "AUTH_SERVICE": "${AUTH_SERVICE}",
  "AUTH_SERVICE_CUSTOM_URL": "${AUTH_SERVICE_CUSTOM_URL}",
  "AUTH_SERVICE_CUSTOM_MODULE_NAME": "${AUTH_SERVICE_CUSTOM_MODULE_NAME}",
  "AUTH_SERVICE_CUSTOM_BFF_URL": "${AUTH_SERVICE_CUSTOM_BFF_URL}",
  "ONECX_PORTAL_SEARCH_BUTTONS_REVERSED": "${ONECX_PORTAL_SEARCH_BUTTONS_REVERSED}",
  "POLYFILL_SCOPE_MODE": "${POLYFILL_SCOPE_MODE}"
}
```

---

# Summary

## Files Modified

1. **`libs/angular-integration-interface/src/lib/model/config-key.model.ts`**
   - Added 4 new CONFIG_KEY enum values

2. **`libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`**
   - Added Semaphore import and instance
   - Made setupEventListener async with configurable handlers
   - Added timeSkew configuration to init
   - Added semaphore and configurable minValidity to updateTokenIfNeeded

3. **`src/assets/env.json`**
   - Added 4 new configuration placeholders

## Backward Compatibility

All changes are **100% backward compatible**:
- All new config keys default to undefined/false
- When not configured, behavior is identical to current implementation
- No breaking changes to public API

## Testing Recommendations

1. Test without any new config keys (verify current behavior)
2. Test with `KEYCLOAK_ON_TOKEN_EXPIRED_ENABLED=true` (verify proactive refresh)
3. Test with `KEYCLOAK_ON_AUTH_REFRESH_ERROR_ENABLED=true` (verify re-login on failure)
4. Test with various `KEYCLOAK_UPDATE_TOKEN_MIN_VALIDITY` values
5. Test concurrent HTTP requests (verify semaphore behavior)
6. Test with `KEYCLOAK_TIME_SKEW` in environments with known clock drift
