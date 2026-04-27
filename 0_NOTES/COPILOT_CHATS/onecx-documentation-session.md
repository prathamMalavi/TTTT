# OneCX Documentation Session

**Date:** February 19, 2026
**Topic:** Comprehensive OneCX Platform Documentation
**Status:** In Progress

## Session Overview
Creating comprehensive documentation for OneCX platform covering all features, components, and real-world use cases.

## Information Gathered

### Core Platform Components
1. **OneCX Shell** - Central orchestration layer
2. **Workspace Management** - Multi-workspace configuration
3. **Enterprise Application Store** - Application repository
4. **BFF (Backend for Frontend)** - Security and API gateway pattern
5. **Microservices Architecture** - Independent scalable services
6. **Microfrontends (MFE)** - Client-side integration
7. **Remote Components** - Reusable UI components

### Key Features Documented
1. **Theme Management** - Branding and customization
2. **Tenant Management** - Multi-tenancy support
3. **Permission Management** - RBAC and access control
4. **IAM Integration** - Identity management with Keycloak
5. **Kubernetes Operators** - Infrastructure automation
6. **Module Federation** - Runtime loading of microfrontends
7. **CI/CD Pipelines** - Automated deployment

### Documentation Files Created
- DEV_DOCS/ONECX/ - Technical documentation for developers
- CLIENT_DOCS/ONECX/ - User-focused documentation

## Key Findings

### Architecture Principles
- Microservices and microfrontend-based architecture
- Backend for Frontend (BFF) pattern
- API-first design with RESTful APIs
- Containerization with Docker and Kubernetes
- Cloud-native architecture

### Real-World Applications
- Multi-tenant enterprise platforms
- Scalable team collaboration
- Modular application development
- DevOps automation

### SHELL-Specific Notes (February 19, 2026)
- Shell UI project: `0_onecx-shell-ui` (Angular + Nx, module federation).
- Entry flow: `src/main.ts` preloads Angular version-specific preloaders, then imports `bootstrap.ts` which calls `bootstrapModule(AppModule, 'shell', environment.production)`.
- Shell responsibilities observed:
	- Loads workspace configuration from Shell BFF (`WorkspaceConfigBffService.loadWorkspaceConfig`) and publishes it into `AppStateService.currentWorkspace$`.
	- Dynamically builds Angular routes for all workspace microfrontends via `RoutesService.init(...)` and `loadRemoteModule` (webpack module federation).
	- Publishes available remote components and named slots to `RemoteComponentsService.remoteComponents$`.
	- Initializes platform-wide services: `ConfigurationService`, `SlotService`, `ParametersService`, `ImageRepositoryService`, `ThemeIconLoaderService`, `PermissionProxyService`.
	- Manages user profile bootstrapping through `UserProfileBffService.getUserProfile()` and publishes profile to `UserService.profile$`.
	- Manages current location and cross-microfrontend routing using `CurrentLocationTopic` and `EventsTopic` (history `pushState`/`replaceState` wrapping).
- Slot system:
	- Layout component `PortalViewportComponent` wires header/body/footer regions using `ocx-shell-slot-group` and underlying `ocx-slot` elements.
	- Slots are named (e.g. `onecx-shell-header`, `onecx-shell-body-header`, `onecx-shell-footer`, `onecx-shell-extensions`) and are later populated by remote components registered in workspace configuration.
- Parameters and configuration:
	- `ParametersService` aggregates parameters for products/apps based on workspace routes and remote components, with caching in `localStorage` and publishing via `ParametersTopic`.
	- `ConfigurationService` is initialized from Shell, exposing platform-wide configuration (e.g. base href, auth, APIs) to all MFEs.
- Theming and branding:
	- `styleInitializer` lazily loads shell and legacy portal CSS using scope polyfills (`scope-polyfill/polyfill`) and `ThemeService`.
	- `PortalViewportComponent` resolves favicon/logo either from theme configuration or via `WorkspaceConfigBffService.getThemeFaviconByName`.
- Error handling and resilience:
	- Initialization errors are normalized by `initialization-error-handler.utils` and shown via `InitErrorModule` (`portal-initialization-error-page`).
	- Remote module loading failures in `RoutesService.onRemoteLoadError` redirect to `remote-loading-error-page` with a friendly message.
	- Workspace config and user profile calls use `retry` with backoff and navigate to the init error page when unrecoverable.
- Integration with wider platform:
	- Helm values for `onecx-shell-ui` define microfrontend registration (e.g. `shell-toast`) and named slots (`onecx-shell-header.start`, `onecx-shell-footer.end`, `onecx-shell-extensions`, shared slots like `onecx-search-config`).
	- Terraform product definition in `onecx-devops` declares `onecx-shell`, `onecx-shell-bff`, and `onecx-shell-ui` as a cohesive product set.

These notes will be reflected and expanded in DEV_DOCS/SHELL and CLIENT_DOCS/SHELL guides.

## Next Steps
1. Complete detailed technical documentation
2. Add real-world use case examples
3. Include code snippets and configuration examples
4. Create deployment guides

## Resources Scanned
- /root/onecx/repo-onecx/onecx-all/docs/
- Multiple application repositories (UI, BFF, SVC, Operator)
- Guide documentation for Angular, Quarkus, UI, etc.
