# OneCX Libs – Copilot Session Notes

Started: 2026-02-19

## Scope
- Document OneCX portal UI libs (0_onecx-portal-ui-libs) and their usage across the workspace.
- Focus on Angular and integration libs: accelerator, integration-interface, angular-integration-interface, angular-auth, angular-utils, angular-remote-components, angular-standalone-shell, ngrx-accelerator, etc.

## Initial Findings
- Central workspace for libs: 0_onecx-portal-ui-libs.
- High-level overview: dev-docs/general/overview.adoc.
- Topic system and guards: dev-docs/topics/*.adoc and dev-docs/guards/*.adoc.

## Workspace Usage Samples (high level)
- onecx-welcome-ui: uses @onecx/angular-utils for translations, @onecx/angular-integration-interface for APP_CONFIG and UserService, and PortalCoreModule for integration.
- onecx-welcome-ui remote module: uses AngularAuthModule, addInitializeModuleGuard, SlotService, and PortalApiConfiguration for microfrontend integration.
- onecx-workspace-ui vertical main menu: uses AngularRemoteComponentsModule, AppStateService, ShellCapabilityService, EventsTopic, and SlotService to render dynamic workspace-aware menus based on current location and workspace topics.
- 0_onecx-shell-ui app.module: wires together AppStateService, RemoteComponentsService, ThemeService, UserService, SlotService, OnecxTranslateLoader, Theme configuration, and multiple initializers that publish to topics like CurrentWorkspaceTopic and CurrentLocationTopic.

## Libs Coverage Progress
- accelerator: documented Topic pattern and integration-interface topics in Dev Guide.
- integration-interface: summarized major topics (workspace, location, loading, errors, events, auth) in Dev Guide.
- angular-integration-interface: documented AppStateService and PortalMessageService patterns with real workspace/welcome usage examples.
- angular-auth: documented TokenInterceptor and AngularAuthModule usage from shell and remote modules.
- angular-utils: documented translation and permission patterns, referencing welcome and shared components.
- angular-remote-components: documented remote component & slot pattern using workspace vertical menu.
- angular-accelerator: scanned index.ts (data-table, content, page-header, dialog, error component, utilities) and workspace/bookmark/parameter UIs for Action/DataTable usage.
- angular-testing: scanned index.ts and usages in component specs & testing harnesses (used heavily to test angular-accelerator and angular-utils components).
- angular-webcomponents: scanned index.ts and usages for bootstrapModule, createAppEntrypoint, initializeRouter, startsWith, and bootstrapRemoteComponent across remote modules and bootstrap.ts files.
- ngrx-accelerator: scanned index.ts for NgRx effects/selectors/local-storage helpers.
- ngrx-integration-interface: scanned index.ts for store connectors tying NgRx stores to integration topics.

(Next steps: add explicit sections for angular-accelerator, angular-testing, angular-webcomponents, ngrx-accelerator, ngrx-integration-interface, and angular-standalone-shell into the Dev/Client guides with patterns and examples.)

(Notes will be expanded as more libs and usage patterns are discovered.)
