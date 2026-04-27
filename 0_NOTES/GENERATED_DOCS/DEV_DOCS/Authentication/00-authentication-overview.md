# OneCX Authentication System - Developer Documentation

## Complete Technical Guide to Authentication, Authorization, and Token Management

---

## Document Information

| Property | Value |
|----------|-------|
| **Version** | 1.0.0 |
| **Created** | April 22, 2026 |
| **Target Audience** | Developers, Architects, DevOps |
| **Prerequisites** | Angular, OAuth2/OIDC, Keycloak basics |
| **Related Repositories** | onecx-portal-ui-libs, onecx-shell-ui |

---

## Table of Contents

1. [Introduction to OneCX Authentication](#1-introduction-to-onecx-authentication)
2. [Architecture Deep Dive](#2-architecture-deep-dive)
3. [Keycloak Integration](#3-keycloak-integration)
4. [Token Management](#4-token-management)
5. [Authentication Flow](#5-authentication-flow)
6. [HTTP Interceptor Pattern](#6-http-interceptor-pattern)
7. [Configuration Reference](#7-configuration-reference)
8. [Microfrontend Authentication](#8-microfrontend-authentication)
9. [Advanced Topics](#9-advanced-topics)
10. [Troubleshooting Guide](#10-troubleshooting-guide)

---

# 1. Introduction to OneCX Authentication

## 1.1 What is OneCX Authentication?

OneCX uses a **centralized authentication architecture** where the Shell application manages authentication for all microfrontends (MFEs). This approach is based on:

- **OAuth 2.0** - The industry-standard authorization framework
- **OpenID Connect (OIDC)** - Identity layer built on OAuth 2.0
- **Keycloak** - Open-source Identity and Access Management (IAM)
- **Module Federation** - Webpack-based microfrontend architecture

### Why? - Business and Technical Reasons

1. **Security Centralization**: Single point of authentication reduces attack surface
2. **Consistency**: All MFEs use the same authentication standards
3. **Single Sign-On (SSO)**: Users authenticate once, access all applications
4. **Token Management**: Centralized token refresh prevents race conditions
5. **Simplified MFE Development**: MFEs don't need to implement auth logic

### What? - Functionality and Purpose

The authentication system provides:
- User identity verification via Keycloak
- Access token management (JWT)
- Refresh token handling for session persistence
- HTTP header injection for API calls
- Cross-MFE authentication state sharing
- Session timeout and expiration handling

### How? - Step-by-step Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OneCX Authentication Flow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────────┐   │
│  │  User   │───▶│  Shell   │───▶│ Keycloak │───▶│ Backend Services     │   │
│  │ Browser │    │   UI     │    │  Server  │    │ (BFF/SVC)            │   │
│  └─────────┘    └──────────┘    └──────────┘    └──────────────────────┘   │
│       │              │               │                    │                 │
│       │   1. Load    │               │                    │                 │
│       │──────────────▶               │                    │                 │
│       │              │  2. Check SSO │                    │                 │
│       │              │───────────────▶                    │                 │
│       │              │               │                    │                 │
│       │              │  3. Not Auth  │                    │                 │
│       │              │◀───────────────                    │                 │
│       │              │               │                    │                 │
│       │  4. Redirect │               │                    │                 │
│       │◀──────────────               │                    │                 │
│       │              │               │                    │                 │
│       │  5. Login Page               │                    │                 │
│       │──────────────────────────────▶                    │                 │
│       │              │               │                    │                 │
│       │  6. Enter Credentials        │                    │                 │
│       │──────────────────────────────▶                    │                 │
│       │              │               │                    │                 │
│       │  7. Tokens (code flow)       │                    │                 │
│       │◀──────────────────────────────                    │                 │
│       │              │               │                    │                 │
│       │  8. Return to Shell          │                    │                 │
│       │──────────────▶               │                    │                 │
│       │              │               │                    │                 │
│       │              │  9. Store Tokens                   │                 │
│       │              │──────────────▶│                    │                 │
│       │              │               │                    │                 │
│       │              │  10. API Call with Token           │                 │
│       │              │────────────────────────────────────▶                 │
│       │              │               │                    │                 │
│       │              │  11. Data     │                    │                 │
│       │              │◀────────────────────────────────────                 │
│       │              │               │                    │                 │
│       │  12. Render  │               │                    │                 │
│       │◀──────────────               │                    │                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### When? - Use Cases and Scenarios

| Scenario | Authentication Action |
|----------|----------------------|
| User opens OneCX application | Shell initializes, checks SSO |
| User not logged in | Redirect to Keycloak login |
| User already has session | Silent SSO, reuse tokens |
| Token about to expire | Automatic refresh |
| Token refresh fails | Retry or re-login |
| User clicks logout | Clear tokens, redirect to Keycloak logout |
| MFE makes API call | Interceptor adds token to request |
| Session timeout | Detect via iframe or server response |

---

## 1.2 Authentication Layers in OneCX

### Layer 1: Shell Authentication (Central)

The OneCX Shell is responsible for:
- Keycloak initialization
- Token acquisition and storage
- Token refresh management
- Exposing auth APIs to MFEs

**Code Location**: `@onecx/shell-auth` library

### Layer 2: HTTP Interceptor (Per-Request)

Every HTTP request goes through:
- Token validity check
- Token refresh if needed
- Header injection
- Request forwarding

**Code Location**: `@onecx/angular-auth` library

### Layer 3: Auth Proxy (MFE Integration)

Microfrontends communicate via:
- Global window object (`window.onecxAuth`)
- Shared authentication state
- Proxied method calls

**Code Location**: Both `shell-auth` and `angular-auth` libraries

---

## 1.3 Key Concepts

### JWT (JSON Web Token)

JWTs are self-contained tokens used in OneCX:

```
Header.Payload.Signature
```

Example decoded token:
```json
{
  "exp": 1713801600,           // Expiration timestamp
  "iat": 1713798000,           // Issued at
  "iss": "https://keycloak.example.com/realms/onecx",
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "typ": "Bearer",
  "azp": "onecx-shell-ui-client",
  "session_state": "abc123",
  "acr": "1",
  "realm_access": {
    "roles": ["user", "admin"]
  },
  "resource_access": {
    "onecx-product-store": {
      "roles": ["product-admin"]
    }
  },
  "preferred_username": "john.doe",
  "email": "john.doe@example.com"
}
```

### Token Types in OneCX

| Token Type | Purpose | Lifetime | Storage Key |
|-----------|---------|----------|-------------|
| **Access Token** | API authorization | Short (5-15 min) | `onecx_kc_token` |
| **ID Token** | User identity | Short (5-15 min) | `onecx_kc_idToken` |
| **Refresh Token** | Get new access tokens | Long (30 min - 8h) | `onecx_kc_refreshToken` |

### timeSkew

The difference between client time and server time:

```
timeSkew = serverTime - clientTime
```

**Why it matters:**
- Token expiration is server-time based
- Client clock might be off
- Without adjustment, tokens could be rejected

```javascript
// How keycloak-js calculates token expiration
var expiresIn = tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + timeSkew;
```

---

## 1.4 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Shell | Angular | 20+ | Main application host |
| Auth Library | @onecx/shell-auth | ^7.x | Keycloak integration |
| HTTP Auth | @onecx/angular-auth | ^7.x | Token interceptor |
| Keycloak Adapter | keycloak-js | ^25.x | Official KC JS library |
| Identity Server | Keycloak | 23+ | Authentication server |
| Protocol | OAuth2/OIDC | - | Authorization framework |

---

## 1.5 Repository Structure

```
onecx-portal-ui-libs/
├── libs/
│   ├── shell-auth/                    # Shell-side auth services
│   │   └── src/lib/
│   │       ├── auth.service.ts        # Interface definition
│   │       ├── auth-service-wrapper.ts
│   │       ├── auth_services/
│   │       │   ├── keycloak-auth.service.ts
│   │       │   └── disabled-auth.service.ts
│   │       ├── declarations.ts
│   │       └── provide-auth-service.ts
│   │
│   ├── angular-auth/                  # MFE-side auth utilities
│   │   └── src/lib/
│   │       ├── token.interceptor.ts   # HTTP interceptor
│   │       ├── auth-proxy.service.ts  # Global proxy
│   │       ├── angular-auth.module.ts
│   │       └── declarations.ts
│   │
│   └── angular-integration-interface/ # Shared interfaces
│       └── src/lib/model/
│           └── config-key.model.ts    # Configuration keys

onecx-shell-ui/
├── src/
│   ├── main.ts                        # Entry point
│   ├── bootstrap.ts                   # Module bootstrap
│   ├── app/
│   │   └── app.module.ts              # App configuration
│   ├── assets/
│   │   ├── env.json                   # Runtime config
│   │   └── silent-check-sso.html      # SSO helper
│   └── environments/
│       └── environment.ts             # Dev config
└── webpack.config.js                  # Module federation
```

---

# 2. Architecture Deep Dive

## 2.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        OneCX Shell (Host)                              │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │ │
│  │  │ AuthService     │  │ ConfigService   │  │ AppStateService     │   │ │
│  │  │ Wrapper         │  │                 │  │ (isAuthenticated$)  │   │ │
│  │  └────────┬────────┘  └─────────────────┘  └─────────────────────┘   │ │
│  │           │                                                            │ │
│  │  ┌────────▼────────┐                                                   │ │
│  │  │ KeycloakAuth    │◀──────────────────────────────────┐              │ │
│  │  │ Service         │                                    │              │ │
│  │  └────────┬────────┘                                    │              │ │
│  │           │                                              │              │ │
│  │  ┌────────▼────────┐  ┌─────────────────────────────────┴────────┐   │ │
│  │  │ keycloak-js     │  │         window.onecxAuth                  │   │ │
│  │  │ Library         │  │         .authServiceProxy.v1              │   │ │
│  │  └────────┬────────┘  │  ┌──────────────────────────────────────┐ │   │ │
│  │           │           │  │ • updateTokenIfNeeded()              │ │   │ │
│  │           │           │  │ • getHeaderValues()                  │ │   │ │
│  │           │           │  └──────────────────────────────────────┘ │   │ │
│  │           │           └───────────────────────────────────────────┘   │ │
│  └───────────┼───────────────────────────────────────────────────────────┘ │
│              │                                                              │
│  ┌───────────┼───────────────────────────────────────────────────────────┐ │
│  │           │           Microfrontends (Remote Modules)                  │ │
│  │  ┌────────▼────────────────────────────────────────────────────────┐  │ │
│  │  │  MFE 1                  │  MFE 2                   │  MFE N     │  │ │
│  │  │  ┌──────────────┐       │  ┌──────────────┐        │  ┌──────┐  │  │ │
│  │  │  │AuthProxy     │       │  │AuthProxy     │        │  │Auth  │  │  │ │
│  │  │  │Service       │       │  │Service       │        │  │Proxy │  │  │ │
│  │  │  └──────┬───────┘       │  └──────┬───────┘        │  └──┬───┘  │  │ │
│  │  │         │               │         │                │     │      │  │ │
│  │  │  ┌──────▼───────┐       │  ┌──────▼───────┐        │  ┌──▼───┐  │  │ │
│  │  │  │Token         │       │  │Token         │        │  │Token │  │  │ │
│  │  │  │Interceptor   │       │  │Interceptor   │        │  │Inter │  │  │ │
│  │  │  └──────────────┘       │  └──────────────┘        │  └──────┘  │  │ │
│  │  └─────────────────────────┴──────────────────────────┴────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                              HTTPS   │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          KEYCLOAK SERVER                                    │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐   │
│  │    Realm:      │  │    Client:     │  │    Users / Roles           │   │
│  │    onecx       │  │ onecx-shell-ui │  │                            │   │
│  │                │  │    -client     │  │                            │   │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Component Relationships

### AuthService Interface

```typescript
/**
 * Why? 
 * - Defines a contract that all auth implementations must follow
 * - Allows swapping implementations (Keycloak, custom, disabled)
 * - Enables testing with mock implementations
 * 
 * What?
 * - Interface for authentication services
 * - Declares required methods for auth operations
 * 
 * How?
 * - Implemented by KeycloakAuthService, DisabledAuthService, or custom
 * - Used by AuthServiceWrapper to delegate calls
 * 
 * When?
 * - During service initialization
 * - When MFEs call auth methods
 */
export interface AuthService {
  /**
   * Initialize the auth service
   * @param config Optional configuration overrides
   * @returns Promise resolving to true if authenticated
   */
  init(config?: Record<string, unknown>): Promise<boolean>
  
  /**
   * Get HTTP headers needed for API calls
   * @returns Object with header name/value pairs
   */
  getHeaderValues(): Record<string, string>
  
  /**
   * Terminate user session
   */
  logout(): void
  
  /**
   * Check and refresh token if needed
   * @returns Promise resolving to true if token is valid
   */
  updateTokenIfNeeded(): Promise<boolean>
}
```

### AuthServiceWrapper

**Why?**
- Acts as a facade for different auth implementations
- Provides initialization logic
- Exposes auth methods to global window object for MFE access

**What?**
- Injectable Angular service
- Manages auth service lifecycle
- Bridges Shell and MFE authentication

**How?**
1. Reads `AUTH_SERVICE` from configuration
2. Instantiates appropriate auth service
3. Initializes the service
4. Publishes authentication state
5. Exposes methods via `window.onecxAuth`

```typescript
@Injectable()
export class AuthServiceWrapper {
  private authService: AuthService | undefined;

  constructor() {
    // Expose to MFEs via global object
    window.onecxAuth = {
      authServiceProxy: {
        v1: {
          updateTokenIfNeeded: () => this.updateTokenIfNeeded(),
          getHeaderValues: () => this.getHeaderValues(),
        }
      }
    };
  }

  async init(): Promise<boolean | undefined> {
    await this.configService.isInitialized;
    await this.initializeAuthService();
    const result = await this.authService?.init();
    if (result) {
      await this.appStateService.isAuthenticated$.publish();
    }
    return result;
  }

  async initializeAuthService(): Promise<void> {
    const serviceType = await this.configService.getProperty(CONFIG_KEY.AUTH_SERVICE) ?? 'keycloak';
    
    switch (serviceType) {
      case 'keycloak':
        this.authService = this.injector.get(KeycloakAuthService);
        break;
      case 'custom':
        const factory = await this.getAuthServiceFactory();
        this.authService = await factory(/* ... */);
        break;
      case 'disabled':
        this.authService = this.injector.get(DisabledAuthService);
        break;
    }
  }
}
```

### KeycloakAuthService

This is the primary authentication service implementation:

```typescript
/**
 * Why?
 * - Integrates Keycloak as the identity provider
 * - Manages OAuth2 token lifecycle
 * - Handles browser-based authentication flow
 * 
 * What?
 * - Wrapper around keycloak-js library
 * - Token storage in localStorage
 * - Event-driven token updates
 * 
 * How?
 * 1. Load configuration (realm, clientId, URL)
 * 2. Initialize keycloak-js
 * 3. Attempt SSO check
 * 4. Redirect to login if needed
 * 5. Store tokens in localStorage
 * 6. Set up event listeners for token lifecycle
 * 
 * When?
 * - App startup (init)
 * - Before API calls (updateToken)
 * - User logout
 */
@Injectable()
export class KeycloakAuthService implements AuthService {
  private keycloak: Keycloak | undefined;
  
  async init(config?: Record<string, unknown>): Promise<boolean> {
    // 1. Restore tokens from localStorage if available
    let token = localStorage.getItem('onecx_kc_token');
    let idToken = localStorage.getItem('onecx_kc_idToken');
    let refreshToken = localStorage.getItem('onecx_kc_refreshToken');
    
    // 2. Validate stored refresh token
    if (token && refreshToken) {
      const parsed = JSON.parse(atob(refreshToken.split('.')[1]));
      if (parsed.exp * 1000 < Date.now()) {
        // Refresh token expired, clear all
        this.clearKCStateFromLocalstorage();
        token = idToken = refreshToken = null;
      }
    }
    
    // 3. Load Keycloak configuration
    const kcConfig = await this.getValidKCConfig();
    
    // 4. Initialize keycloak-js
    this.keycloak = new Keycloak(kcConfig);
    this.setupEventListener();
    
    // 5. Initialize with check-sso
    return this.keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: /* ... */,
      token: token || undefined,
      refreshToken: refreshToken || undefined,
      idToken: idToken || undefined,
    })
    .then(authenticated => {
      if (!authenticated) {
        return this.keycloak?.login(this.config);
      }
      return true;
    });
  }
}
```

---

## 2.3 Data Flow Diagrams

### Authentication Initialization Flow

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   main.ts   │  │ bootstrap.ts│  │ app.module  │  │ AuthService │  │  Keycloak   │
│             │  │             │  │   .ts       │  │  Wrapper    │  │   Server    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │                │
       │ Load Preloaders│                │                │                │
       │───────────────▶│                │                │                │
       │                │                │                │                │
       │                │ Bootstrap      │                │                │
       │                │ AppModule      │                │                │
       │                │───────────────▶│                │                │
       │                │                │                │                │
       │                │                │ APP_INITIALIZER│                │
       │                │                │ (provideAuthService)            │
       │                │                │───────────────▶│                │
       │                │                │                │                │
       │                │                │                │ init()         │
       │                │                │                │───────────────▶│
       │                │                │                │                │
       │                │                │                │ Check SSO      │
       │                │                │                │───────────────▶│
       │                │                │                │                │
       │                │                │                │  Token/Redirect│
       │                │                │                │◀───────────────│
       │                │                │                │                │
       │                │                │                │ updateLocalStorage
       │                │                │                │────────┐       │
       │                │                │                │        │       │
       │                │                │                │◀───────┘       │
       │                │                │                │                │
       │                │                │ isAuthenticated│                │
       │                │                │ $.publish()    │                │
       │                │                │◀───────────────│                │
       │                │                │                │                │
       │                │                │ Continue Init  │                │
       │                │                │───────────────▶│                │
       │                │                │                │                │
```

### Token Refresh Flow

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  MFE / HTTP │  │   Token     │  │  AuthProxy  │  │  Keycloak   │  │  Keycloak   │
│   Request   │  │ Interceptor │  │   Service   │  │ AuthService │  │   Server    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │                │
       │ HTTP Request   │                │                │                │
       │───────────────▶│                │                │                │
       │                │                │                │                │
       │                │ Wait for       │                │                │
       │                │ isInitialized  │                │                │
       │                │────────┐       │                │                │
       │                │        │       │                │                │
       │                │◀───────┘       │                │                │
       │                │                │                │                │
       │                │ updateToken    │                │                │
       │                │ IfNeeded()     │                │                │
       │                │───────────────▶│                │                │
       │                │                │                │                │
       │                │                │ window.onecxAuth               │
       │                │                │ .updateToken   │                │
       │                │                │ IfNeeded()     │                │
       │                │                │───────────────▶│                │
       │                │                │                │                │
       │                │                │                │ Check expiry   │
       │                │                │                │────────┐       │
       │                │                │                │        │       │
       │                │                │                │◀───────┘       │
       │                │                │                │                │
       │                │                │                │ [If expired]   │
       │                │                │                │ POST /token    │
       │                │                │                │───────────────▶│
       │                │                │                │                │
       │                │                │                │ New tokens     │
       │                │                │                │◀───────────────│
       │                │                │                │                │
       │                │                │                │ Update storage │
       │                │                │                │────────┐       │
       │                │                │                │        │       │
       │                │                │                │◀───────┘       │
       │                │                │ true           │                │
       │                │                │◀───────────────│                │
       │                │ true           │                │                │
       │                │◀───────────────│                │                │
       │                │                │                │                │
       │                │ getHeaderValues│                │                │
       │                │───────────────▶│                │                │
       │                │                │                │                │
       │                │ {Authorization,│                │                │
       │                │  apm-token}    │                │                │
       │                │◀───────────────│                │                │
       │                │                │                │                │
       │                │ Add headers    │                │                │
       │                │ Clone request  │                │                │
       │                │────────┐       │                │                │
       │                │        │       │                │                │
       │                │◀───────┘       │                │                │
       │                │                │                │                │
       │ Request with   │                │                │                │
       │ Auth Headers   │                │                │                │
       │◀───────────────│                │                │                │
       │                │                │                │                │
```

---

## 2.4 Module Federation Integration

### How Preloaders Enable Auth Sharing

**Why?**
- MFEs built with different Angular versions need compatible auth libraries
- Ensures consistent authentication behavior across all modules
- Prevents version conflicts

**What?**
- Preloaders are micro-bundles loaded before the main app
- Each preloader contains auth libraries for a specific Angular version
- Shared via `window.onecxPreloaders`

**How?**
```typescript
// main.ts
const preloaders = [angular18Preloader, angular19Preloader, angular20Preloader];

Promise.all([
  ...preloaders.map(loadPreloaderModule),
  ...preloaders.map(ensurePreloaderModuleLoaded)
]).then(() => {
  return import('./bootstrap');
});
```

**When?**
- During application startup, before bootstrap
- Ensures auth libraries are available for all MFE versions

### Webpack Module Federation Configuration

```javascript
// webpack.config.js
module.exports = withModuleFederationPlugin({
  name: 'onecx-shell-ui',
  shared: share({
    '@onecx/angular-auth': {
      requiredVersion: 'auto',
      includeSecondaries: true,
    },
    '@onecx/angular-integration-interface': {
      requiredVersion: 'auto',
      includeSecondaries: true,
    },
    // ...
  }),
});
```

---

# 3. Keycloak Integration

## 3.1 Understanding keycloak-js

The `keycloak-js` library is the official JavaScript adapter for Keycloak:

### Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `authenticated` | boolean | Whether user is authenticated |
| `token` | string | Base64 encoded access token |
| `tokenParsed` | object | Decoded access token |
| `idToken` | string | Base64 encoded ID token |
| `idTokenParsed` | object | Decoded ID token |
| `refreshToken` | string | Base64 encoded refresh token |
| `refreshTokenParsed` | object | Decoded refresh token |
| `timeSkew` | number | Seconds difference from server time |
| `subject` | string | User ID |
| `realmAccess` | object | Realm-level roles |
| `resourceAccess` | object | Client-level roles |

### Key Methods

```typescript
// Initialize Keycloak
keycloak.init(options: KeycloakInitOptions): Promise<boolean>

// Redirect to login
keycloak.login(options?: KeycloakLoginOptions): Promise<void>

// Redirect to logout
keycloak.logout(options?: KeycloakLogoutOptions): Promise<void>

// Refresh token
keycloak.updateToken(minValidity?: number): Promise<boolean>

// Check token expiration
keycloak.isTokenExpired(minValidity?: number): boolean

// Load user profile
keycloak.loadUserProfile(): Promise<KeycloakProfile>

// Check role
keycloak.hasRealmRole(role: string): boolean
keycloak.hasResourceRole(role: string, resource?: string): boolean
```

### Event Callbacks

```typescript
// Called when adapter is ready
keycloak.onReady = (authenticated?: boolean) => void

// Called on successful authentication
keycloak.onAuthSuccess = () => void

// Called on authentication error
keycloak.onAuthError = (error: KeycloakError) => void

// Called on successful token refresh
keycloak.onAuthRefreshSuccess = () => void

// Called on token refresh error
keycloak.onAuthRefreshError = () => void

// Called when user logs out
keycloak.onAuthLogout = () => void

// Called when access token expires
keycloak.onTokenExpired = () => void
```

## 3.2 Initialization Options

```typescript
interface KeycloakInitOptions {
  // What to do on load
  // 'login-required': Redirect to login if not authenticated
  // 'check-sso': Check if already logged in, don't redirect
  onLoad?: 'login-required' | 'check-sso';
  
  // Enable session status iframe
  checkLoginIframe?: boolean;
  
  // Interval for iframe check (seconds)
  checkLoginIframeInterval?: number;
  
  // URL for silent SSO check
  silentCheckSsoRedirectUri?: string;
  
  // PKCE method
  pkceMethod?: 'S256' | false;
  
  // Initial tokens (for restoration)
  token?: string;
  refreshToken?: string;
  idToken?: string;
  
  // Time skew override
  timeSkew?: number;
  
  // Enable logging
  enableLogging?: boolean;
  
  // Default scope
  scope?: string;
}
```

## 3.3 OneCX Keycloak Configuration

### Runtime Configuration (env.json)

```json
{
  "KEYCLOAK_URL": "https://keycloak.example.com/",
  "KEYCLOAK_REALM": "onecx",
  "KEYCLOAK_CLIENT_ID": "onecx-shell-ui-client",
  "KEYCLOAK_ENABLE_SILENT_SSO": "true",
  "AUTH_SERVICE": "keycloak"
}
```

### Keycloak Realm Configuration

Required settings in Keycloak Admin Console:

1. **Client Configuration**:
   - Client ID: `onecx-shell-ui-client`
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants: `OFF`
   - Valid Redirect URIs: `https://your-app.example.com/*`
   - Web Origins: `https://your-app.example.com`

2. **Token Settings**:
   - Access Token Lifespan: 5-15 minutes
   - Refresh Token Lifespan: Based on session timeout

3. **Roles** (example):
   - Realm Roles: `user`, `admin`
   - Client Roles: `product-admin`, `product-viewer`

---

## 3.4 Token Expiration Handling

### Current Implementation

```typescript
// In keycloak-auth.service.ts
private setupEventListener() {
  this.keycloak.onTokenExpired = () => {
    this.updateLocalStorage(); // Just updates storage!
  };
  
  this.keycloak.onAuthRefreshError = () => {
    this.updateLocalStorage(); // Just updates storage!
  };
}
```

### Issue Analysis

**Problem 1: Passive Token Expiration**
- `onTokenExpired` only updates localStorage
- No proactive refresh is triggered
- Relies on next HTTP request to refresh

**Problem 2: No Error Recovery**
- `onAuthRefreshError` doesn't retry
- Doesn't redirect to login
- User may get stuck

### Recommended Improvements

```typescript
// Enhanced event handlers
private setupEventListener() {
  this.keycloak.onTokenExpired = () => {
    this.updateLocalStorage();
    // Proactively refresh before next request
    this.keycloak?.updateToken(-1); // Force refresh
  };
  
  this.keycloak.onAuthRefreshError = () => {
    this.updateLocalStorage();
    // Handle error based on configuration
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => {
        this.keycloak?.updateToken(-1);
      }, this.retryDelay);
    } else {
      // Re-login required
      this.keycloak?.login(this.config);
    }
  };
}
```

---

# 4. Token Management

## 4.1 Token Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN LIFECYCLE                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐ │
│   │ Acquire │────────▶│  Store  │────────▶│   Use   │────────▶│ Refresh │ │
│   │ Tokens  │         │ Tokens  │         │ Tokens  │         │ Tokens  │ │
│   └─────────┘         └─────────┘         └─────────┘         └─────────┘ │
│        │                   │                   │                   │       │
│        │                   │                   │                   │       │
│        ▼                   ▼                   ▼                   ▼       │
│   ┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐ │
│   │ KC Login│         │ Local   │         │ HTTP    │         │ KC Token│ │
│   │ Flow    │         │ Storage │         │ Request │         │ Endpoint│ │
│   └─────────┘         └─────────┘         └─────────┘         └─────────┘ │
│                                                                             │
│   Timeline:                                                                 │
│   ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤     │
│   0          5m         10m        15m        20m        25m        30m    │
│   │          │          │          │          │          │          │      │
│   │   Access Token      │          │          │          │          │      │
│   │   (valid 5-15min)   │          │          │          │          │      │
│   │          │          │          │          │          │          │      │
│   │          │    Refresh│          │          │          │          │      │
│   │          │    needed │          │          │          │          │      │
│   │          │◀─────────▶│          │          │          │          │      │
│   │                      │          │          │          │          │      │
│   │   Refresh Token (valid 30min - 8h)        │          │          │      │
│   │◀────────────────────────────────────────────────────────────────▶│      │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 LocalStorage Keys

| Key | Content | Purpose |
|-----|---------|---------|
| `onecx_kc_token` | Access token (JWT) | API authorization |
| `onecx_kc_idToken` | ID token (JWT) | User identity |
| `onecx_kc_refreshToken` | Refresh token (JWT) | Token renewal |

### Storage Code

```typescript
private updateLocalStorage() {
  if (this.keycloak) {
    if (this.keycloak.token) {
      localStorage.setItem('onecx_kc_token', this.keycloak.token);
    } else {
      localStorage.removeItem('onecx_kc_token');
    }
    if (this.keycloak.idToken) {
      localStorage.setItem('onecx_kc_idToken', this.keycloak.idToken);
    } else {
      localStorage.removeItem('onecx_kc_idToken');
    }
    if (this.keycloak.refreshToken) {
      localStorage.setItem('onecx_kc_refreshToken', this.keycloak.refreshToken);
    } else {
      localStorage.removeItem('onecx_kc_refreshToken');
    }
  }
}
```

## 4.3 Token Refresh Mechanism

### keycloak-js updateToken Implementation

```javascript
// Simplified version of keycloak-js updateToken
kc.updateToken = function(minValidity) {
  var promise = createPromise();
  
  if (!kc.refreshToken) {
    promise.setError();
    return promise.promise;
  }
  
  // Default to 5 seconds if not specified
  minValidity = minValidity || 5;
  
  var exec = function() {
    var refreshToken = false;
    
    // -1 means force refresh
    if (minValidity == -1) {
      refreshToken = true;
    } else if (!kc.tokenParsed || kc.isTokenExpired(minValidity)) {
      refreshToken = true;
    }
    
    if (!refreshToken) {
      promise.setSuccess(false);
    } else {
      // Built-in queue mechanism (pseudo-mutex)
      refreshQueue.push(promise);
      
      if (refreshQueue.length == 1) {
        // Only first request triggers actual refresh
        var req = new XMLHttpRequest();
        req.open('POST', kc.endpoints.token(), true);
        
        req.onreadystatechange = function() {
          if (req.readyState == 4) {
            if (req.status == 200) {
              var tokenResponse = JSON.parse(req.responseText);
              setToken(
                tokenResponse['access_token'],
                tokenResponse['refresh_token'],
                tokenResponse['id_token']
              );
              
              kc.onAuthRefreshSuccess && kc.onAuthRefreshSuccess();
              
              // Resolve all queued promises
              for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
                p.setSuccess(true);
              }
            } else {
              kc.onAuthRefreshError && kc.onAuthRefreshError();
              
              // Reject all queued promises
              for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
                p.setError(true);
              }
            }
          }
        };
        
        req.send(params);
      }
    }
  };
  
  exec();
  return promise.promise;
};
```

### Current OneCX updateToken

```typescript
// Current implementation in keycloak-auth.service.ts
async updateTokenIfNeeded(): Promise<boolean> {
  if (!this.keycloak?.authenticated) {
    return this.keycloak?.login(this.config).then(() => false) 
      ?? Promise.reject('Keycloak not initialized!');
  } else {
    return this.keycloak.updateToken(); // No minValidity!
  }
}
```

### Issues with Current Implementation

1. **No minValidity parameter**: Uses default of 5 seconds
2. **No application-level mutex**: Relies solely on keycloak-js queue
3. **No retry logic**: Single failure = entire operation fails
4. **Not configurable**: Can't adjust refresh threshold

## 4.4 Understanding minValidity

**What is minValidity?**

The `minValidity` parameter tells keycloak-js when to refresh:
- If token expires in less than `minValidity` seconds → refresh
- Default is 5 seconds

**Example:**
```javascript
// Token expires in 30 seconds
// minValidity = 5 (default)
// 30 > 5 → No refresh needed

// Token expires in 3 seconds
// minValidity = 5 (default)
// 3 < 5 → Refresh triggered

// Force immediate refresh
keycloak.updateToken(-1);
```

**Why configure minValidity?**

Different use cases need different thresholds:
- High-latency networks: Higher minValidity (30-60s)
- Frequent API calls: Higher minValidity to reduce 401s
- Low-activity apps: Lower minValidity is fine

## 4.5 Understanding timeSkew

**What is timeSkew?**

The difference between client and server clocks:
```
timeSkew = serverTime - clientTime
```

**Why it matters:**

Token expiration is calculated using:
```javascript
var expiresIn = tokenParsed['exp'] - Math.ceil(Date.now() / 1000) + timeSkew;
```

Without timeSkew adjustment:
- Client clock ahead → Token appears valid when expired
- Client clock behind → Token appears expired when valid

**How keycloak-js calculates timeSkew:**

During token exchange, it measures round-trip time:
```javascript
var timeLocal = new Date().getTime();
// ... HTTP request ...
timeLocal = (timeLocal + new Date().getTime()) / 2;

// Server time from token
var serverTime = tokenResponse['exp'] - tokenResponse['expires_in'];

// Calculate skew
kc.timeSkew = Math.floor(serverTime - (timeLocal / 1000));
```

**When to manually set timeSkew:**

- Known clock drift in environment
- Consistent timing issues
- Testing scenarios

---

# 5. Authentication Flow

## 5.1 Initial Authentication (No Session)

```
User opens OneCX → Shell loads → Check SSO → No session → Redirect to login
→ User enters credentials → Keycloak validates → Redirect with code
→ Exchange code for tokens → Store tokens → Mark authenticated
→ Initialize MFEs → Ready
```

### Detailed Steps:

1. **Shell Loads**
```typescript
// main.ts
Promise.all([preloaders]).then(() => import('./bootstrap'));
```

2. **Bootstrap Module**
```typescript
// bootstrap.ts
bootstrapModule(AppModule, 'shell', environment.production);
```

3. **Auth Initializer Runs**
```typescript
// app.module.ts - APP_INITIALIZER
provideAppInitializer(async () => {
  await configService.isInitialized;
  await authServiceWrapper.init();
});
```

4. **KeycloakAuthService.init()**
```typescript
// keycloak-auth.service.ts
return this.keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false,
});
```

5. **Keycloak check-sso**
- Attempts to find existing session
- If none found, returns `false`

6. **Redirect to Login**
```typescript
if (!loginOk) {
  return this.keycloak?.login(this.config);
}
```

7. **User Authenticates**
- Enters username/password
- Keycloak validates
- Issues authorization code

8. **Callback with Code**
- Browser redirected back with `?code=xxx`
- keycloak-js intercepts and exchanges for tokens

9. **Tokens Stored**
```typescript
localStorage.setItem('onecx_kc_token', token);
localStorage.setItem('onecx_kc_idToken', idToken);
localStorage.setItem('onecx_kc_refreshToken', refreshToken);
```

10. **Authentication Complete**
```typescript
await this.appStateService.isAuthenticated$.publish();
```

## 5.2 Authentication with Existing Session (SSO)

```
User opens OneCX → Shell loads → Check SSO → Session found
→ Restore tokens → Verify with Keycloak → Tokens valid
→ Mark authenticated → Initialize MFEs → Ready
```

### Silent SSO Check

**Why use silent SSO?**
- No visible redirect
- Better user experience
- Maintains SPA state
- Works via hidden iframe

**How it works:**

```html
<!-- silent-check-sso.html -->
<!doctype html>
<html>
  <body>
    <script>
      parent.postMessage(location.href, location.origin);
    </script>
  </body>
</html>
```

1. Shell loads hidden iframe to `/assets/silent-check-sso.html`
2. Iframe is redirected through Keycloak
3. If session exists, Keycloak adds tokens to URL
4. Iframe posts URL back to parent
5. Parent extracts tokens

**Configuration:**
```json
{
  "KEYCLOAK_ENABLE_SILENT_SSO": "true"
}
```

```typescript
silentCheckSsoRedirectUri: enableSilentSSOCheck 
  ? this.getSilentSSOUrl() 
  : undefined
```

## 5.3 Token Restoration from localStorage

```
Shell loads → Check localStorage → Tokens found
→ Parse refresh token → Check if expired
→ If valid: Use stored tokens → Initialize Keycloak with tokens
→ Keycloak validates → Ready
```

```typescript
async init(): Promise<boolean> {
  // 1. Retrieve from storage
  let token = localStorage.getItem('onecx_kc_token');
  let idToken = localStorage.getItem('onecx_kc_idToken');
  let refreshToken = localStorage.getItem('onecx_kc_refreshToken');
  
  // 2. Validate refresh token expiration
  if (token && refreshToken) {
    const parsed = JSON.parse(atob(refreshToken.split('.')[1]));
    if (parsed.exp * 1000 < Date.now()) {
      // Expired, clear and start fresh
      this.clearKCStateFromLocalstorage();
      token = idToken = refreshToken = null;
    }
  }
  
  // 3. Initialize with stored tokens
  return this.keycloak.init({
    token: token || undefined,
    refreshToken: refreshToken || undefined,
    idToken: idToken || undefined,
  });
}
```

## 5.4 Logout Flow

```
User clicks logout → EventsTopic fires logout event
→ AuthServiceWrapper catches event → Calls AuthService.logout()
→ Keycloak.logout() → Clear localStorage → Redirect to Keycloak logout
→ Keycloak ends session → Redirect to post-logout URL
```

```typescript
// In auth-service-wrapper.ts
constructor() {
  this.eventsTopic$
    .pipe(filter((e) => e.type === EventType.AUTH_LOGOUT_BUTTON_CLICKED))
    .subscribe(() => this.authService?.logout());
}

// In keycloak-auth.service.ts
logout(): void {
  this.keycloak?.logout();
}

// Event handler
this.keycloak.onAuthLogout = () => {
  this.clearKCStateFromLocalstorage();
  this.keycloak?.login(this.config); // Re-login redirect
};
```

---

# 6. HTTP Interceptor Pattern

## 6.1 TokenInterceptor Explained

**Why?**
- Automatically adds auth headers to all API requests
- Ensures token is refreshed before requests
- Centralizes auth logic for HTTP calls

**What?**
- Angular HttpInterceptor implementation
- Waits for authentication to be ready
- Refreshes token if needed
- Clones request with auth headers

**How?**
```typescript
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authService = inject(AuthProxyService);
  private appStateService = inject(AppStateService);

  intercept(
    request: HttpRequest<unknown>, 
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip for asset requests
    const skip = WHITELIST.some((str) => request.url.includes(str));
    if (skip) {
      return next.handle(request);
    }

    return from(this.appStateService.isAuthenticated$.isInitialized).pipe(
      // 1. Wait for auth to be ready
      mergeMap(() => from(this.authService.updateTokenIfNeeded())),
      // 2. Refresh token if needed
      mergeMap(() => {
        // 3. Get auth headers
        const headerValues = this.authService.getHeaderValues();
        
        // 4. Clone request with headers
        let headers = request.headers;
        for (const header in headerValues) {
          headers = headers.set(header, headerValues[header]);
        }
        
        const authenticatedReq = request.clone({ headers });
        
        // 5. Forward request
        return next.handle(authenticatedReq);
      })
    );
  }
}
```

**When?**
- Every HTTP request (except whitelisted URLs)
- Before request is sent to server
- After authentication is initialized

## 6.2 Headers Added

```typescript
getHeaderValues(): Record<string, string> {
  return {
    'apm-principal-token': this.getIdToken() ?? '',
    Authorization: `Bearer ${this.getAccessToken()}`
  };
}
```

| Header | Value | Purpose |
|--------|-------|---------|
| `Authorization` | `Bearer <access_token>` | API authorization |
| `apm-principal-token` | `<id_token>` | User identity for audit |

## 6.3 AuthProxyService

**Why?**
- MFEs can't directly access Shell's auth service
- Provides bridge via global window object

**What?**
- Injectable service for MFEs
- Proxies calls to `window.onecxAuth`

**How?**
```typescript
@Injectable()
export class AuthProxyService {
  getHeaderValues(): Record<string, string> {
    return window.onecxAuth.authServiceProxy.v1.getHeaderValues();
  }

  async updateTokenIfNeeded(): Promise<boolean> {
    return window.onecxAuth.authServiceProxy.v1.updateTokenIfNeeded();
  }
}
```

## 6.4 Request Whitelist

Some requests should skip authentication:

```typescript
const WHITELIST = ['assets'];
```

**Whitelisted by default:**
- `/assets/*` - Static files don't need auth

**Extending the whitelist:**

Currently hardcoded, but could be made configurable:
```typescript
// Potential improvement
const WHITELIST = [
  'assets',
  'public',
  'health',
  'version'
];
```

## 6.5 Parallel Request Handling

**Issue:**
Multiple concurrent HTTP requests all call `updateTokenIfNeeded()`.

**Current behavior:**
```
Request 1 → updateTokenIfNeeded() → refreshQueue
Request 2 → updateTokenIfNeeded() → refreshQueue
Request 3 → updateTokenIfNeeded() → refreshQueue

← keycloak-js handles internally with queue →

Only ONE actual refresh HTTP call is made.
All three requests get the same result.
```

**keycloak-js refreshQueue mechanism:**
```javascript
if (refreshQueue.length == 1) {
  // Only first request triggers HTTP call
  // Others join the queue and wait
}

// When refresh completes
for (var p = refreshQueue.pop(); p != null; p = refreshQueue.pop()) {
  p.setSuccess(refreshed);
}
```

---

# 7. Configuration Reference

## 7.1 CONFIG_KEY Enum

```typescript
// libs/angular-integration-interface/src/lib/model/config-key.model.ts

export enum CONFIG_KEY {
  // Keycloak Configuration
  KEYCLOAK_REALM = 'KEYCLOAK_REALM',
  KEYCLOAK_URL = 'KEYCLOAK_URL',
  KEYCLOAK_CLIENT_ID = 'KEYCLOAK_CLIENT_ID',
  KEYCLOAK_ENABLE_SILENT_SSO = 'KEYCLOAK_ENABLE_SILENT_SSO',
  
  // Auth Service Selection
  AUTH_SERVICE = 'AUTH_SERVICE',
  AUTH_SERVICE_CUSTOM_URL = 'AUTH_SERVICE_CUSTOM_URL',
  AUTH_SERVICE_CUSTOM_MODULE_NAME = 'AUTH_SERVICE_CUSTOM_MODULE_NAME',
  
  // Token Configuration
  TKIT_TOKEN_ROLE_CLAIM_NAME = 'TKIT_TOKEN_ROLE_CLAIM_NAME',
  
  // ... other keys
}
```

## 7.2 Environment Configuration (env.json)

```json
{
  "APP_BASE_HREF": "${APP_BASE_HREF}",
  "KEYCLOAK_REALM": "${KEYCLOAK_REALM}",
  "KEYCLOAK_URL": "${KEYCLOAK_URL}",
  "KEYCLOAK_CLIENT_ID": "${KEYCLOAK_CLIENT_ID}",
  "KEYCLOAK_ENABLE_SILENT_SSO": "${KEYCLOAK_ENABLE_SILENT_SSO}",
  "AUTH_SERVICE": "${AUTH_SERVICE}",
  "AUTH_SERVICE_CUSTOM_URL": "${AUTH_SERVICE_CUSTOM_URL}",
  "AUTH_SERVICE_CUSTOM_MODULE_NAME": "${AUTH_SERVICE_CUSTOM_MODULE_NAME}",
  "IS_SHELL": true
}
```

## 7.3 Configuration Options Explained

### KEYCLOAK_URL
- **Type**: String (URL)
- **Example**: `https://keycloak.example.com/`
- **Purpose**: Base URL of Keycloak server
- **Note**: Must include trailing slash

### KEYCLOAK_REALM
- **Type**: String
- **Example**: `onecx`
- **Purpose**: Name of the Keycloak realm
- **Note**: Case-sensitive

### KEYCLOAK_CLIENT_ID
- **Type**: String
- **Example**: `onecx-shell-ui-client`
- **Purpose**: OAuth client ID registered in Keycloak
- **Note**: Must match Keycloak client configuration

### KEYCLOAK_ENABLE_SILENT_SSO
- **Type**: String (`"true"` or `"false"`)
- **Example**: `"true"`
- **Purpose**: Enable silent SSO check via iframe
- **Default**: Not enabled if not set

### AUTH_SERVICE
- **Type**: String (`"keycloak"`, `"custom"`, `"disabled"`)
- **Example**: `"keycloak"`
- **Purpose**: Select authentication provider
- **Default**: `"keycloak"`

### AUTH_SERVICE_CUSTOM_URL
- **Type**: String (URL to remote module)
- **Example**: `https://mfe.example.com/custom-auth/remoteEntry.js`
- **Purpose**: URL to custom auth module (only for `AUTH_SERVICE=custom`)

### AUTH_SERVICE_CUSTOM_MODULE_NAME
- **Type**: String
- **Example**: `./CustomAuth`
- **Default**: `./CustomAuth`
- **Purpose**: Exposed module name in custom auth bundle

## 7.4 Docker/Kubernetes Configuration

### Environment Variables
```yaml
# Kubernetes ConfigMap or Deployment env
env:
  - name: KEYCLOAK_URL
    value: "https://keycloak.prod.example.com/"
  - name: KEYCLOAK_REALM
    value: "onecx"
  - name: KEYCLOAK_CLIENT_ID
    value: "onecx-shell-ui-client"
  - name: KEYCLOAK_ENABLE_SILENT_SSO
    value: "true"
  - name: AUTH_SERVICE
    value: "keycloak"
```

### Helm Values (Example)
```yaml
# values.yaml
keycloak:
  url: "https://keycloak.prod.example.com/"
  realm: "onecx"
  clientId: "onecx-shell-ui-client"
  enableSilentSso: true
  
auth:
  service: "keycloak"
```

---

# 8. Microfrontend Authentication

## 8.1 How MFEs Authenticate

Microfrontends do NOT implement their own authentication. They:

1. **Receive auth state from Shell** via `window.onecxAuth`
2. **Use TokenInterceptor** from `@onecx/angular-auth`
3. **Wait for authentication** before making API calls

### MFE Setup

```typescript
// MFE app.module.ts
import { provideTokenInterceptor } from '@onecx/angular-auth';

@NgModule({
  providers: [
    provideTokenInterceptor(),
  ],
})
export class AppModule {}
```

## 8.2 Global Auth Proxy

### Window Object Structure

```typescript
window.onecxAuth = {
  authServiceProxy: {
    v1: {
      updateTokenIfNeeded: () => Promise<boolean>,
      getHeaderValues: () => Record<string, string>,
    }
  }
};

// Legacy support (older library versions)
window.onecxAngularAuth = {
  authServiceProxy: {
    v1: { /* same methods */ }
  }
};
```

### Type Declarations

```typescript
// declarations.ts
declare global {
  interface Window {
    onecxAuth?: {
      authServiceProxy?: {
        v1?: {
          getHeaderValues: () => Record<string, string>;
          updateTokenIfNeeded: () => Promise<boolean>;
        };
      };
    };
  }
}
```

## 8.3 Waiting for Authentication

MFE components should wait for auth before loading:

```typescript
@Component({...})
export class MyComponent implements OnInit {
  private appStateService = inject(AppStateService);
  
  async ngOnInit() {
    // Wait for authentication to be ready
    await this.appStateService.isAuthenticated$.isInitialized;
    
    // Now safe to make authenticated API calls
    this.loadData();
  }
}
```

## 8.4 Preloader Integration

Preloaders ensure consistent auth library versions:

```typescript
// Angular 18 apps get @onecx/angular-auth@v5.x
// Angular 19 apps get @onecx/angular-auth@v6.x
// Angular 20 apps get @onecx/angular-auth@v7.x
```

This prevents:
- Version conflicts
- Multiple keycloak-js instances
- Inconsistent token handling

---

# 9. Advanced Topics

## 9.1 Custom Authentication Service

### When to use custom auth?

- Different identity provider (not Keycloak)
- Organization-specific SSO requirements
- Complex multi-tenant scenarios

### Implementing Custom Auth

```typescript
// custom-auth.service.ts
export default function createCustomAuthService(
  getInjectable: (injectable: Injectables) => Promise<unknown>
): CustomAuthService {
  return new CustomAuthService(getInjectable);
}

class CustomAuthService implements AuthService {
  async init(config?: Record<string, unknown>): Promise<boolean> {
    // Your initialization logic
    // Connect to your identity provider
    return true;
  }
  
  getHeaderValues(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      // Your custom headers
    };
  }
  
  logout(): void {
    // Your logout logic
  }
  
  async updateTokenIfNeeded(): Promise<boolean> {
    // Your token refresh logic
    return true;
  }
}
```

### Module Federation Setup

```javascript
// webpack.config.js for custom auth module
module.exports = {
  name: 'custom-auth',
  filename: 'remoteEntry.js',
  exposes: {
    './CustomAuth': './src/lib/custom-auth.service.ts',
  },
};
```

### Configuration

```json
{
  "AUTH_SERVICE": "custom",
  "AUTH_SERVICE_CUSTOM_URL": "https://my-custom-auth.example.com/remoteEntry.js",
  "AUTH_SERVICE_CUSTOM_MODULE_NAME": "./CustomAuth"
}
```

## 9.2 DisabledAuthService (Testing/Development)

For testing without authentication:

```typescript
@Injectable()
export class DisabledAuthService implements AuthService {
  async init(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getHeaderValues(): Record<string, string> {
    return {}; // No auth headers
  }

  logout(): void {
    window.location.href = "https://github.com/onecx/";
  }

  async updateTokenIfNeeded(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
```

**Usage:**
```json
{
  "AUTH_SERVICE": "disabled"
}
```

**Warning:** Never use in production!

## 9.3 Multi-Tab Sessions

### Challenge

Multiple browser tabs share localStorage but have separate JavaScript contexts.

### Current Behavior

1. **Token Storage**: All tabs share `localStorage` tokens
2. **Refresh Handling**: Each tab manages its own `keycloak-js` instance
3. **Logout**: Logging out in one tab doesn't auto-logout others

### Potential Issues

- Tab A refreshes token → Tab B's `keycloak-js` has stale token
- Tab A logs out → Tab B continues with old tokens until next refresh

### Mitigation Strategies

```typescript
// Listen for storage changes
window.addEventListener('storage', (event) => {
  if (event.key === 'onecx_kc_token') {
    if (!event.newValue) {
      // Token removed, user logged out elsewhere
      this.keycloak?.logout();
    } else {
      // Token updated, sync keycloak instance
      this.keycloak.token = event.newValue;
    }
  }
});
```

## 9.4 Error Handling Patterns

### Authentication Errors

```typescript
// In init()
.catch((err) => {
  this.logger.error(`KC ERROR ${err}`);
  // Options:
  // 1. Retry with force login
  // 2. Show error page
  // 3. Redirect to login
  throw err;
});
```

### Token Refresh Errors

```typescript
private async handleRefreshError() {
  // 1. Log the error
  this.logger.error('Token refresh failed');
  
  // 2. Clear invalid tokens
  this.clearKCStateFromLocalstorage();
  
  // 3. Options:
  // a) Retry (with limit)
  if (this.retryCount < MAX_RETRIES) {
    this.retryCount++;
    setTimeout(() => this.keycloak?.updateToken(-1), RETRY_DELAY);
  } else {
    // b) Force re-login
    this.keycloak?.login(this.config);
  }
}
```

### Network Errors

```typescript
// In interceptor
return next.handle(authenticatedReq).pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      // Token might be invalid
      this.authService.updateTokenIfNeeded()
        .then(() => {
          // Retry request
        })
        .catch(() => {
          // Force re-login
        });
    }
    return throwError(() => error);
  })
);
```

## 9.5 Performance Considerations

### Token Refresh Optimization

**Problem:** Every HTTP request checks token validity.

**Current approach:**
```typescript
// In interceptor
mergeMap(() => from(this.authService.updateTokenIfNeeded()))
```

**Optimization options:**

1. **Cache refresh result** (application-level mutex):
```typescript
private refreshPromise: Promise<boolean> | null = null;

async updateTokenIfNeeded(): Promise<boolean> {
  if (this.refreshPromise) {
    return this.refreshPromise;
  }
  
  this.refreshPromise = this.doRefresh()
    .finally(() => {
      this.refreshPromise = null;
    });
    
  return this.refreshPromise;
}
```

2. **Debounce rapid calls**:
```typescript
private lastRefresh = 0;
private MIN_REFRESH_INTERVAL = 1000; // 1 second

async updateTokenIfNeeded(): Promise<boolean> {
  const now = Date.now();
  if (now - this.lastRefresh < MIN_REFRESH_INTERVAL) {
    return Promise.resolve(true); // Skip if recently refreshed
  }
  
  this.lastRefresh = now;
  return this.keycloak.updateToken(5);
}
```

### localStorage Access

**Problem:** Frequent localStorage access is synchronous and slow.

**Optimization:**
```typescript
private cachedToken: string | null = null;

getAccessToken(): string | null {
  return this.keycloak?.token ?? this.cachedToken;
}

private updateLocalStorage() {
  if (this.keycloak?.token) {
    this.cachedToken = this.keycloak.token;
    localStorage.setItem('onecx_kc_token', this.keycloak.token);
  }
}
```

---

# 10. Troubleshooting Guide

## 10.1 Common Issues

### Issue: "User gets redirected to login constantly"

**Symptoms:**
- Login completes but immediately redirects back
- Loop between app and Keycloak

**Causes:**
1. Invalid `redirectUri` in Keycloak client config
2. Token validation failing
3. `cookieSameSite` / third-party cookie issues

**Solutions:**
```bash
# Check browser console for errors
# Verify Keycloak client config:
# - Valid Redirect URIs
# - Web Origins includes app origin
# - Check for CORS errors
```

### Issue: "401 Unauthorized on API calls"

**Symptoms:**
- API calls return 401
- Token appears valid

**Causes:**
1. Token not being added to request
2. timeSkew causing premature expiration
3. Token audience mismatch

**Debug:**
```typescript
// Add logging to interceptor
console.log('Request headers:', authenticatedReq.headers);
console.log('Token expiry:', this.keycloak?.tokenParsed?.exp);
console.log('Time skew:', this.keycloak?.timeSkew);
```

### Issue: "Silent SSO not working"

**Symptoms:**
- No SSO session detection
- Always redirects to login

**Causes:**
1. `silent-check-sso.html` not accessible
2. Keycloak iframe blocked
3. Third-party cookies blocked

**Solutions:**
```bash
# Verify file exists at /assets/silent-check-sso.html
# Check browser settings for iframe/cookie restrictions
# Verify KEYCLOAK_ENABLE_SILENT_SSO is "true"
```

### Issue: "Token refresh fails"

**Symptoms:**
- `onAuthRefreshError` triggered
- User logged out unexpectedly

**Causes:**
1. Refresh token expired
2. Network issues
3. Keycloak session ended

**Solutions:**
```typescript
// Check refresh token expiry
const refreshTokenParsed = JSON.parse(
  atob(localStorage.getItem('onecx_kc_refreshToken')?.split('.')[1])
);
console.log('Refresh token expires:', new Date(refreshTokenParsed.exp * 1000));
```

## 10.2 Debugging Tools

### Browser Developer Tools

```javascript
// Check auth state
console.log('Authenticated:', window.onecxAuth);
console.log('Access Token:', localStorage.getItem('onecx_kc_token'));
console.log('Token parsed:', JSON.parse(atob(token.split('.')[1])));
```

### Keycloak Logging

```typescript
// Enable Keycloak JS logging
this.keycloak.init({
  enableLogging: true,
  // ...
});
```

### Network Tab

Look for:
- `/protocol/openid-connect/token` calls (refresh)
- `/protocol/openid-connect/auth` redirects (login)
- 401 responses from APIs

## 10.3 Testing Authentication

### Unit Testing

```typescript
describe('KeycloakAuthService', () => {
  let service: KeycloakAuthService;
  let mockKeycloak: jest.Mocked<Keycloak>;

  beforeEach(() => {
    mockKeycloak = {
      init: jest.fn().mockResolvedValue(true),
      updateToken: jest.fn().mockResolvedValue(true),
      token: 'mock-token',
      authenticated: true,
    } as any;

    service = new KeycloakAuthService();
    (service as any).keycloak = mockKeycloak;
  });

  it('should refresh token when needed', async () => {
    mockKeycloak.authenticated = true;
    
    const result = await service.updateTokenIfNeeded();
    
    expect(mockKeycloak.updateToken).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
```

### E2E Testing

```typescript
describe('Authentication Flow', () => {
  it('should redirect to login when not authenticated', () => {
    cy.visit('/');
    cy.url().should('include', 'keycloak');
    cy.url().should('include', 'login');
  });

  it('should authenticate with valid credentials', () => {
    cy.visit('/');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', 'keycloak');
    cy.window().its('localStorage.onecx_kc_token').should('exist');
  });
});
```

---

# Summary

This document has covered the complete OneCX authentication system:

1. **Architecture**: Centralized shell-based auth with MFE integration via global proxy
2. **Keycloak Integration**: Full keycloak-js adapter implementation with token lifecycle
3. **Token Management**: localStorage persistence, refresh mechanisms, and expiration handling
4. **HTTP Interceptor**: Automatic token injection for all API requests
5. **Configuration**: Environment-based setup with runtime configuration
6. **MFE Integration**: How microfrontends receive and use authentication state
7. **Advanced Topics**: Custom auth services, multi-tab handling, error patterns
8. **Troubleshooting**: Common issues and debugging techniques

## Key Takeaways

- **Shell owns auth**: All authentication flows through the shell
- **MFEs are consumers**: They use the auth proxy, not their own auth
- **Tokens in localStorage**: Enables session persistence across refreshes
- **keycloak-js has built-in mutex**: Queue mechanism for concurrent refreshes
- **Configuration is external**: Runtime env.json allows deployment flexibility

## Related Documents

- [CLIENT_DOCS - User-facing authentication guide](../CLIENT_DOCS/Authentication/)
- [Keycloak Documentation](https://www.keycloak.org/docs/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenID Connect Specification](https://openid.net/connect/)
