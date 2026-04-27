# OneCX Shell - Complete Technical Guide (Developer)

> Status: Initial version created on February 19, 2026. This guide will be continuously expanded as more features are explored.

## 1. Introduction

### 1.1 What is OneCX?

OneCX is a modular enterprise platform that lets you compose a full digital workspace from many independent products (microservices and microfrontends). Instead of building one giant monolith, each product team delivers:
- Backend services ("svc")
- Backend-for-frontend APIs ("bff")
- Frontend microfrontends ("ui")

The platform glues these pieces together via configuration, not hard-coded links.

### 1.2 What is the OneCX Shell?

From a developer perspective, the Shell is:
- The main Angular SPA running at the root URL of the platform.
- The page that users actually hit in the browser.
- The place where workspaces, menus, themes, permissions, and microfrontends are orchestrated.

In code, the main Shell UI lives in:
- 0_onecx-shell-ui (Angular + Nx project)

And is paired with backend and product-level infrastructure:
- onecx-shell (product definition)
- onecx-shell-bff (Backend-For-Frontend)

The Shell makes the whole platform feel like a single application while each feature is delivered by independent microfrontends.

### 1.3 High-Level Responsibilities

At a high level, the Shell:
- Authenticates the user (via Keycloak and @onecx/angular-auth).
- Loads workspace configuration (routes, theme, components, slots) from onecx-shell-bff.
- Builds the runtime route table and dynamically loads each microfrontend via webpack Module Federation.
- Exposes named slots (header, body, footer, extensions) for remote components.
- Manages user profile, theme, and layout preferences.
- Manages permissions and parameters so MFEs can react consistently.
- Coordinates navigation and location across all MFEs.
- Handles initialization and remote loading errors gracefully.

Throughout this guide we’ll keep connecting these responsibilities back to the concrete code in 0_onecx-shell-ui.

## 2. Shell Architecture in the Codebase

### 2.1 Project Structure Overview

