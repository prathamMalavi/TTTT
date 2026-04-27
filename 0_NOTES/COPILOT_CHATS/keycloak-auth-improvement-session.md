# Keycloak Authentication Improvement Session Notes

## Session Date: April 22, 2026

## UPDATE: April 24, 2026
**Story fully implemented!** See [keycloak-config-improvement-story-solution.md](./keycloak-config-improvement-story-solution.md) for:
- Improved Story Description with Jan's inputs
- Complete Solution Steps
- Solution Explanation with keycloak-js references
- Implemented code changes

## Task Title: Improve Keycloak Service Config

### Story Description:
- onTokenExpired + onAuthRefreshError + timeSkew -> config
- mutex for updateToken
- make updateToken parameter configurable
- Reach out to Jan

---

## Research Findings

### 1. Current Authentication Architecture in OneCX

#### 1.1 Libraries Involved
| Library | Location | Purpose |
|---------|----------|---------|
| `@onecx/shell-auth` | `libs/shell-auth/` | Core auth services, Keycloak adapter |
| `@onecx/angular-auth` | `libs/angular-auth/` | HTTP interceptor, Auth proxy |
| `keycloak-js` | node_modules | Official Keycloak JavaScript adapter |

#### 1.2 Key Files Identified
1. **KeycloakAuthService**: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`
2. **AuthServiceWrapper**: `libs/shell-auth/src/lib/auth-service-wrapper.ts`
3. **TokenInterceptor**: `libs/angular-auth/src/lib/token.interceptor.ts`
4. **AuthProxyService**: `libs/angular-auth/src/lib/auth-proxy.service.ts`
5. **CONFIG_KEY**: `libs/angular-integration-interface/src/lib/model/config-key.model.ts`

---

### 2. Current Implementation Analysis

#### 2.1 updateTokenIfNeeded() Method (Current)
```typescript
async updateTokenIfNeeded(): Promise<boolean> {
  if (!this.keycloak?.authenticated) {
    return this.keycloak?.login(this.config).then(() => false) ?? Promise.reject('Keycloak not initialized!')
  } else {
    return this.keycloak.updateToken() // No minValidity parameter!
  }
}
```

**Issues Identified:**
- No `minValidity` parameter passed to `updateToken()`
- Uses default of 5 seconds from keycloak-js
- Not configurable via environment

#### 2.2 Event Handlers (Current)
```typescript
private setupEventListener() {
  if (this.keycloak) {
    this.keycloak.onAuthError = () => this.updateLocalStorage()
    this.keycloak.onAuthLogout = () => {
      this.logger.info('SSO logout nav to root')
      this.clearKCStateFromLocalstorage()
      this.keycloak?.login(this.config)
    }
    this.keycloak.onAuthRefreshSuccess = () => this.updateLocalStorage()
    this.keycloak.onAuthRefreshError = () => this.updateLocalStorage() // Just updates storage!
    this.keycloak.onAuthSuccess = () => this.updateLocalStorage()
    this.keycloak.onTokenExpired = () => this.updateLocalStorage() // Just updates storage!
    this.keycloak.onActionUpdate = () => this.updateLocalStorage()
    this.keycloak.onReady = () => this.updateLocalStorage()
  }
}
```

**Issues Identified:**
- `onTokenExpired`: Only updates localStorage, no proactive refresh
- `onAuthRefreshError`: Only updates localStorage, no retry/fallback logic
- Event handlers are not configurable

#### 2.3 timeSkew Configuration (Current)
```typescript
// Keycloak init
return this.keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
  idToken: idToken || undefined,
  refreshToken: refreshToken || undefined,
  token: token || undefined,
  // NO timeSkew configuration!
})
```

**Issues Identified:**
- No `timeSkew` option passed to init
- Relies on keycloak-js to calculate timeSkew from server response
- Not configurable for edge cases

---

### 3. keycloak-js API Analysis

#### 3.1 updateToken(minValidity)
```javascript
kc.updateToken = function(minValidity) {
    // minValidity default is 5 seconds
    minValidity = minValidity || 5;
    
    // Uses refreshQueue for concurrent request handling (built-in mutex)
    if (refreshQueue.length == 1) {
        // Only first request actually refreshes
        // Others wait in queue
    }
}
```

**Key Insight:** keycloak-js already has a queue-based mutex mechanism!

#### 3.2 timeSkew
```javascript
// In init options:
if (initOptions.timeSkew != null) {
    kc.timeSkew = initOptions.timeSkew;
}

