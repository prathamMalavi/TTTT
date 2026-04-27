# Task: Improve Keycloak Service Configuration

## Technical Implementation Guide

---

## Document Information

| Property | Value |
|----------|-------|
| **Task Title** | Improve Keycloak Service Config |
| **Version** | 1.0.0 |
| **Created** | April 22, 2026 |
| **Target Audience** | Developers implementing the feature |
| **Related Files** | keycloak-auth.service.ts, config-key.model.ts |

---

## Table of Contents

1. [Task Overview](#1-task-overview)
2. [Current State Analysis](#2-current-state-analysis)
3. [Requirements Breakdown](#3-requirements-breakdown)
4. [Implementation Details](#4-implementation-details)
5. [Testing Strategy](#5-testing-strategy)
6. [Migration and Deployment](#6-migration-and-deployment)
7. [Potential Challenges](#7-potential-challenges)
8. [Expected Outcomes](#8-expected-outcomes)
9. [Questions for Stakeholders](#9-questions-for-stakeholders)

---

# 1. Task Overview

## 1.1 Task Description

```
Title: Improve keycloak service config
Description:
- onTokenExpired + onAuthRefreshError + timeSkew -> config
- mutex for updateToken
- make updateToken parameter configurable
- Reach out to Jan
```

## 1.2 What This Task Means

### In Non-Technical Terms

The OneCX application uses Keycloak (an identity management system) to handle user logins. Currently, some important settings are hardcoded (fixed in the code), which means we can't easily adjust them when deploying to different environments.

This task is about making these settings configurable so that:
- Different environments (dev, staging, production) can have different timeout behaviors
- System administrators can tune authentication behavior without code changes
- Error handling can be customized based on organization needs

### In Technical Terms

We need to:
1. **Make event handlers configurable**: `onTokenExpired` and `onAuthRefreshError` callback behaviors
2. **Add timeSkew configuration**: Allow manual override of client-server time difference
3. **Implement application-level mutex**: Prevent redundant token refresh calls
4. **Make minValidity configurable**: Customize when tokens should be refreshed

## 1.3 Why This Task Is Important

### Business Reasons

| Reason | Impact |
|--------|--------|
| **Operational Flexibility** | Admins can adjust auth behavior without deployments |
| **Reduced Downtime** | Better error handling means fewer session interruptions |
| **Environment Customization** | Different settings for different use cases |
| **Better User Experience** | Proactive token refresh prevents mid-action failures |

### Technical Reasons

| Reason | Impact |
|--------|--------|
| **Reduced Race Conditions** | Mutex prevents duplicate refresh attempts |
| **Clock Drift Handling** | timeSkew config handles server/client time differences |
| **Error Recovery** | Configurable retry logic for network issues |
| **Performance** | Less redundant network calls |

## 1.4 Expected Outcomes

After this task:
1. System administrators can configure auth behavior via environment variables
2. Token refresh is more efficient (fewer redundant calls)
3. Better handling of token expiration scenarios
4. Clear retry mechanisms for refresh failures
5. Support for environments with clock synchronization issues

---

# 2. Current State Analysis

## 2.1 Current updateTokenIfNeeded Implementation

**File**: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

```typescript
// CURRENT CODE
async updateTokenIfNeeded(): Promise<boolean> {
  if (!this.keycloak?.authenticated) {
    return this.keycloak?.login(this.config).then(() => false) 
      ?? Promise.reject('Keycloak not initialized!')
  } else {
    return this.keycloak.updateToken()  // ❌ No minValidity parameter!
  }
}
```

### Problems with Current Implementation

| Problem | Impact | Example Scenario |
|---------|--------|------------------|
| No `minValidity` parameter | Uses default 5 seconds | Token expires in 6 seconds, not refreshed, next request fails |
| No application mutex | Multiple concurrent refresh attempts | 10 rapid API calls = 10 updateToken calls |
| Not configurable | Can't adjust per environment | High-latency network needs longer threshold |

### Why? - Business/Technical Reasons

The current implementation was simple and worked for basic cases, but doesn't handle:
- High-latency networks (need earlier refresh)
- Environments with clock drift
- Recovery from transient network failures

### What? - What it does currently

```
HTTP Request → TokenInterceptor → updateTokenIfNeeded() → keycloak.updateToken()
                                                                    └→ Default 5 second minValidity
                                                                    └→ No application-level deduplication
```

### How? - Current Flow

1. HTTP request is made
2. TokenInterceptor calls `updateTokenIfNeeded()`
3. Check if keycloak is authenticated
4. If yes, call `keycloak.updateToken()` with no parameters
5. keycloak-js checks if token expires in < 5 seconds
6. If yes, refresh; if no, return immediately

### When? - Current Behavior Scenarios

| Scenario | Token Expiry | Action |
|----------|--------------|--------|
| Token valid for 30 seconds | 30s > 5s | No refresh, return immediately |
| Token valid for 3 seconds | 3s < 5s | Refresh triggered |
| Token already expired | 0s < 5s | Refresh triggered (but might fail) |

## 2.2 Current Event Handler Implementation

```typescript
// CURRENT CODE
private setupEventListener() {
  if (this.keycloak) {
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
      this.updateLocalStorage()  // ❌ No error recovery!
    }
    this.keycloak.onAuthSuccess = () => {
      this.updateLocalStorage()
    }
    this.keycloak.onTokenExpired = () => {
      this.updateLocalStorage()  // ❌ No proactive refresh!
    }
    this.keycloak.onActionUpdate = () => {
      this.updateLocalStorage()
    }
    this.keycloak.onReady = () => {
      this.updateLocalStorage()
    }
  }
}
```

### Problems with Current Event Handlers

| Event | Current Behavior | Problem |
|-------|-----------------|---------|
| `onTokenExpired` | Only updates localStorage | No proactive refresh, waits for next HTTP call |
| `onAuthRefreshError` | Only updates localStorage | No retry, no fallback, user may get stuck |

### Impact

```
Scenario: Token expires while user is reading (no API calls)

Current behavior:
  T+0: Token expires
  T+0: onTokenExpired fires → localStorage updated
  T+5min: User clicks button
  T+5min: API call made
  T+5min: updateToken() called
  T+5min: Refresh token might also be expired now!
  T+5min: User gets logged out unexpectedly

Desired behavior:
  T+0: Token expires
  T+0: onTokenExpired fires → Proactive refresh triggered
  T+0: New access token obtained
  T+5min: User clicks button
  T+5min: API call made with valid token (already refreshed)
```

## 2.3 Current Keycloak Init Configuration

```typescript
// CURRENT CODE
return this.keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
  idToken: idToken || undefined,
  refreshToken: refreshToken || undefined,
  token: token || undefined,
  // ❌ No timeSkew configuration!
})
```

### Why timeSkew Matters

```javascript
// How keycloak-js determines if token is expired
kc.isTokenExpired = function(minValidity) {
  var expiresIn = kc.tokenParsed['exp'] - Math.ceil(Date.now() / 1000) + kc.timeSkew;
                  └── Server time ──┘   └── Client time ───────────────┘  └── Adjustment ─┘
  
  return expiresIn < minValidity;
};
```

If client clock is ahead of server:
```
Server says: token expires at 13:00:00
Server time: 12:55:00 (5 minutes left)
Client time: 13:00:00 (clock is 5 minutes fast)
Without timeSkew: Client thinks token expired!
With timeSkew = -300: Client correctly calculates 5 minutes left
```

## 2.4 keycloak-js Built-in Mutex (refreshQueue)

keycloak-js already has a queue-based mutex for refresh calls:

```javascript
// Inside keycloak-js updateToken()
refreshQueue.push(promise);

if (refreshQueue.length == 1) {
  // Only first caller makes the actual HTTP request
  var req = new XMLHttpRequest();
  // ... make request ...
  
  req.onreadystatechange = function() {
    if (req.status == 200) {
      // Resolve ALL queued promises
      for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
        p.setSuccess(true);
      }
    }
  };
}
```

### Why We Still Need Application-Level Mutex

While keycloak-js handles concurrent calls, the application still:
1. Makes N function calls for N concurrent requests
2. Each call does authentication check
3. More overhead than necessary

**Application-level benefit:**
```
Without app mutex: 10 requests → 10 updateTokenIfNeeded() calls → 10 keycloak.updateToken() calls → 1 HTTP refresh
With app mutex:    10 requests → 10 updateTokenIfNeeded() calls → 1  keycloak.updateToken() call  → 1 HTTP refresh
```

---

# 3. Requirements Breakdown

## 3.1 Requirement 1: Make Event Handlers Configurable

### What Needs to Be Done

Create configuration options for:
1. What action to take when `onTokenExpired` fires
2. What action to take when `onAuthRefreshError` fires

### New Configuration Keys

```typescript
// config-key.model.ts additions
export enum CONFIG_KEY {
  // Existing keys...
  
  // New keys for this task
  KC_ON_TOKEN_EXPIRED_ACTION = 'KC_ON_TOKEN_EXPIRED_ACTION',
  KC_ON_AUTH_REFRESH_ERROR_ACTION = 'KC_ON_AUTH_REFRESH_ERROR_ACTION',
}
```

### Configuration Values

**KC_ON_TOKEN_EXPIRED_ACTION:**
| Value | Behavior |
|-------|----------|
| `"refresh"` | Proactively call `updateToken(-1)` to force refresh |
| `"logout"` | Clear tokens and redirect to login |
| `"ignore"` | Do nothing (current behavior), rely on interceptor |

**KC_ON_AUTH_REFRESH_ERROR_ACTION:**
| Value | Behavior |
|-------|----------|
| `"retry"` | Retry refresh up to max attempts, then re-login |
| `"logout"` | Immediately clear tokens and redirect to login |
| `"ignore"` | Do nothing (current behavior), may leave user stuck |

### Implementation Pattern

```typescript
/**
 * Why?
 * - Different environments need different error handling
 * - Development: might prefer "ignore" for debugging
 * - Production: might prefer "retry" for resilience
 * 
 * What?
 * - Reads configuration to determine action
 * - Executes appropriate handler based on config
 * 
 * How?
 * 1. Load config value on service init
 * 2. In event handler, switch on config value
 * 3. Execute appropriate action
 * 
 * When?
 * - onTokenExpired: When access token TTL reaches 0
 * - onAuthRefreshError: When refresh HTTP call fails
 */
private async setupEventListener() {
  const tokenExpiredAction = await this.configService.getProperty(
    CONFIG_KEY.KC_ON_TOKEN_EXPIRED_ACTION
  ) ?? 'refresh';
  
  const refreshErrorAction = await this.configService.getProperty(
    CONFIG_KEY.KC_ON_AUTH_REFRESH_ERROR_ACTION
  ) ?? 'retry';

  this.keycloak.onTokenExpired = () => {
    this.updateLocalStorage();
    this.handleTokenExpired(tokenExpiredAction);
  };
  
  this.keycloak.onAuthRefreshError = () => {
    this.updateLocalStorage();
    this.handleAuthRefreshError(refreshErrorAction);
  };
}

private handleTokenExpired(action: string) {
  switch (action) {
    case 'refresh':
      this.logger.info('Token expired, proactively refreshing');
      this.keycloak?.updateToken(-1);
      break;
    case 'logout':
      this.logger.info('Token expired, logging out');
      this.clearKCStateFromLocalstorage();
      this.keycloak?.logout();
      break;
    case 'ignore':
    default:
      this.logger.info('Token expired, waiting for next request');
      break;
  }
}
```

## 3.2 Requirement 2: timeSkew Configuration

### What Needs to Be Done

Allow administrators to set a manual timeSkew value when initializing Keycloak.

### New Configuration Key

```typescript
export enum CONFIG_KEY {
  // ...
  KC_TIME_SKEW = 'KC_TIME_SKEW',
}
```

### Implementation

```typescript
/**
 * Why?
 * - Environments with known clock drift
 * - Testing scenarios
 * - Edge cases where auto-calculation fails
 * 
 * What?
 * - Pass timeSkew to Keycloak init options
 * - Overrides the auto-calculated value
 * 
 * How?
 * 1. Read KC_TIME_SKEW from config
 * 2. Parse as integer (seconds)
 * 3. Pass to init options if valid
 * 
 * When?
 * - During Keycloak initialization
 * - Affects all subsequent token expiry calculations
 */
public async init(config?: Record<string, unknown>): Promise<boolean> {
  // ... existing code ...
  
  const timeSkewConfig = await this.configService.getProperty(CONFIG_KEY.KC_TIME_SKEW);
  let timeSkew: number | undefined;
  
  if (timeSkewConfig) {
    const parsed = parseInt(timeSkewConfig, 10);
    if (!isNaN(parsed)) {
      timeSkew = parsed;
      this.logger.info(`Using configured timeSkew: ${timeSkew} seconds`);
    } else {
      this.logger.warn(`Invalid timeSkew value: ${timeSkewConfig}, using auto-calculation`);
    }
  }
  
  return this.keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: /* ... */,
    token: token || undefined,
    refreshToken: refreshToken || undefined,
    idToken: idToken || undefined,
    timeSkew: timeSkew,  // NEW
  });
}
```

### Usage Scenarios

| Scenario | Configuration | Effect |
|----------|---------------|--------|
| Auto-calculation (default) | Not set or empty | keycloak-js calculates from server response |
| Server 30 seconds ahead | `"30"` | Token expiry adjusted +30 seconds |
| Server 30 seconds behind | `"-30"` | Token expiry adjusted -30 seconds |
| Testing expired token | `"-3600"` | All tokens appear expired |

## 3.3 Requirement 3: Application-Level Mutex for updateToken

### What Needs to Be Done

Implement a mutex pattern to prevent redundant calls to Keycloak's updateToken.

### Implementation Pattern

```typescript
/**
 * Why?
 * - Multiple concurrent HTTP requests all call updateTokenIfNeeded
 * - Without mutex, N requests trigger N function executions
 * - keycloak-js handles the HTTP deduplication, but we can optimize earlier
 * 
 * What?
 * - Store pending promise in class property
 * - New calls reuse existing promise
 * - Clear promise when resolved/rejected
 * 
 * How?
 * 1. Check if refresh promise already exists
 * 2. If yes, return existing promise
 * 3. If no, create new promise and store it
 * 4. Clear stored promise when complete
 * 
 * When?
 * - Every call to updateTokenIfNeeded
 * - Particularly important during batched API calls
 */

// Class property
private updateTokenPromise: Promise<boolean> | null = null;

async updateTokenIfNeeded(): Promise<boolean> {
  // 1. Check for existing promise (mutex pattern)
  if (this.updateTokenPromise) {
    this.logger.debug('Token refresh already in progress, joining existing promise');
    return this.updateTokenPromise;
  }

  // 2. Check authentication
  if (!this.keycloak?.authenticated) {
    this.logger.info('Not authenticated, redirecting to login');
    return this.keycloak?.login(this.config).then(() => false) 
      ?? Promise.reject('Keycloak not initialized!');
  }

  // 3. Read configured minValidity
  const minValidity = await this.getMinValidity();

  // 4. Create and store promise
  this.updateTokenPromise = this.keycloak
    .updateToken(minValidity)
    .finally(() => {
      // 5. Clear promise when done
      this.updateTokenPromise = null;
    });

  return this.updateTokenPromise;
}

private async getMinValidity(): Promise<number> {
  const configValue = await this.configService.getProperty(
    CONFIG_KEY.KC_UPDATE_TOKEN_MIN_VALIDITY
  );
  
  if (configValue) {
    const parsed = parseInt(configValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  
  return 5; // Default
}
```

### Mutex Behavior Visualization

```
Time →
─────────────────────────────────────────────────────────────────────

Request 1 arrives
  └→ updateTokenIfNeeded()
     └→ this.updateTokenPromise = null (no existing)
     └→ Create new promise
     └→ this.updateTokenPromise = Promise<pending>
     └→ Call keycloak.updateToken(minValidity)
     
Request 2 arrives (while Request 1 in progress)
  └→ updateTokenIfNeeded()
     └→ this.updateTokenPromise = Promise<pending> (exists!)
     └→ Return existing promise (no new keycloak call)
     
Request 3 arrives (while Request 1 in progress)
  └→ updateTokenIfNeeded()
     └→ Return existing promise (no new keycloak call)
     
Keycloak refresh completes
  └→ All three promises resolve with same value
  └→ this.updateTokenPromise = null
  
Request 4 arrives (after completion)
  └→ updateTokenIfNeeded()
     └→ this.updateTokenPromise = null (no existing)
     └→ Start fresh request...
```

## 3.4 Requirement 4: Make minValidity Configurable

### What Needs to Be Done

Allow administrators to configure the `minValidity` parameter for `updateToken()`.

### New Configuration Key

```typescript
export enum CONFIG_KEY {
  // ...
  KC_UPDATE_TOKEN_MIN_VALIDITY = 'KC_UPDATE_TOKEN_MIN_VALIDITY',
}
```

### Default Value Reasoning

| Environment | Suggested Value | Reasoning |
|-------------|----------------|-----------|
| Default | `5` | keycloak-js default, works for most cases |
| High-latency | `30` | Refresh 30 seconds early to account for slow networks |
| Low-latency internal | `5` | Default is sufficient |
| Batch processing | `60` | Long-running operations need buffer |

### Implementation

```typescript
/**
 * Why?
 * - Different environments have different network characteristics
 * - High-latency networks need earlier refresh
 * - Batch operations need larger buffer
 * 
 * What?
 * - Read minValidity from configuration
 * - Pass to keycloak.updateToken()
 * 
 * How?
 * 1. Read config on each call (allows dynamic updates)
 * 2. Parse and validate
 * 3. Use default if invalid
 * 
 * When?
 * - Every updateTokenIfNeeded() call
 */
async updateTokenIfNeeded(): Promise<boolean> {
  // ... mutex check ...
  
  const minValidity = await this.getMinValidity();
  
  this.logger.debug(`Checking token with minValidity: ${minValidity} seconds`);
  
  this.updateTokenPromise = this.keycloak
    .updateToken(minValidity)
    .then(refreshed => {
      if (refreshed) {
        this.logger.info('Token was refreshed');
      } else {
        this.logger.debug('Token still valid, no refresh needed');
      }
      return refreshed;
    });
    
  return this.updateTokenPromise;
}
```

## 3.5 Additional Configuration: Retry Settings

For `onAuthRefreshError` retry behavior, we should also add:

```typescript
export enum CONFIG_KEY {
  // ...
  KC_REFRESH_RETRY_COUNT = 'KC_REFRESH_RETRY_COUNT',
  KC_REFRESH_RETRY_DELAY = 'KC_REFRESH_RETRY_DELAY',
}
```

### Implementation

```typescript
// Class properties
private retryCount = 0;
private maxRetries = 3;      // Default
private retryDelay = 1000;   // Default 1 second

async init(): Promise<boolean> {
  // Load retry configuration
  const maxRetriesConfig = await this.configService.getProperty(
    CONFIG_KEY.KC_REFRESH_RETRY_COUNT
  );
  if (maxRetriesConfig) {
    const parsed = parseInt(maxRetriesConfig, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      this.maxRetries = parsed;
    }
  }
  
  const retryDelayConfig = await this.configService.getProperty(
    CONFIG_KEY.KC_REFRESH_RETRY_DELAY
  );
  if (retryDelayConfig) {
    const parsed = parseInt(retryDelayConfig, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      this.retryDelay = parsed;
    }
  }
  
  // ... rest of init ...
}

private handleAuthRefreshError(action: string) {
  switch (action) {
    case 'retry':
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.logger.warn(
          `Token refresh failed, retry ${this.retryCount}/${this.maxRetries} ` +
          `in ${this.retryDelay}ms`
        );
        setTimeout(() => {
          this.keycloak?.updateToken(-1)
            .then(() => {
              this.retryCount = 0; // Reset on success
            })
            .catch(() => {
              this.handleAuthRefreshError(action); // Recursive retry
            });
        }, this.retryDelay);
      } else {
        this.logger.error('Max retry attempts reached, redirecting to login');
        this.retryCount = 0;
        this.clearKCStateFromLocalstorage();
        this.keycloak?.login(this.config);
      }
      break;
      
    case 'logout':
      this.logger.info('Token refresh failed, logging out');
      this.clearKCStateFromLocalstorage();
      this.keycloak?.logout();
      break;
      
    case 'ignore':
    default:
      this.logger.warn('Token refresh failed, ignoring');
      break;
  }
}
```

---

# 4. Implementation Details

## 4.1 Complete config-key.model.ts Changes

```typescript
// libs/angular-integration-interface/src/lib/model/config-key.model.ts

export enum CONFIG_KEY {
  // Existing keys...
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
  ONECX_PORTAL_FAVORITES_DISABLED = 'ONECX_PORTAL_FAVORITES_DISABLED',
  ONECX_PORTAL_FEEDBACK_DISABLED = 'ONECX_PORTAL_FEEDBACK_DISABLED',
  ONECX_PORTAL_SEARCH_DISABLED = 'ONECX_PORTAL_SEARCH_DISABLED',
  ONECX_PORTAL_SUPPORT_TICKET_DISABLED = 'ONECX_PORTAL_SUPPORT_TICKET_DISABLED',
  ONECX_PORTAL_ANNOUNCEMENTS_DISABLED = 'ONECX_PORTAL_ANNOUNCEMENTS_DISABLED',
  ONECX_PORTAL_PASSWORD_CHANGE_DISABLED = 'ONECX_PORTAL_PASSWORD_CHANGE_DISABLED',
  ONECX_PORTAL_SETTINGS_DISABLED = 'ONECX_PORTAL_SETTINGS_DISABLED',
  ONECX_PORTAL_MY_ROLES_PERMISSIONS_DISABLED = 'ONECX_PORTAL_MY_ROLES_PERMISSIONS_DISABLED',
  ONECX_PORTAL_HELP_DISABLED = 'ONECX_PORTAL_HELP_DISABLED',
  ONECX_PORTAL_SEARCH_BUTTONS_REVERSED = 'ONECX_PORTAL_SEARCH_BUTTONS_REVERSED',
  APP_VERSION = 'APP_VERSION',
  IS_SHELL = 'IS_SHELL',
  AUTH_SERVICE = 'AUTH_SERVICE',
  AUTH_SERVICE_CUSTOM_URL = 'AUTH_SERVICE_CUSTOM_URL',
  AUTH_SERVICE_CUSTOM_MODULE_NAME = 'AUTH_SERVICE_CUSTOM_MODULE_NAME',
  POLYFILL_SCOPE_MODE = 'POLYFILL_SCOPE_MODE',
  KEYBOARD_FOCUSABLE_SELECTOR = 'KEYBOARD_FOCUSABLE_SELECTOR',
  
  // NEW KEYS FOR THIS TASK
  /**
   * Manual override for the time skew between client and Keycloak server.
   * Value in seconds. Positive if server is ahead, negative if behind.
   * If not set, keycloak-js will calculate automatically.
   * Example: "30" means server is 30 seconds ahead of client.
   */
  KC_TIME_SKEW = 'KC_TIME_SKEW',
  
  /**
   * Minimum validity (in seconds) for token refresh check.
   * If token expires within this time, it will be refreshed.
   * Default: 5 seconds.
   * Higher values = earlier refresh, more network calls.
   * Example: "30" means refresh 30 seconds before expiry.
   */
  KC_UPDATE_TOKEN_MIN_VALIDITY = 'KC_UPDATE_TOKEN_MIN_VALIDITY',
  
  /**
   * Action to take when access token expires.
   * Values: "refresh" | "logout" | "ignore"
   * - "refresh": Proactively refresh the token
   * - "logout": Clear session and redirect to login
   * - "ignore": Do nothing, wait for next HTTP request
   * Default: "refresh"
   */
  KC_ON_TOKEN_EXPIRED_ACTION = 'KC_ON_TOKEN_EXPIRED_ACTION',
  
  /**
   * Action to take when token refresh fails.
   * Values: "retry" | "logout" | "ignore"
   * - "retry": Retry refresh up to KC_REFRESH_RETRY_COUNT times
   * - "logout": Clear session and redirect to login
   * - "ignore": Do nothing (user may get stuck)
   * Default: "retry"
   */
  KC_ON_AUTH_REFRESH_ERROR_ACTION = 'KC_ON_AUTH_REFRESH_ERROR_ACTION',
  
  /**
   * Number of retry attempts for failed token refresh.
   * Only used when KC_ON_AUTH_REFRESH_ERROR_ACTION = "retry"
   * Default: 3
   */
  KC_REFRESH_RETRY_COUNT = 'KC_REFRESH_RETRY_COUNT',
  
  /**
   * Delay between refresh retry attempts in milliseconds.
   * Only used when KC_ON_AUTH_REFRESH_ERROR_ACTION = "retry"
   * Default: 1000 (1 second)
   */
  KC_REFRESH_RETRY_DELAY = 'KC_REFRESH_RETRY_DELAY',
}
```

## 4.2 Complete keycloak-auth.service.ts Changes

```typescript
// libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts

import { Injectable, inject } from '@angular/core'
import { CONFIG_KEY, ConfigurationService } from '@onecx/angular-integration-interface'
import Keycloak, { KeycloakServerConfig } from 'keycloak-js'
import { AuthService } from '../auth.service'
import { createLogger } from '../utils/logger.utils'

const KC_REFRESH_TOKEN_LS = 'onecx_kc_refreshToken'
const KC_ID_TOKEN_LS = 'onecx_kc_idToken'
const KC_TOKEN_LS = 'onecx_kc_token'

// Default values
const DEFAULT_MIN_VALIDITY = 5
const DEFAULT_RETRY_COUNT = 3
const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_TOKEN_EXPIRED_ACTION = 'refresh'
const DEFAULT_REFRESH_ERROR_ACTION = 'retry'

@Injectable()
export class KeycloakAuthService implements AuthService {
  private readonly logger = createLogger('KeycloakAuthService')
  private configService = inject(ConfigurationService)
  private keycloak: Keycloak | undefined
  
  config?: Record<string, unknown>
  
  // *** NEW PROPERTIES FOR THIS TASK ***
  
  /** Application-level mutex for token refresh */
  private updateTokenPromise: Promise<boolean> | null = null
  
  /** Current retry count for refresh errors */
  private retryCount = 0
  
  /** Configuration-loaded values */
  private tokenExpiredAction = DEFAULT_TOKEN_EXPIRED_ACTION
  private refreshErrorAction = DEFAULT_REFRESH_ERROR_ACTION
  private maxRetries = DEFAULT_RETRY_COUNT
  private retryDelay = DEFAULT_RETRY_DELAY
  private minValidity = DEFAULT_MIN_VALIDITY

  public async init(config?: Record<string, unknown>): Promise<boolean> {
    this.config = config
    
    // *** LOAD NEW CONFIGURATION VALUES ***
    await this.loadConfiguration()
    
    let token = localStorage.getItem(KC_TOKEN_LS)
    let idToken = localStorage.getItem(KC_ID_TOKEN_LS)
    let refreshToken = localStorage.getItem(KC_REFRESH_TOKEN_LS)
    
    if (token && refreshToken) {
      const parsedToken = JSON.parse(atob(refreshToken.split('.')[1]))
      if (parsedToken.exp * 1000 < new Date().getTime()) {
        this.logger.info('Stored refresh token expired, clearing state')
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

    // *** NEW: Load timeSkew configuration ***
    const timeSkew = await this.getTimeSkewConfig()

    try {
      await import('keycloak-js').then(({ default: Keycloak }) => {
        this.keycloak = new Keycloak(kcConfig)
      })
    } catch (err) {
      const errorMessage = 'Keycloak initialization failed! Could not load keycloak-js library.'
      this.logger.error(errorMessage, err)
      throw new Error(errorMessage)
    }

    if (!this.keycloak) {
      throw new Error('Keycloak initialization failed!')
    }

    // *** ENHANCED: Setup event listeners with configurable handlers ***
    this.setupEventListener()

    return this.keycloak
      .init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
        idToken: idToken || undefined,
        refreshToken: refreshToken || undefined,
        token: token || undefined,
        timeSkew: timeSkew,  // *** NEW: Pass timeSkew ***
      })
      .catch((err) => {
        this.logger.warn(`Keycloak init failed: ${err}, attempting login`)
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
        this.logger.info('Keycloak initialization successful')
        return true
      })
      .catch((err) => {
        this.logger.error(`Keycloak error: ${JSON.stringify(err)}`)
        throw err
      })
  }

  /**
   * Load all configuration values for this service.
   * Called once during init.
   */
  private async loadConfiguration(): Promise<void> {
    // Token expired action
    const tokenExpiredConfig = await this.configService.getProperty(
      CONFIG_KEY.KC_ON_TOKEN_EXPIRED_ACTION
    )
    if (tokenExpiredConfig && ['refresh', 'logout', 'ignore'].includes(tokenExpiredConfig)) {
      this.tokenExpiredAction = tokenExpiredConfig
    }
    this.logger.debug(`Config: tokenExpiredAction = ${this.tokenExpiredAction}`)

    // Refresh error action
    const refreshErrorConfig = await this.configService.getProperty(
      CONFIG_KEY.KC_ON_AUTH_REFRESH_ERROR_ACTION
    )
    if (refreshErrorConfig && ['retry', 'logout', 'ignore'].includes(refreshErrorConfig)) {
      this.refreshErrorAction = refreshErrorConfig
    }
    this.logger.debug(`Config: refreshErrorAction = ${this.refreshErrorAction}`)

    // Min validity
    const minValidityConfig = await this.configService.getProperty(
      CONFIG_KEY.KC_UPDATE_TOKEN_MIN_VALIDITY
    )
    if (minValidityConfig) {
      const parsed = parseInt(minValidityConfig, 10)
      if (!isNaN(parsed) && parsed >= 0) {
        this.minValidity = parsed
      }
    }
    this.logger.debug(`Config: minValidity = ${this.minValidity}`)

    // Retry count
    const retryCountConfig = await this.configService.getProperty(
      CONFIG_KEY.KC_REFRESH_RETRY_COUNT
    )
    if (retryCountConfig) {
      const parsed = parseInt(retryCountConfig, 10)
      if (!isNaN(parsed) && parsed >= 0) {
        this.maxRetries = parsed
      }
    }
    this.logger.debug(`Config: maxRetries = ${this.maxRetries}`)

    // Retry delay
    const retryDelayConfig = await this.configService.getProperty(
      CONFIG_KEY.KC_REFRESH_RETRY_DELAY
    )
    if (retryDelayConfig) {
      const parsed = parseInt(retryDelayConfig, 10)
      if (!isNaN(parsed) && parsed >= 0) {
        this.retryDelay = parsed
      }
    }
    this.logger.debug(`Config: retryDelay = ${this.retryDelay}ms`)
  }

  /**
   * Get timeSkew configuration.
   * Returns undefined if not configured (let keycloak-js calculate).
   */
  private async getTimeSkewConfig(): Promise<number | undefined> {
    const timeSkewConfig = await this.configService.getProperty(CONFIG_KEY.KC_TIME_SKEW)
    
    if (timeSkewConfig) {
      const parsed = parseInt(timeSkewConfig, 10)
      if (!isNaN(parsed)) {
        this.logger.info(`Using configured timeSkew: ${parsed} seconds`)
        return parsed
      } else {
        this.logger.warn(`Invalid timeSkew config: ${timeSkewConfig}, using auto-calculation`)
      }
    }
    
    return undefined
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
    return { url, clientId, realm }
  }

  /**
   * *** ENHANCED: Setup event listeners with configurable handlers ***
   */
  private setupEventListener() {
    if (!this.keycloak) return

    this.keycloak.onAuthError = () => {
      this.logger.warn('Auth error occurred')
      this.updateLocalStorage()
    }
    
    this.keycloak.onAuthLogout = () => {
      this.logger.info('SSO logout detected')
      this.clearKCStateFromLocalstorage()
      this.keycloak?.login(this.config)
    }
    
    this.keycloak.onAuthRefreshSuccess = () => {
      this.logger.debug('Token refresh successful')
      this.retryCount = 0  // Reset retry counter on success
      this.updateLocalStorage()
    }
    
    // *** ENHANCED: Configurable refresh error handler ***
    this.keycloak.onAuthRefreshError = () => {
      this.logger.warn('Token refresh error')
      this.updateLocalStorage()
      this.handleAuthRefreshError()
    }
    
    this.keycloak.onAuthSuccess = () => {
      this.logger.debug('Authentication successful')
      this.updateLocalStorage()
    }
    
    // *** ENHANCED: Configurable token expired handler ***
    this.keycloak.onTokenExpired = () => {
      this.logger.info('Access token expired')
      this.updateLocalStorage()
      this.handleTokenExpired()
    }
    
    this.keycloak.onActionUpdate = () => {
      this.updateLocalStorage()
    }
    
    this.keycloak.onReady = () => {
      this.logger.debug('Keycloak ready')
      this.updateLocalStorage()
    }
  }

  /**
   * *** NEW: Handle token expiration based on configuration ***
   */
  private handleTokenExpired(): void {
    switch (this.tokenExpiredAction) {
      case 'refresh':
        this.logger.info('Token expired, proactively refreshing')
        this.keycloak?.updateToken(-1)
          .then(refreshed => {
            if (refreshed) {
              this.logger.info('Proactive token refresh successful')
            }
          })
          .catch(err => {
            this.logger.error('Proactive token refresh failed', err)
            // Let onAuthRefreshError handle the error
          })
        break
        
      case 'logout':
        this.logger.info('Token expired, logging out per configuration')
        this.clearKCStateFromLocalstorage()
        this.keycloak?.logout()
        break
        
      case 'ignore':
      default:
        this.logger.debug('Token expired, awaiting next request')
        break
    }
  }

  /**
   * *** NEW: Handle refresh errors based on configuration ***
   */
  private handleAuthRefreshError(): void {
    switch (this.refreshErrorAction) {
      case 'retry':
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          this.logger.warn(
            `Token refresh failed, retry ${this.retryCount}/${this.maxRetries} ` +
            `in ${this.retryDelay}ms`
          )
          
          setTimeout(() => {
            this.keycloak?.updateToken(-1)
              .catch(() => {
                // Error handler (this method) will be called again
                // by onAuthRefreshError event
              })
          }, this.retryDelay)
        } else {
          this.logger.error('Max refresh retries exceeded, redirecting to login')
          this.retryCount = 0
          this.clearKCStateFromLocalstorage()
          this.keycloak?.login(this.config)
        }
        break
        
      case 'logout':
        this.logger.info('Token refresh failed, logging out per configuration')
        this.clearKCStateFromLocalstorage()
        this.keycloak?.logout()
        break
        
      case 'ignore':
      default:
        this.logger.warn('Token refresh failed, ignoring per configuration')
        break
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

  /**
   * *** ENHANCED: updateTokenIfNeeded with mutex and configurable minValidity ***
   * 
   * Why?
   * - Prevents redundant concurrent token refresh calls
   * - Uses configurable minValidity threshold
   * - More efficient for batched API calls
   * 
   * What?
   * - Checks if refresh is already in progress (mutex)
   * - Uses configured minValidity for refresh decision
   * - Returns same promise to concurrent callers
   * 
   * How?
   * 1. Check if update promise already exists (mutex)
   * 2. If yes, return existing promise
   * 3. If not authenticated, redirect to login
   * 4. Create new promise with keycloak.updateToken(minValidity)
   * 5. Clear promise reference when complete
   * 
   * When?
   * - Called by TokenInterceptor before every HTTP request
   * - Called when proactive refresh is triggered
   */
  async updateTokenIfNeeded(): Promise<boolean> {
    // *** MUTEX CHECK ***
    if (this.updateTokenPromise) {
      this.logger.debug('Token refresh already in progress, joining existing promise')
      return this.updateTokenPromise
    }

    if (!this.keycloak?.authenticated) {
      this.logger.info('Not authenticated, redirecting to login')
      return this.keycloak?.login(this.config).then(() => false) 
        ?? Promise.reject('Keycloak not initialized!')
    }

    // *** CREATE PROMISE WITH MUTEX ***
    this.logger.debug(`Checking token with minValidity: ${this.minValidity}s`)
    
    this.updateTokenPromise = this.keycloak
      .updateToken(this.minValidity)  // *** USE CONFIGURED VALUE ***
      .then(refreshed => {
        if (refreshed) {
          this.logger.debug('Token was refreshed')
        } else {
          this.logger.debug('Token still valid, no refresh needed')
        }
        return refreshed
      })
      .finally(() => {
        // *** CLEAR MUTEX ***
        this.updateTokenPromise = null
      })

    return this.updateTokenPromise
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
    return { 
      'apm-principal-token': this.getIdToken() ?? '', 
      Authorization: `Bearer ${this.getAccessToken()}` 
    }
  }
}
```

## 4.3 env.json Changes

```json
{
  "APP_BASE_HREF": "${APP_BASE_HREF}",
  "KEYCLOAK_REALM": "${KEYCLOAK_REALM}",
  "KEYCLOAK_URL": "${KEYCLOAK_URL}",
  "KEYCLOAK_CLIENT_ID": "${KEYCLOAK_CLIENT_ID}",
  "KEYCLOAK_ENABLE_SILENT_SSO": "${KEYCLOAK_ENABLE_SILENT_SSO}",
  "APP_VERSION": "${APP_VERSION}",
  "IS_SHELL": true,
  "AUTH_SERVICE": "${AUTH_SERVICE}",
  "AUTH_SERVICE_CUSTOM_URL": "${AUTH_SERVICE_CUSTOM_URL}",
  "AUTH_SERVICE_CUSTOM_MODULE_NAME": "${AUTH_SERVICE_CUSTOM_MODULE_NAME}",
  "POLYFILL_SCOPE_MODE": "${POLYFILL_SCOPE_MODE}",
  
  "_comment_auth_config": "New authentication configuration options",
  "KC_TIME_SKEW": "${KC_TIME_SKEW}",
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "${KC_UPDATE_TOKEN_MIN_VALIDITY}",
  "KC_ON_TOKEN_EXPIRED_ACTION": "${KC_ON_TOKEN_EXPIRED_ACTION}",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "${KC_ON_AUTH_REFRESH_ERROR_ACTION}",
  "KC_REFRESH_RETRY_COUNT": "${KC_REFRESH_RETRY_COUNT}",
  "KC_REFRESH_RETRY_DELAY": "${KC_REFRESH_RETRY_DELAY}"
}
```

---

# 5. Testing Strategy

## 5.1 Unit Tests

### Test: Mutex prevents duplicate refresh calls

```typescript
describe('KeycloakAuthService', () => {
  describe('updateTokenIfNeeded with mutex', () => {
    it('should return same promise for concurrent calls', async () => {
      // Arrange
      const mockKeycloak = {
        authenticated: true,
        updateToken: jest.fn().mockImplementation(() => {
          return new Promise(resolve => setTimeout(() => resolve(true), 100));
        })
      };
      service['keycloak'] = mockKeycloak as any;
      
      // Act - make 3 concurrent calls
      const promise1 = service.updateTokenIfNeeded();
      const promise2 = service.updateTokenIfNeeded();
      const promise3 = service.updateTokenIfNeeded();
      
      // Assert - all should be the same promise
      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
      
      // And keycloak.updateToken should only be called once
      expect(mockKeycloak.updateToken).toHaveBeenCalledTimes(1);
      
      // All should resolve with same value
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual([true, true, true]);
    });
    
    it('should create new promise after previous completes', async () => {
      // Arrange
      const mockKeycloak = {
        authenticated: true,
        updateToken: jest.fn().mockResolvedValue(true)
      };
      service['keycloak'] = mockKeycloak as any;
      
      // Act
      await service.updateTokenIfNeeded();
      await service.updateTokenIfNeeded();
      
      // Assert - two separate calls
      expect(mockKeycloak.updateToken).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Test: Configurable minValidity

```typescript
describe('minValidity configuration', () => {
  it('should use configured minValidity value', async () => {
    // Arrange
    const mockConfigService = {
      getProperty: jest.fn().mockImplementation((key) => {
        if (key === CONFIG_KEY.KC_UPDATE_TOKEN_MIN_VALIDITY) {
          return Promise.resolve('30');
        }
        return Promise.resolve(undefined);
      })
    };
    service['configService'] = mockConfigService as any;
    
    const mockKeycloak = {
      authenticated: true,
      updateToken: jest.fn().mockResolvedValue(true)
    };
    service['keycloak'] = mockKeycloak as any;
    
    // Load config
    await service['loadConfiguration']();
    
    // Act
    await service.updateTokenIfNeeded();
    
    // Assert
    expect(mockKeycloak.updateToken).toHaveBeenCalledWith(30);
  });
  
  it('should use default value when config is invalid', async () => {
    // Arrange - invalid value
    service['configService'].getProperty = jest.fn()
      .mockResolvedValue('invalid');
    
    await service['loadConfiguration']();
    await service.updateTokenIfNeeded();
    
    // Assert - should use default 5
    expect(service['keycloak'].updateToken).toHaveBeenCalledWith(5);
  });
});
```

### Test: Token expired handler

```typescript
describe('handleTokenExpired', () => {
  it('should proactively refresh when action is "refresh"', () => {
    // Arrange
    service['tokenExpiredAction'] = 'refresh';
    const updateTokenSpy = jest.spyOn(service['keycloak'], 'updateToken')
      .mockResolvedValue(true);
    
    // Act
    service['handleTokenExpired']();
    
    // Assert
    expect(updateTokenSpy).toHaveBeenCalledWith(-1);
  });
  
  it('should logout when action is "logout"', () => {
    // Arrange
    service['tokenExpiredAction'] = 'logout';
    const logoutSpy = jest.spyOn(service['keycloak'], 'logout');
    const clearSpy = jest.spyOn(service as any, 'clearKCStateFromLocalstorage');
    
    // Act
    service['handleTokenExpired']();
    
    // Assert
    expect(clearSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
  });
  
  it('should do nothing when action is "ignore"', () => {
    // Arrange
    service['tokenExpiredAction'] = 'ignore';
    const updateTokenSpy = jest.spyOn(service['keycloak'], 'updateToken');
    const logoutSpy = jest.spyOn(service['keycloak'], 'logout');
    
    // Act
    service['handleTokenExpired']();
    
    // Assert
    expect(updateTokenSpy).not.toHaveBeenCalled();
    expect(logoutSpy).not.toHaveBeenCalled();
  });
});
```

### Test: Refresh error retry logic

```typescript
describe('handleAuthRefreshError with retry', () => {
  beforeEach(() => {
    service['refreshErrorAction'] = 'retry';
    service['maxRetries'] = 3;
    service['retryDelay'] = 100;
    service['retryCount'] = 0;
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should retry on first failure', () => {
    // Arrange
    const updateTokenSpy = jest.spyOn(service['keycloak'], 'updateToken')
      .mockRejectedValue(new Error('Network error'));
    
    // Act
    service['handleAuthRefreshError']();
    
    // Fast-forward timer
    jest.advanceTimersByTime(100);
    
    // Assert
    expect(service['retryCount']).toBe(1);
    expect(updateTokenSpy).toHaveBeenCalledWith(-1);
  });
  
  it('should login after max retries', () => {
    // Arrange
    service['retryCount'] = 3; // Already at max
    const loginSpy = jest.spyOn(service['keycloak'], 'login')
      .mockResolvedValue();
    const clearSpy = jest.spyOn(service as any, 'clearKCStateFromLocalstorage');
    
    // Act
    service['handleAuthRefreshError']();
    
    // Assert
    expect(clearSpy).toHaveBeenCalled();
    expect(loginSpy).toHaveBeenCalled();
  });
});
```

## 5.2 Integration Tests

### Test: Full authentication flow with new config

```typescript
describe('Authentication Flow Integration', () => {
  it('should initialize with custom configuration', async () => {
    // Arrange - mock config service
    const config = {
      [CONFIG_KEY.KC_UPDATE_TOKEN_MIN_VALIDITY]: '30',
      [CONFIG_KEY.KC_TIME_SKEW]: '10',
      [CONFIG_KEY.KC_ON_TOKEN_EXPIRED_ACTION]: 'refresh',
      [CONFIG_KEY.KC_ON_AUTH_REFRESH_ERROR_ACTION]: 'retry',
      [CONFIG_KEY.KC_REFRESH_RETRY_COUNT]: '5',
      [CONFIG_KEY.KC_REFRESH_RETRY_DELAY]: '2000',
    };
    
    mockConfigService.getProperty.mockImplementation(key => 
      Promise.resolve(config[key])
    );
    
    // Act
    await service.init();
    
    // Assert
    expect(service['minValidity']).toBe(30);
    expect(service['tokenExpiredAction']).toBe('refresh');
    expect(service['refreshErrorAction']).toBe('retry');
    expect(service['maxRetries']).toBe(5);
    expect(service['retryDelay']).toBe(2000);
  });
});
```

## 5.3 E2E Tests

### Test: Token refresh behavior

```typescript
describe('Token Refresh E2E', () => {
  it('should handle token expiration gracefully', () => {
    // Login
    cy.login('testuser', 'testpass');
    
    // Wait for token to near expiration
    cy.wait(TOKEN_LIFETIME - 10000); // Wait until 10s before expiry
    
    // Make API call
    cy.intercept('/api/data').as('apiCall');
    cy.get('[data-cy=load-data]').click();
    
    // Verify token was refreshed and call succeeded
    cy.wait('@apiCall').its('response.statusCode').should('eq', 200);
    
    // Verify new token in localStorage
    cy.window().then(win => {
      const token = win.localStorage.getItem('onecx_kc_token');
      const parsed = JSON.parse(atob(token.split('.')[1]));
      expect(parsed.exp).to.be.greaterThan(Date.now() / 1000);
    });
  });
  
  it('should recover from refresh failure with retry', () => {
    // Login
    cy.login('testuser', 'testpass');
    
    // Intercept and fail first refresh attempt
    let attemptCount = 0;
    cy.intercept('POST', '**/token', (req) => {
      attemptCount++;
      if (attemptCount < 3) {
        req.reply(500, { error: 'Service temporarily unavailable' });
      } else {
        req.continue();
      }
    }).as('tokenRefresh');
    
    // Trigger refresh
    cy.get('[data-cy=load-data]').click();
    
    // Wait for retries
    cy.wait('@tokenRefresh');
    cy.wait('@tokenRefresh');
    cy.wait('@tokenRefresh');
    
    // Should succeed on third attempt
    cy.get('[data-cy=data-loaded]').should('exist');
  });
});
```

---

# 6. Migration and Deployment

## 6.1 Backward Compatibility

All new configuration keys have sensible defaults that match current behavior:

| Config Key | Default | Matches Current Behavior? |
|------------|---------|---------------------------|
| KC_TIME_SKEW | Not set (auto-calculate) | ✅ Yes |
| KC_UPDATE_TOKEN_MIN_VALIDITY | 5 | ✅ Yes (keycloak-js default) |
| KC_ON_TOKEN_EXPIRED_ACTION | "refresh" | 🔄 Enhanced (was "ignore") |
| KC_ON_AUTH_REFRESH_ERROR_ACTION | "retry" | 🔄 Enhanced (was "ignore") |
| KC_REFRESH_RETRY_COUNT | 3 | ➕ New feature |
| KC_REFRESH_RETRY_DELAY | 1000 | ➕ New feature |

**Note**: The default for `KC_ON_TOKEN_EXPIRED_ACTION` and `KC_ON_AUTH_REFRESH_ERROR_ACTION` are "refresh" and "retry" respectively, which is more proactive than the current "do nothing" approach. For exact backward compatibility, deployments can explicitly set these to "ignore".

## 6.2 Deployment Steps

### Step 1: Update onecx-portal-ui-libs

1. Merge PR with config-key.model.ts changes
2. Merge PR with keycloak-auth.service.ts changes
3. Publish new library version

### Step 2: Update onecx-shell-ui

1. Update portal-ui-libs dependency version
2. Update env.json with new config placeholders
3. Build and test

### Step 3: Update Helm Charts / Kubernetes

```yaml
# Add to deployment env or ConfigMap
env:
  # Existing...
  - name: KC_UPDATE_TOKEN_MIN_VALIDITY
    value: "30"  # Adjust for your environment
  - name: KC_ON_TOKEN_EXPIRED_ACTION
    value: "refresh"
  - name: KC_ON_AUTH_REFRESH_ERROR_ACTION
    value: "retry"
  - name: KC_REFRESH_RETRY_COUNT
    value: "3"
  - name: KC_REFRESH_RETRY_DELAY
    value: "1000"
  # KC_TIME_SKEW only if needed
```

## 6.3 Rollback Plan

If issues occur:

1. **Quick fix**: Set config values to preserve old behavior:
   ```yaml
   KC_ON_TOKEN_EXPIRED_ACTION: "ignore"
   KC_ON_AUTH_REFRESH_ERROR_ACTION: "ignore"
   ```

2. **Full rollback**: Revert to previous library version

---

# 7. Potential Challenges

## 7.1 Challenge: Infinite Retry Loop

**Risk**: `onAuthRefreshError` calls `updateToken(-1)`, which could fail again, triggering another error, leading to infinite loop.

**Mitigation**: 
- Retry counter with max limit
- Reset counter only on success
- Exponential backoff option

```typescript
private handleAuthRefreshError(): void {
  if (this.retryCount < this.maxRetries) {
    this.retryCount++;
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential
    setTimeout(() => this.keycloak?.updateToken(-1), delay);
  } else {
    this.retryCount = 0;
    this.keycloak?.login(this.config);
  }
}
```

## 7.2 Challenge: Race Condition in Retry

**Risk**: Retry in progress, user triggers another action, multiple refresh attempts.

**Mitigation**: The mutex pattern handles this - concurrent calls join existing promise.

## 7.3 Challenge: Invalid Configuration Values

**Risk**: User sets invalid values (negative numbers, wrong types).

**Mitigation**: Validate all config values, use defaults for invalid:

```typescript
if (!isNaN(parsed) && parsed >= 0) {
  this.minValidity = parsed;
} else {
  this.logger.warn(`Invalid minValidity: ${configValue}, using default: ${DEFAULT_MIN_VALIDITY}`);
}
```

## 7.4 Challenge: Multi-Tab Token Sync

**Risk**: Tab A has retry in progress, Tab B triggers another refresh, tokens could get out of sync.

**Mitigation**: 
- Consider using Browser Lock API
- Or accept that keycloak-js handles most cases with its internal queue

```typescript
// Potential future enhancement
if (navigator.locks) {
  await navigator.locks.request('token-refresh', async () => {
    return this.keycloak?.updateToken(this.minValidity);
  });
}
```

## 7.5 Challenge: Memory Leaks from Retry Timers

**Risk**: If component/service is destroyed while retry is pending, timer could leak.

**Mitigation**: Track timer ID and clear on destroy:

```typescript
private retryTimerId: number | null = null;

private handleAuthRefreshError(): void {
  if (this.retryCount < this.maxRetries) {
    this.retryTimerId = window.setTimeout(() => {
      this.retryTimerId = null;
      this.keycloak?.updateToken(-1);
    }, this.retryDelay);
  }
}

// If service had destroy lifecycle
onDestroy() {
  if (this.retryTimerId) {
    clearTimeout(this.retryTimerId);
  }
}
```

---

# 8. Expected Outcomes

## 8.1 User Benefits

| Benefit | Description |
|---------|-------------|
| **Fewer Session Interruptions** | Proactive refresh means tokens rarely expire mid-action |
| **Better Error Recovery** | Retry mechanism handles temporary network issues |
| **Smoother Experience** | Less frequent unexpected logouts |

## 8.2 System Benefits

| Benefit | Description |
|---------|-------------|
| **Reduced Redundant Calls** | Mutex prevents N calls for N concurrent requests |
| **Configurable Behavior** | Different settings for different environments |
| **Better Observability** | Structured logging for auth events |
| **Clock Drift Resilience** | Manual timeSkew for problematic environments |

## 8.3 Operational Benefits

| Benefit | Description |
|---------|-------------|
| **Runtime Configuration** | Change behavior without code changes |
| **Environment-Specific Tuning** | Different settings per environment |
| **Easier Debugging** | More verbose logging options |

## 8.4 Performance Metrics (Expected)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Token refresh calls (10 concurrent requests) | 10 | 1 | 90% reduction |
| Unexpected session expirations | ~X/month | ~0/month | Significant |
| 401 errors due to expired tokens | ~Y/week | ~0/week | Significant |

---

# 9. Questions for Stakeholders

## 9.1 Questions for Jan (or Product Owner)

1. **Use Case Clarification**
   - What specific issues are driving this change?
   - Are there environments with known clock drift problems?
   - What is the expected token lifetime in production?

2. **Behavior Decisions**
   - What should be the default action for `onTokenExpired`? (Currently suggesting "refresh")
   - What should be the default for `onAuthRefreshError`? (Currently suggesting "retry")
   - Should there be telemetry/logging for auth events?

3. **Edge Cases**
   - What should happen if ALL retry attempts fail?
   - Should there be different behavior for different error types (network vs. auth)?
   - How should multi-tab scenarios be handled?

4. **Testing Requirements**
   - Are there specific test environments to validate clock drift?
   - What is the acceptance criteria for "successful" implementation?

## 9.2 Technical Questions

1. **Performance**
   - What's the expected latency in production environments?
   - Should we implement exponential backoff for retries?

2. **Logging**
   - Should auth events be logged to a central system?
   - What level of detail is needed for debugging?

3. **Future Considerations**
   - Should we support custom event handlers via configuration?
   - Is there need for WebSocket/real-time session management?

---

# Summary

This document has provided a comprehensive technical guide for implementing the "Improve Keycloak Service Config" task:

1. **Task Analysis**: Broke down each requirement with clear explanations
2. **Current State**: Documented existing implementation and its limitations
3. **Implementation Details**: Provided complete code changes with patterns explained
4. **Testing Strategy**: Outlined unit, integration, and E2E test approaches
5. **Deployment Guide**: Covered migration, backward compatibility, and rollback
6. **Challenges**: Identified potential issues and their mitigations
7. **Expected Outcomes**: Defined success metrics and benefits

## Next Steps

1. ✅ Documentation complete
2. ⬜ Review with Jan (get answers to questions)
3. ⬜ Implement config-key.model.ts changes
4. ⬜ Implement keycloak-auth.service.ts changes
5. ⬜ Write unit tests
6. ⬜ Update env.json
7. ⬜ Integration testing
8. ⬜ PR review
9. ⬜ Deployment to staging
10. ⬜ Production rollout

## Related Documents

- [Authentication Overview](./00-authentication-overview.md) - Complete auth system documentation
- [CLIENT_DOCS - User Guide](../CLIENT_DOCS/Authentication/) - User-facing documentation