Key locations for Shell UI:
- 0_onecx-shell-ui/src/main.ts – preloader bootstrap and entry.
- 0_onecx-shell-ui/src/bootstrap.ts – bootstraps Angular Shell module as a web component platform app.
- 0_onecx-shell-ui/src/app/app.module.ts – main Angular module and all APP_INITIALIZER logic.
- 0_onecx-shell-ui/src/app/shell/** – Shell-specific components, services, utilities.
- 0_onecx-shell-ui/webpack.config.js – Module Federation config exposing Shell remote component(s).
- 0_onecx-shell-ui/helm/values.yaml – Kubernetes Helm values that register Shell as a microfrontend + define slots.

### 2.2 Bootstrap Flow

In the Shell UI, the browser entry sequence is:
1. Browser loads index.html which points to main.ts bundle.
2. main.ts preloads Angular-version-specific microfrontend preloaders.
3. Once all preloaders report ready, it imports bootstrap.ts.
4. bootstrap.ts calls bootstrapModule(AppModule, 'shell', environment.production) from @onecx/angular-webcomponents.
5. AppModule then runs APP_INITIALIZER functions to:
   - Initialize styles, configuration, workspace, user profile, slots, permissions, images, theme icons.
   - Connect router and topics.

### 2.3 Runtime Composition Model

The Shell does not hard-code concrete products. Instead, at runtime it:
- Calls the WorkspaceConfig BFF to get:
  - Workspace metadata (base URL, name, home page).
  - Routes list for all products and microfrontends.
  - List of remote components and slot definitions.
  - Theme information (including CSS variables and favicon/logo data).
- Uses this config to:
  - Build Angular routes with loadChildren pointing to dynamic Module Federation remotes.
  - Publish workspace and microfrontend metadata into integration topics.
  - Initialize remote component registry and slot map.

This allows adding or updating products without rebuilding the Shell—only the product store/workspace config and deployment need to change.

## 3. Authentication & Initialization

> Note: This section describes the high-level flow. The low-level Keycloak and auth services live mainly in 0_onecx-portal-ui-libs/libs/angular-auth and backend IAM services.

### 3.1 Keycloak and Auth Service

The Shell uses @onecx/angular-auth and Keycloak under the hood:
- KeycloakAuthService manages tokens and SSO with Keycloak.
- ConfigurationService provides Keycloak client config and endpoints to the Auth service.
- On startup, Auth initializes, checks local storage for existing tokens, and performs login/SSO if needed.

Real-world use case:
- A corporate employee opens the OneCX URL.
- They are redirected to the company Keycloak login.
- After successful login, they return to the Shell with a JWT.
- The Shell uses this token to call all BFFs and services.

### 3.2 APP_INITIALIZER Chain in AppModule

AppModule wires several async initializers to prepare the platform:
- styleInitializer
- workspaceConfigInitializer
- userProfileInitializer
- slotInitializer
- permissionProxyInitializer
- configurationServiceInitializer
- imageRepositoryServiceInitializer
- themeIconLoaderInitializer

Execution order is governed by Angular’s APP_INITIALIZER: they all run before the first component is rendered.

High-level responsibilities:
- styleInitializer – loads Shell and legacy portal styles (with scope polyfills) and applies them only after auth is ready.
- workspaceConfigInitializer – loads workspace config, builds routes, applies theme, and registers remote components + slots.
- userProfileInitializer – loads the current user profile and publishes it.
- slotInitializer – initializes SlotService so remote components can be rendered into Shell slots.
- permissionProxyInitializer – prepares permission checks bridging Shell with permission service.
- configurationServiceInitializer – makes platform configuration available globally.
- imageRepositoryServiceInitializer – initializes image repository topic used for logos/icons.
- themeIconLoaderInitializer – preloads theme-related icons for faster rendering.

Real-world scenario:
- At 9:00 AM a user opens the platform.
- Before they see anything, the Shell silently:
  - Confirms they’re authenticated.
  - Loads workspace and menu config for their organization.
  - Fetches the corporate theme and logo.
  - Fetches their profile to know language, menu mode, dark/light theme.
  - Sets up routes to all microfrontends they’re allowed to see.
- Only after this completes does the Shell show the layout and workspace home page.

#### Example – Wiring APP_INITIALIZERs in AppModule

```ts
// src/app/app.module.ts (excerpt)
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    // ...
  ],
  declarations: [AppComponent, PortalViewportComponent, GlobalErrorComponent],
  providers: [
    provideAppInitializer(styleInitializer),
    provideAppInitializer(workspaceConfigInitializer),
    provideAppInitializer(userProfileInitializer),
    provideAppInitializer(() => slotInitializer(inject(SlotService))),
    provideAppInitializer(() => permissionProxyInitializer(inject(PermissionProxyService))),
    provideAppInitializer(() => configurationServiceInitializer(inject(ConfigurationService))),
    provideAppInitializer(() => imageRepositoryServiceInitializer(inject(ImageRepositoryService))),
    provideAppInitializer(() => themeIconLoaderInitializer(inject(ThemeIconLoaderService)))
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

**Pattern – APP_INITIALIZER chain**
- **Why?** Ensure all cross-cutting platform concerns (auth, workspace, profile, configuration, parameters, theming) are ready before any microfrontend renders, avoiding inconsistent state.
- **What?** A collection of async initializer functions registered in Angular’s `APP_INITIALIZER` token, executed before app bootstrap completes.
- **How?** Each initializer is a function (or factory) that returns a `Promise` or `Observable`. Angular waits for them to resolve; they call BFF APIs (workspace, profile, parameters) and publish to topics/services.
- **When?** Use this pattern whenever Shell must guarantee some global contract before MFEs run (e.g., user identity, workspace routing, theme CSS, configuration values).

## 4. Workspace, Routing, and Microfrontends

### 4.1 Workspace Configuration Flow

The workspaceConfigInitializer function in AppModule:
- Waits for authentication via AppStateService.isAuthenticated$.
- Calls WorkspaceConfigBffService.loadWorkspaceConfig() with the current application path.
- Retries on failure (with delay) and uses initializationErrorHandler on unrecoverable errors.
- On success, it:
  - Publishes workspace into AppStateService.currentWorkspace$.
  - Calls RoutesService.init() with the routes from backend.
  - Applies theme settings via ThemeService.
  - Publishes components and slots to RemoteComponentsService.remoteComponents$.
  - Triggers ParametersService.initialize() to load parameters for apps and components.

Technical benefits:
- Workspace structure can be changed centrally via workspace service without redeploying Shell.
- Route definitions are stored in backend and version-controlled there.
- Themes and slots are fully dynamic.

#### Example – Loading Workspace Configuration from BFF

```ts
// src/app/app.module.ts (excerpt)
export async function workspaceConfigInitializer(
  workspaceConfigBffService: WorkspaceConfigBffService,
  routesService: RoutesService,
  themeService: ThemeService,
  appStateService: AppStateService,
  remoteComponentsService: RemoteComponentsService,
  parametersService: ParametersService,
  router: Router
) {
  await appStateService.isAuthenticated$.isInitialized;

  const loadWorkspaceConfigResponse = await firstValueFrom(
    workspaceConfigBffService
      .loadWorkspaceConfig({ path: getLocation().applicationPath })
      .pipe(
        retry({ delay: 500, count: 3 }),
        catchError((error) => initializationErrorHandler(error, router))
      )
  );

  if (loadWorkspaceConfigResponse) {
    const parsedProperties = JSON.parse(loadWorkspaceConfigResponse.theme.properties) as Record<string, Record<string, string>>;
    const themeWithParsedProperties = { ...loadWorkspaceConfigResponse.theme, properties: parsedProperties };

    await Promise.all([
      publishCurrentWorkspace(appStateService, loadWorkspaceConfigResponse),
      routesService.init(loadWorkspaceConfigResponse.routes)
        .then(urlChangeListenerInitializer(router, appStateService)),
      apply(themeService, themeWithParsedProperties),
      remoteComponentsService.remoteComponents$.publish({
        components: loadWorkspaceConfigResponse.components,
        slots: mapSlots(loadWorkspaceConfigResponse.slots)
      })
    ]);

    parametersService.initialize();
  }
}
```

**Pattern – WorkspaceConfigBffService.loadWorkspaceConfig**
- **Why?** Centralize workspace definition (routes, slots, theme, components) on the backend so Shell can adapt without redeploys.
- **What?** A BFF API call that returns a `LoadWorkspaceConfigResponse` object, used to configure routes, slots, workspace metadata and theme.
- **How?** After auth, Shell calls `loadWorkspaceConfig` with the current application path, uses `retry` for robustness, then publishes results into `AppStateService`, `RoutesService`, `ThemeService`, and `RemoteComponentsService`.
- **When?** During Shell startup and whenever you need to refresh workspace definition (e.g., after admin changes workspace configuration or during tests mocking different workspaces).

### 4.2 Dynamic Routing with RoutesService

RoutesService is responsible for registering all runtime routes for MFEs.

Key behaviors:
- Sorts backend routes by URL length to ensure more specific routes are matched first.
- For each backend route, builds an Angular Route:
  - path is derived from backend baseUrl (adjusted for Shell base href).
  - loadChildren is an async function calling loadRemoteModule with proper Module Federation options.
  - canActivateChild updates app environment (styles, currentMfe metadata, permissions) before navigation.
  - title uses route.displayName.
- Registers a catch-all route to a not-found page.
- If no route exists for the workspace base URL, creates a fallback route so the workspace root always resolves.

Real-world example:
- Product "Bookmark" defines base URL /bookmark and exposes ./Module from its remoteEntry.
- Workspace configuration includes a route with baseUrl /bookmark and exposedModule ./Module.
- RoutesService converts this into:
  - path: 'bookmark'
  - loadChildren: () => loadRemoteModule({ type: 'module', remoteEntry: <bookmark remoteEntry>, exposedModule: './Module' })
- When a user clicks "Bookmarks" in the menu, Angular router navigates to /bookmark.
- RoutesService triggers loadChildren, downloads the remoteEntry.js from the product deployment, and bootstraps the Bookmark Angular module into the Shell router.

#### Example – Converting BFF Routes to Angular Routes

```ts
// src/app/shell/services/routes.service.ts (excerpt)
private async convertToRoute(r: BffGeneratedRoute): Promise<Route> {
  return {
    path: await this.toRouteUrl(r.baseUrl),
    data: {
      module: r.exposedModule,
      breadcrumb: r.productName
    },
    pathMatch: r.pathMatch ?? (r.baseUrl.endsWith('$') ? 'full' : 'prefix'),
    loadChildren: async () => await this.loadChildren(r, r.baseUrl),
    canActivateChild: [() => this.updateAppEnvironment(r, r.baseUrl)],
    title: r.displayName
  };
}

private async loadChildren(r: BffGeneratedRoute, joinedBaseUrl: string) {
  this.showContent$.next(false);
  await this.appStateService.globalLoading$.publish(true);
  try {
    await this.updateAppEnvironment(r, joinedBaseUrl);
    const m = await loadRemoteModule(this.toLoadRemoteEntryOptions(r));
    const exposedModule = r.exposedModule.startsWith('./') ? r.exposedModule.slice(2) : r.exposedModule;
    return r.technology === Technologies.Angular ? m[exposedModule] : WebcomponentLoaderModule;
  } catch (err) {
    return await this.onRemoteLoadError(err);
  } finally {
    await this.appStateService.globalLoading$.publish(false);
  }
}
```

**Pattern – BFF route → Module Federation route**
- **Why?** Let backend own routing structure while Shell focuses on wiring microfrontends at runtime.
- **What?** A translation layer that turns `BffGeneratedRoute` objects (from Shell BFF) into Angular `Route` entries, each lazily loading a remote module via Module Federation.
- **How?** Use `toRouteUrl` to normalize base URLs, then configure `loadChildren` to call `loadRemoteModule` with `remoteEntry` and `exposedModule`, feeding either an Angular module or a generic `WebcomponentLoaderModule`.
- **When?** Whenever new products/MFEs are added to a workspace; Shell automatically picks them up after workspace config changes without code changes.

### 4.3 Module Federation Options

RoutesService.toLoadRemoteEntryOptions builds the correct options based on technology:
- For Angular and WebComponentModule:
  - type: 'module'
  - remoteEntry: r.remoteEntryUrl
  - exposedModule: './' + exposedModule
- For non-module web components:
  - type: 'script'
  - remoteName: r.remoteName
  - remoteEntry: r.remoteEntryUrl
  - exposedModule: './' + exposedModule

This lets OneCX host:
- Full Angular modules (full-page microfrontends with routing).
- Web component modules (where remote exposes a Custom Element).

### 4.4 Current MFE and Permissions

When switching routes, RoutesService:
- Calls updateAppStyles to switch styles for the current MFE using updateStylesForMfeChange.
- Calls updateMfeInfo to publish current microfrontend info into AppStateService.currentMfe$.
- Calls updatePermissions to fetch app- and product-specific permissions using PermissionBffService and PermissionsCacheService, then publishes them via PermissionsTopic.

Real-world scenario:
- A user navigates from "Bookmarks" to "User Profile".
- Shell updates:
  - currentMfe$ – so any shared components know which app is active.
  - PermissionsTopic – so the new MFE sees correct permissions (e.g., can edit profile or not).
  - Styles – to include additional CSS for the profile module if needed.

## 5. Slot System and Layout

### 5.1 Concept of Slots

Slots are named extension points in the Shell layout where remote components can be rendered.

Two levels exist:
- Slot groups (ocx-shell-slot-group) – conceptual areas in the layout (header/body/footer, start/center/end).
- Slots (ocx-slot) – concrete named locations that remote components are assigned to.

Helm values for Shell UI declare slots like:
- onecx-shell-header.start – e.g., corporate logo.
- onecx-shell-header.center – e.g., global search bar.
- onecx-shell-header.end – e.g., user menu.
- onecx-shell-footer.center – e.g., footer navigation.
- onecx-shell-footer.end – e.g., application version info.
- onecx-shell-extensions – non-visual or overlay features like toast notifications or cookie banner.

### 5.2 PortalViewportComponent

PortalViewportComponent is the main layout component:
- Renders header, sub-header, body (start, center, end), and footer.
- Uses ocx-shell-slot-group to break regions into start/center/end using three ocx-slot elements.
- Contains router-outlet for main page content.
- Shows global loading spinner while MFEs load.
- Displays a global error component when platform-level errors occur.

Practical use case:
- A product team builds a "Help" microfrontend that exposes a header button.
- This remote component is registered in the workspace config to slot onecx-shell-header.end.
- At runtime, Shell renders that component in the top-right corner of the header without any Shell code change.

### 5.3 SlotGroupComponent

SlotGroupComponent encapsulates:
- Direction (row, column, etc.) and flex layout for its slots.
- Computed CSS classes based on direction and extra classes.
- Separate inputs for start, center, end slots (allowing different props later if needed).
- ResizeObserver integration that publishes slot group resizing events via ResizedEventsTopic and SlotGroupResizedEvent.

Real-world scenario:
- A future feature needs the header to collapse when height exceeds some threshold.
- SlotGroupComponent already reports its dimensions through topics.
- Another component can subscribe and adjust layout accordingly.

## 6. Parameters and Configuration

### 6.1 ParametersService

ParametersService provides a central way to resolve application-level parameters across products and MFEs.

Key behavior:
- Builds a GetParametersRequest from:
  - Current workspace routes (per product/app).
  - Registered remote components.
- Uses ParameterBffService to call parameter backend.
- Caches parameter responses in localStorage with an expiration timestamp.
- Publishes the effective parameters via ParametersTopic.

Example use case:
- A company wants to configure the default page size for tables differently for each product.
- Instead of hardcoding in every MFE, they define parameters in the parameter service.
- When Shell starts, ParametersService pulls all relevant parameters and publishes them.
- Each MFE reads from ParametersTopic to apply the correct page size.

#### Example – Aggregating Parameters from Parameter BFF

```ts
// src/app/shell/services/parameters.service.ts (excerpt)
@Injectable({ providedIn: 'root' })
export class ParametersService implements OnDestroy {
  private readonly appStateService = inject(AppStateService);
  private readonly remoteComponentsService = inject(RemoteComponentsService);
  private readonly parameterBffService = inject(ParameterBffService);
  private readonly cacheItemName = 'onecx-parameters-cache';
  private readonly cacheExpirationTimeMs = 3600 * 1000; // 1 hour
  private readonly parametersTopic = new ParametersTopic();

  initialize() {
    // fire-and-forget initialization
    this.init();
  }

  private async init() {
    const cache: Cache = this.getCache(this.cacheItemName);
    const request: GetParametersRequest = await this.buildGetParametersRequest(
      cache,
      this.appStateService,
      this.remoteComponentsService
    );

    if (Object.keys(request.products).length !== 0) {
      const parameters = await firstValueFrom(this.parameterBffService.getParameters(request));
      this.updateCache(parameters, cache);
      localStorage.setItem(this.cacheItemName, JSON.stringify(cache));
    }

    this.parametersTopic.publish(cache);
  }
}
```

**Pattern – ParameterBffService.getParameters**
- **Why?** Centralize feature flags and configuration values per product/app instead of scattering them across MFEs.
- **What?** A BFF endpoint that returns a nested `products[productName][appId] => Parameter[]` structure, turned into a cache and published via `ParametersTopic`.
- **How?** Gather required `(productName, appId)` combinations from workspace routes and remote components, call `getParameters` once, then maintain a time-based cache in `localStorage`.
- **When?** During Shell startup or when parameters should be refreshed (e.g., after admin updates platform-level configuration).

### 6.2 ConfigurationService

ConfigurationService (from @onecx/angular-integration-interface) is initialized in Shell only and:
- Loads global configuration (e.g., API base URLs, Keycloak details, feature flags).
- Makes them available via topics and observables to all MFEs.

Pattern:
- MFEs should never initialize ConfigurationService themselves.
- They only read/subscribe to it.

Real-world scenario:
- Operations team needs to change the URL of the search service.
- They update configuration in a central place.
- Shell’s ConfigurationService loads the new configuration.
- All MFEs automatically start using the new endpoint without redeploy.

#### Example – Using ConfigurationService in an Auth Provider

```ts
// from 0_onecx-portal-ui-libs (conceptual usage)
@Injectable()
export class KeycloakAuthService implements AuthService {
  private configService = inject(ConfigurationService);

  public async init(config?: Record<string, unknown>): Promise<boolean> {
    const platformConfig = await this.configService.getProperty(CONFIG_KEY.KEYCLOAK_CONFIG);
    const kcConfig = { ...(platformConfig ?? {}), ...(config ?? {}) } as KeycloakConfig;
    // initialize Keycloak with kcConfig and reuse tokens from localStorage
    // ...
    return true;
  }
}
```

**Pattern – ConfigurationService as single source of truth**
- **Why?** Avoid hardcoding endpoints and auth details in MFEs, enabling environment-specific deployment without code changes.
- **What?** A topic-backed service that exposes `getProperty` and observables for platform configuration keys.
- **How?** Shell initializes ConfigurationService; MFEs inject it and read specific `CONFIG_KEY` entries when they need to configure clients (auth, APIs, feature flags).
- **When?** Whenever any UI or shared library needs infrastructure-related configuration (Keycloak, API base URLs, toggles).

## 7. User Profile, Theme, and Layout

### 7.1 User Profile Initialization

userProfileInitializer in AppModule:
- Waits for authentication.
- Calls UserProfileBffService.getUserProfile().
- Retries with backoff on failures, uses initializationErrorHandler on fatal errors.
- Normalizes profile.settings.locales and default locales from browser if missing.
- Publishes the resulting profile to UserService.profile$.

User profile includes:
- Person data (name, email, etc.).
- Organization.
- Account settings:
  - Layout and theme settings (menu mode, breadcrumbs, color scheme, etc.).
  - Locale and time settings (timezone, language).

Real-world example:
- Alice prefers a slim side menu and dark mode.
- She sets these in the User Profile UI (onecx-user-profile-ui).
- Next login, Shell’s userProfileInitializer fetches her profile.
- PortalViewportComponent reads layoutAndThemeSettings and immediately sets:
  - menuMode to SLIM or SLIMPLUS.
  - colorScheme to DARK.
- Shell layout adapts to her preferences across all MFEs.

#### Example – Fetching User Profile from Shell BFF

```ts
// src/app/app.module.ts (excerpt)
export async function userProfileInitializer(
  userProfileBffService: UserProfileBffService,
  userService: UserService,
  appStateService: AppStateService,
  router: Router
) {
  await appStateService.isAuthenticated$.isInitialized;

  const getUserProfileResponse = await firstValueFrom(
    userProfileBffService.getUserProfile().pipe(
      retry({ delay: 500, count: 3 }),
      catchError((error) => initializationErrorHandler(error, router))
    )
  );

  if (getUserProfileResponse) {
    const profile: UserProfile = { ...getUserProfileResponse.userProfile };
    profile.settings ??= {};
    profile.settings.locales
      ? normalizeLocales(profile.settings.locales)
      : getNormalizedBrowserLocales();

    await userService.profile$.publish(getUserProfileResponse.userProfile);
  }
}
```

**Pattern – UserProfileBffService.getUserProfile**
- **Why?** Provide Shell and all MFEs with a consistent, server-side backed view of the current user’s profile and preferences.
- **What?** A BFF endpoint returning a `GetUserProfileResponse` with `userProfile` payload, including account settings and organization.
- **How?** After auth, Shell calls `getUserProfile`, retries on transient errors, normalizes locales, and publishes the profile via `UserService.profile$` for all MFEs to consume.
- **When?** During Shell initialization and whenever the profile needs refreshing (e.g., after profile is edited in dedicated UI).

### 7.2 ThemeService and Theme Icon Loader

ThemeService from @onecx/angular-integration-interface and ThemeIconLoaderService work together to:
- Apply CSS variables and theme properties to the document.
- Fetch and set favicon/logo based on theme configuration or theme endpoints from workspace BFF.
- Allow MFEs to react to theme changes via ThemeService.currentTheme$.

Use case:
- An organization switches to a new corporate branding.
- Theme configuration is updated centrally.
- Shell loads the new theme and applies new colors and logo.
- All MFEs using ThemeService automatically update their visuals.

#### Example – Loading Theme Favicon and Icons

```ts
// src/app/shell/components/portal-viewport/portal-viewport.component.ts (excerpt)
this.themeService.currentTheme$
  .pipe(
    first(),
    mergeMap((theme) => {
      return (
        theme.faviconUrl
          ? this.httpClient.get(theme.faviconUrl ?? '', { responseType: 'blob' })
          : this.workspaceConfigBffService.getThemeFaviconByName(theme.name ?? '')
      ).pipe(
        filter((blob) => !!blob),
        mergeMap((blob) => from(this.readBlobAsDataURL(blob)))
      );
    })
  )
  .subscribe((url) => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    if (typeof url === 'string') {
      link.href = url;
    }
  });
```

```ts
// src/app/shell/services/theme-icon-loader.service.ts (excerpt)
private async requestMissingIcons(): Promise<void> {
  const theme = await firstValueFrom(this.themeService.currentTheme$);
  const refId = theme?.name ?? '';
  if (!refId) return;

  const cache = (window as any).onecxIcons ?? ((window as any).onecxIcons = {});
  const namesToRequest = Object.keys(cache).filter((k) => cache[k] === undefined);
  if (!namesToRequest.length) return;

  try {
    const res = await firstValueFrom(this.iconBff.findIconsByNamesAndRefId(refId, { names: namesToRequest }));
    const icons = (res?.icons ?? []) as Icon[];
    const returnedNames = new Set<string>(icons.map((i) => i.name));

    for (const icon of icons) {
      if (icon?.name && icon?.type === 'SVG' && icon?.body) {
        cache[icon.name] = icon;
        this.ensureStyleEl();
        this.addCssForIcon(icon);
      } else if (icon?.name) {
        cache[icon.name] = null;
      }
    }

    for (const name of namesToRequest) {
      if (!returnedNames.has(name)) {
        cache[name] = null;
      }
    }

    this.iconsTopic.publish({ type: 'IconsReceived', names: namesToRequest });
  } catch (err) {
    for (const name of namesToRequest) {
      cache[name] = null;
    }
    this.iconsTopic.publish({ type: 'IconsReceived', names: namesToRequest });
    console.error('Failed loading icons:', err);
  }
}
```

**Pattern – WorkspaceConfigBffService.getThemeFaviconByName & IconBffService.findIconsByNamesAndRefId**
- **Why?** Serve theme-specific branding (favicons, SVG icons) from a central backend so themes can change without redeploying frontends.
- **What?** Two BFF APIs: one returning favicon blob by theme name; another returning a list of icon definitions (name, type, SVG body) for the active theme.
- **How?** `PortalViewportComponent` resolves favicon via HTTP blob and updates `<link rel="icon">`; `ThemeIconLoaderService` queries `IconBffService`, updates a global cache, and injects CSS rules that render icons via data URLs.
- **When?** On Shell startup and whenever icons are requested via `IconsTopic` (e.g., when a component wants to display a named theme icon).

## 8. Error Handling and Resilience

### 8.1 Initialization Error Handling

initializationErrorHandler.utils centralizes startup error handling:
- Accepts ErrorEvent or HttpErrorResponse.
- Logs error details.
- Builds an InitializationError object with:
  - message
  - detail
  - errorCode
  - invalidParams
  - params
  - requestedUrl
- Encodes this information into URL fragment parameters.
- Navigates to portal-initialization-error-page.

InitializationErrorPageComponent then:
- Reads the URL fragment.
- Displays user-friendly messages and technical details.
- Offers a logout button to restart the session.

Real-world scenario:
- Workspace BFF is misconfigured and returns 404 for workspace.
- Shell fails to load workspace config, logs details.
- User sees an error page with:
  - A human-readable message.
  - Error code and invalid parameters.
  - An option to log out and try again or contact support.

### 8.2 Remote Module Load Errors

RoutesService.onRemoteLoadError:
- Logs the error.
- Shows a portal-level toast via PortalMessageService with a translation key (ERROR_MESSAGES.ON_REMOTE_LOAD_ERROR).
- Navigates to remote-loading-error-page with requestedApplicationPath in route params.

Use case:
- A single product’s UI deployment is down.
- When user tries to open that product:
  - Shell still works.
  - It shows a friendly error toast and navigates to an error page.
  - Other products and Shell functions remain unaffected.

  #### Example – Handling Remote Load Failures

  ```ts
  // src/app/shell/services/routes.service.ts (excerpt)
  private async onRemoteLoadError(err: unknown) {
    console.log(`Failed to load remote module: ${err}`);
    this.portalMessageService.error({
      summaryKey: 'ERROR_MESSAGES.ON_REMOTE_LOAD_ERROR'
    });

    const routerParams = {
      requestedApplicationPath: getLocation().applicationPath
    };

    this.router.navigate(['remote-loading-error-page', routerParams]);
    throw err;
  }
  ```

  **Pattern – Graceful Module Federation failure**
  - **Why?** Prevent a single broken microfrontend from breaking the entire Shell experience.
  - **What?** A centralized error handler in `RoutesService` that logs, shows a translated toast message, and navigates to an error page when `loadRemoteModule` fails.
  - **How?** Wrap `loadRemoteModule` in `try/catch`; on error, use `PortalMessageService` for UI feedback and route the user to a dedicated error page with context.
  - **When?** Whenever a remote microfrontend bundle is unavailable, misconfigured, or incompatible.

### 8.3 History and Cross-Router Synchronization

AppModule wraps global history.pushState and replaceState:
- Publishes location changes via CurrentLocationTopic whenever navigation happens that is not marked as isRouterSync.
- Handles edge cases like React Router initialization that calls replaceState with idx=0 and url undefined.
- Constructs a deployment-relative URL using getLocation().deploymentPath.

EventsTopic is then used to:
- Broadcast route changes to MFEs.
- Let MFEs synchronize their internal routing with Shell’s router.

Real-world scenario:
- A React-based microfrontend embedded in OneCX uses its own router.
- When Shell router navigates, the cross-router bridge tells React router to update its internal state.
- Likewise, when React router changes URL (within its sub-path), Shell sees this via history wrapper and keeps global state in sync.

#### Example – Wrapping history.pushState / replaceState

```ts
// src/app/app.module.ts (excerpt)
const currentLocationTopic = new CurrentLocationTopic();

const pushState = globalThis.history.pushState;
globalThis.history.pushState = (data: any, unused: string, url?: string) => {
  const isRouterSync = data?.isRouterSync;
  if (data && 'isRouterSync' in data) {
    delete data.isRouterSync;
  }
  if (data.navigationId !== 'undefined' && data.navigationId === -1) {
    console.warn('Navigation ID is -1, indicating a potential invalid microfrontend initialization.');
    return;
  }
  pushState.bind(globalThis.history)(data, unused, url);
  if (!isRouterSync) {
    currentLocationTopic.publish({ url, isFirst: false });
  }
};
```

**Pattern – CurrentLocationTopic + history wrapper**
- **Why?** Keep Shell router and embedded routers (Angular, React MFEs) in sync while avoiding infinite navigation loops.
- **What?** A wrapper around `history.pushState`/`replaceState` that detects router-synchronized navigations and emits location changes through `CurrentLocationTopic` for others to consume.
- **How?** Intercept history calls, filter on a custom `isRouterSync` flag, and publish normalized URLs that `urlChangeListenerInitializer` converts back into Shell router navigations.
- **When?** In multi-router environments where MFEs may manipulate the browser history directly (e.g., React Router inside a Shell-controlled URL space).

## 9. Shell as a Microfrontend Host and Provider

### 9.1 Webpack Configuration and Exposed Remote(s)

webpack.config.js for Shell UI:
- Uses @angular-architects/module-federation to expose:
  - ./OneCXShellToastComponent – a Shell-level remote component for toast notifications.
- Shares common libraries as singletons:
  - Angular core and router.
  - OneCX Angular libraries (@onecx/angular-accelerator, @onecx/angular-integration-interface, @onecx/angular-remote-components, etc.).
  - PrimeNG, RxJS, @ngx-translate.

#### Example – Shell Module Federation Configuration

```js
// webpack.config.js (excerpt)
const { ModifyEntryPlugin } = require('@angular-architects/module-federation/src/utils/modify-entry-plugin');
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const webpackConfig = {
  ...withModuleFederationPlugin({
    name: 'onecx-shell-ui',
    exposes: {
      './OneCXShellToastComponent': 'src/app/remotes/shell-toast/shell-toast.component.main.ts'
    },
    shared: share({
      '@angular/core': { requiredVersion: 'auto', includeSecondaries: true },
      '@angular/common': { requiredVersion: 'auto', includeSecondaries: { skip: ['@angular/common/http/testing'] } },
      '@angular/common/http': { requiredVersion: 'auto', includeSecondaries: true },
      '@angular/elements': { requiredVersion: 'auto', includeSecondaries: true },
      '@angular/forms': { requiredVersion: 'auto', includeSecondaries: true },
      '@angular/platform-browser': { requiredVersion: 'auto', includeSecondaries: true },
      '@angular/router': { requiredVersion: 'auto', includeSecondaries: true },
      '@ngx-translate/core': { requiredVersion: 'auto' },
      primeng: { requiredVersion: 'auto', includeSecondaries: true },
      rxjs: { requiredVersion: 'auto', includeSecondaries: true },
      '@onecx/angular-integration-interface': { requiredVersion: 'auto', includeSecondaries: true },
      '@onecx/angular-remote-components': { requiredVersion: 'auto', includeSecondaries: true },
      '@onecx/angular-utils': { requiredVersion: 'auto', includeSecondaries: true },
      '@onecx/angular-webcomponents': { requiredVersion: 'auto', includeSecondaries: true }
    })
  })
};
```

**Pattern – Shell as remote provider**
- **Why?** Allow other apps to consume Shell-provided components (like a standardized toast component) while sharing a single Angular/OneCX runtime to reduce bundle size.
- **What?** A Module Federation configuration with `name: 'onecx-shell-ui'`, `exposes` for Shell remotes, and `shared` settings for Angular/OneCX libraries.
- **How?** Use `withModuleFederationPlugin` and `share` from `@angular-architects/module-federation`, list all shared libs with `requiredVersion: 'auto'` and `includeSecondaries` for tree-shaking and consistency.
- **When?** When Shell needs to expose UX primitives or cross-cutting components for other microfrontends to reuse at runtime.

## 10. Shell API Surface – Summary of BFFs and Responsibilities

For quick reference, here are the main BFF APIs Shell UI calls and which feature they enable:

- **WorkspaceConfigBffService**
  - `loadWorkspaceConfig(request: LoadWorkspaceConfigRequest)` – load workspace metadata, routes, components, slots, and theme; used in `workspaceConfigInitializer` and `PortalViewportComponent` (for favicons).
  - `getThemeFaviconByName(name: string, small?: boolean)` – fetch favicon blob for the active theme.

- **UserProfileBffService**
  - `getUserProfile()` – fetch current user profile and account settings; used in `userProfileInitializer`.

- **PermissionBffService**
  - `getPermissions({ appId, productName })` – load permissions for an app/product; used in `RoutesService.updatePermissions` and `PermissionProxyService` to populate `PermissionsTopic`.

- **ParameterBffService**
  - `getParameters(request: GetParametersRequest)` – load application parameters per product/app; used in `ParametersService` and published via `ParametersTopic`.

- **IconBffService**
  - `findIconsByNamesAndRefId(refId: string, { names: string[] })` – fetch theme-specific SVG icons; used in `ThemeIconLoaderService` to maintain the `window.onecxIcons` cache and inject CSS.

These APIs, combined with direct `HttpClient` calls for theme assets (favicons, CSS) and history/topic wiring, form the core of how Shell orchestrates configuration, layout, theming, and security across all microfrontends.

This means other applications can consume Shell’s remote components (e.g., shell toast) if desired.

### 9.2 Preloaders for Angular Versions

Preloader utilities (preloader.utils.ts) and pre_loaders/angular-18/19/20:
- Define preloader configuration for Angular 18, 19, and 20.
- Use Module Federation to load small preloader remotes that ensure version-compatible Angular runtimes are available.
- Ensure that MFEs built with different Angular major versions can run side by side.

Practical effect:
- Platform can host MFEs on older Angular versions while Shell runs on a newer version.
- Preloaders abstract away version mismatches via isolated runtimes.

## 10. Deploying and Operating the Shell

### 10.1 Helm Values and Slots

helm/values.yaml for Shell UI:
- Declares the Docker image and routing path (e.g., /newShell/).
- Configures Keycloak client (onecx-shell-ui).
- Registers Shell UI as a microfrontend with remoteName onecx-shell and a remote component shell-toast.
- Defines all Shell slot specs (header regions, footer regions, extensions, shared library slots like onecx-search-config).

Operations team uses these values to:
- Wire Shell UI into the platform ingress.
- Register Shell slots and components in Kubernetes.

### 10.2 Terraform Product Definition

onecx-devops/terraform-scripts/products/onecx-shell/product.tf:
- Declares the onecx-shell product with:
  - onecx-shell (core product)
  - onecx-shell-bff (BFF)
  - onecx-shell-ui (UI)
- Provides homepage URLs pointing to documentation for each part.

This ensures Shell is treated as a first-class product in the platform’s devops catalog.

### 10.3 Local Development

For local work on Shell UI (typical workflow):
- Run npm install at 0_onecx-shell-ui.
- Start with nx serve --configuration=development --proxy-config=proxy.conf.js.
- Use start:local-env for integration with onecx-local-env when running more services.

Developers can:
- Mock workspace configuration or run workspace BFF locally.
- Develop and test Shell layout and slot behavior before integrating with full cluster.

## 11. Putting It All Together – End-to-End Scenario

Consider a real-world scenario: "Employee self-service portal".

1. Operations team defines a workspace "Employee Portal" with base URL /employee.
2. They register products: Bookmarks, User Profile, Help, Search, etc.
3. Each product provides a UI microfrontend (remoteEntry, exposed Module and/or Remote Components).
4. Workspace service stores menu structure, routes, and slots binding (e.g., logo, search, profile menu in header).
5. Shell is deployed with correct Helm values and connected to workspace, permission, profile, and theme services.
6. Employee logs in:
   - Keycloak authenticates them.
   - Shell loads workspace config for /employee.
   - Shell sets theme and user preferences.
   - Shell builds dynamic routes for /employee/bookmark, /employee/profile, /employee/help, etc.
   - Shell renders header with logo, global search, and user menu remote components.
7. Employee uses portal:
   - Navigating between features loads MFEs on demand.
   - Permissions are enforced per product.
   - Layout and theme remain consistent.
   - Parameters and configuration are resolved centrally.
8. If a single product UI fails, Shell shows error page only for that feature while others continue to function.

From a developer’s perspective, implementing a new product means:
- Building backend (svc) and BFF.
- Building an Angular or React microfrontend that exposes ./Module and optionally components.
- Registering the product in Product Store and workspace configuration.
- The Shell automatically integrates it using the mechanisms described above.

## 12. Summary

The OneCX Shell is the central runtime composition engine of the OneCX platform. Technically, it:
- Bootstraps an Angular SPA with a rich APP_INITIALIZER chain.
- Authenticates users and initializes workspace, theme, user profile, configuration, parameters, and permissions.
- Dynamically builds and manages routes using Module Federation, enabling independent deployment of MFEs.
- Provides a flexible slot system to compose header/body/footer from remote components.
- Coordinates routing and state between MFEs via integration topics and history interception.
- Handles errors gracefully and keeps the platform usable even when individual products fail.
- Integrates with Helm and Terraform definitions so it fits into Kubernetes and DevOps workflows.

For developers new to OneCX, understanding the Shell’s responsibilities and extension points (routes, slots, topics, parameters, configuration, themes) is the key to building new products that plug into the platform cleanly.

Future expansions of this guide can dive into:
- Detailed examples of adding a new microfrontend to the workspace.
- Step-by-step walkthrough of implementing a remote component and binding it to a Shell slot.
- Deep dive into @onecx/angular-integration-interface and how Shell topics are consumed by MFEs.