// In isTokenExpired:
var expiresIn = kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + kc.timeSkew;
```

**Key Properties:**
- `timeSkew` can be set during initialization
- Used for accurate token expiration calculation
- Important for clock drift scenarios

#### 3.3 Available Events
| Event | When Fired | Current Handler |
|-------|------------|-----------------|
| `onTokenExpired` | Access token expired | updateLocalStorage only |
| `onAuthRefreshSuccess` | Token refresh succeeded | updateLocalStorage |
| `onAuthRefreshError` | Token refresh failed | updateLocalStorage only |
| `onAuthError` | Authentication error | updateLocalStorage |
| `onAuthLogout` | User logged out | Clear storage + re-login |

---

### 4. Task Requirements Analysis

#### 4.1 onTokenExpired + onAuthRefreshError + timeSkew -> config

**What this means:**
- Make event handlers configurable
- Allow custom callbacks for `onTokenExpired` and `onAuthRefreshError`
- Allow `timeSkew` to be set via configuration

**Proposed CONFIG_KEYs:**
```typescript
// New keys to add
KC_TIME_SKEW = 'KC_TIME_SKEW'
KC_UPDATE_TOKEN_MIN_VALIDITY = 'KC_UPDATE_TOKEN_MIN_VALIDITY'
KC_ON_TOKEN_EXPIRED_ACTION = 'KC_ON_TOKEN_EXPIRED_ACTION' // 'refresh' | 'logout' | 'custom'
KC_ON_AUTH_REFRESH_ERROR_ACTION = 'KC_ON_AUTH_REFRESH_ERROR_ACTION' // 'retry' | 'logout' | 'ignore'
```

#### 4.2 Mutex for updateToken

**Current State:**
- keycloak-js has built-in `refreshQueue` mechanism
- Multiple concurrent calls join the queue
- Only first request triggers actual refresh

**Issue in OneCX:**
- TokenInterceptor calls `updateTokenIfNeeded()` for EVERY HTTP request
- Multiple requests can trigger multiple calls before first completes
- While keycloak-js handles this, having an application-level mutex could:
  - Reduce number of calls to keycloak.updateToken()
  - Provide better control over refresh timing
  - Allow for custom retry logic

**Proposed Implementation:**
```typescript
private updateTokenPromise: Promise<boolean> | null = null;

async updateTokenIfNeeded(): Promise<boolean> {
  if (this.updateTokenPromise) {
    return this.updateTokenPromise;
  }
  
  this.updateTokenPromise = this.doUpdateToken().finally(() => {
    this.updateTokenPromise = null;
  });
  
  return this.updateTokenPromise;
}
```

#### 4.3 Make updateToken parameter configurable

**Current:**
```typescript
return this.keycloak.updateToken() // No parameter
```

**Proposed:**
```typescript
const minValidity = await this.configService.getProperty(CONFIG_KEY.KC_UPDATE_TOKEN_MIN_VALIDITY) ?? 5;
return this.keycloak.updateToken(minValidity);
```

---

### 5. Implementation Plan

#### Phase 1: Add New Configuration Keys
File: `libs/angular-integration-interface/src/lib/model/config-key.model.ts`

```typescript
export enum CONFIG_KEY {
  // ... existing keys
  
  // New Keycloak configs
  KC_TIME_SKEW = 'KC_TIME_SKEW',
  KC_UPDATE_TOKEN_MIN_VALIDITY = 'KC_UPDATE_TOKEN_MIN_VALIDITY',
  KC_ON_TOKEN_EXPIRED_ACTION = 'KC_ON_TOKEN_EXPIRED_ACTION',
  KC_ON_AUTH_REFRESH_ERROR_ACTION = 'KC_ON_AUTH_REFRESH_ERROR_ACTION',
  KC_REFRESH_RETRY_COUNT = 'KC_REFRESH_RETRY_COUNT',
  KC_REFRESH_RETRY_DELAY = 'KC_REFRESH_RETRY_DELAY',
}
```

#### Phase 2: Implement Mutex for updateToken
File: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

```typescript
private updateTokenPromise: Promise<boolean> | null = null;
private retryCount = 0;
private maxRetries = 3;
private retryDelay = 1000;

async updateTokenIfNeeded(): Promise<boolean> {
  // Mutex: reuse existing promise if one is in flight
  if (this.updateTokenPromise) {
    return this.updateTokenPromise;
  }

  if (!this.keycloak?.authenticated) {
    return this.keycloak?.login(this.config).then(() => false) 
      ?? Promise.reject('Keycloak not initialized!');
  }

  const minValidity = parseInt(
    await this.configService.getProperty(CONFIG_KEY.KC_UPDATE_TOKEN_MIN_VALIDITY) ?? '5', 
    10
  );

  this.updateTokenPromise = this.keycloak.updateToken(minValidity)
    .finally(() => {
      this.updateTokenPromise = null;
    });

  return this.updateTokenPromise;
}
```

#### Phase 3: Configurable Event Handlers
File: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

```typescript
private async setupEventListener() {
  if (!this.keycloak) return;

  const tokenExpiredAction = await this.configService.getProperty(
    CONFIG_KEY.KC_ON_TOKEN_EXPIRED_ACTION
  ) ?? 'refresh';
  
  const refreshErrorAction = await this.configService.getProperty(
    CONFIG_KEY.KC_ON_AUTH_REFRESH_ERROR_ACTION
  ) ?? 'retry';

  // Token expired handler
  this.keycloak.onTokenExpired = () => {
    this.updateLocalStorage();
    this.handleTokenExpired(tokenExpiredAction);
  };

  // Refresh error handler
  this.keycloak.onAuthRefreshError = () => {
    this.updateLocalStorage();
    this.handleAuthRefreshError(refreshErrorAction);
  };

  // ... other handlers
}

private handleTokenExpired(action: string) {
  switch (action) {
    case 'refresh':
      this.keycloak?.updateToken(-1); // Force refresh
      break;
    case 'logout':
      this.keycloak?.logout();
      break;
    case 'ignore':
    default:
      // Do nothing, let interceptor handle on next request
      break;
  }
}

private async handleAuthRefreshError(action: string) {
  switch (action) {
    case 'retry':
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.keycloak?.updateToken(-1), this.retryDelay);
      } else {
        this.retryCount = 0;
        this.keycloak?.login(this.config);
      }
      break;
    case 'logout':
      this.clearKCStateFromLocalstorage();
      this.keycloak?.logout();
      break;
    case 'ignore':
    default:
      break;
  }
}
```

#### Phase 4: timeSkew Configuration
```typescript
public async init(config?: Record<string, unknown>): Promise<boolean> {
  // ... existing code

  const timeSkew = await this.configService.getProperty(CONFIG_KEY.KC_TIME_SKEW);
  
  return this.keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: enableSilentSSOCheck ? this.getSilentSSOUrl() : undefined,
    idToken: idToken || undefined,
    refreshToken: refreshToken || undefined,
    token: token || undefined,
    timeSkew: timeSkew ? parseInt(timeSkew, 10) : undefined, // NEW
  });
}
```

---

### 6. Environment Configuration Examples

#### env.json additions:
```json
{
  "KC_TIME_SKEW": "${KC_TIME_SKEW}",
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "${KC_UPDATE_TOKEN_MIN_VALIDITY}",
  "KC_ON_TOKEN_EXPIRED_ACTION": "${KC_ON_TOKEN_EXPIRED_ACTION}",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "${KC_ON_AUTH_REFRESH_ERROR_ACTION}",
  "KC_REFRESH_RETRY_COUNT": "${KC_REFRESH_RETRY_COUNT}",
  "KC_REFRESH_RETRY_DELAY": "${KC_REFRESH_RETRY_DELAY}"
}
```

#### Helm values:
```yaml
keycloak:
  timeSkew: null # Auto-calculated from server
  updateTokenMinValidity: 30 # Refresh 30 seconds before expiry
  onTokenExpiredAction: refresh # refresh | logout | ignore
  onAuthRefreshErrorAction: retry # retry | logout | ignore
  refreshRetryCount: 3
  refreshRetryDelay: 1000 # ms
```

---

### 7. Testing Considerations

#### Unit Tests:
1. Test mutex prevents duplicate token refresh calls
2. Test configurable minValidity is used
3. Test event handlers respond to configuration
4. Test retry logic for refresh errors
5. Test timeSkew initialization

#### Integration Tests:
1. Test token refresh before expiry
2. Test behavior when token expires
3. Test behavior when refresh fails
4. Test multiple concurrent HTTP requests

#### E2E Tests:
1. Test user session persistence
2. Test silent SSO
3. Test logout flow
4. Test session timeout handling

---

### 8. Potential Challenges

1. **Backward Compatibility**
   - New config keys should have sensible defaults
   - Existing deployments should work without changes

2. **Race Conditions**
   - Mutex implementation must be robust
   - Consider edge cases with multiple tabs

3. **timeSkew Accuracy**
   - Setting manual timeSkew could cause issues if incorrect
   - Should validate/warn for large values

4. **Retry Loops**
   - Must prevent infinite retry loops
   - Need circuit breaker pattern

---

### 9. Questions for Jan

1. What are the specific use cases driving this change?
2. Are there specific environments with clock drift issues?
3. What should happen in edge cases (no network, server down)?
4. Should there be telemetry/logging for auth events?
5. Are there any concerns about concurrent tab behavior?

---

### 10. Files to Modify

| File | Changes |
|------|---------|
| `libs/angular-integration-interface/src/lib/model/config-key.model.ts` | Add new CONFIG_KEYs |
| `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts` | Implement improvements |
| `libs/shell-auth/src/lib/auth.service.ts` | Update interface if needed |
| `onecx-shell-ui/src/assets/env.json` | Add new config options |
| Various test files | Add new test cases |

---

### 11. References

- [keycloak-js API](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter)
- keycloak-js types: `node_modules/keycloak-js/dist/keycloak.d.mts`
- Current implementation: `libs/shell-auth/src/lib/auth_services/keycloak-auth.service.ts`

---

## Session Status: Active
## Last Updated: April 22, 2026
