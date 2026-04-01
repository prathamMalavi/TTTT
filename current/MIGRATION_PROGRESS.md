# Migration Progress: Angular 18 → Angular 19

**Project:** appointment-planning-page  
**Branch:** feat/migrate-latest  
**Started:** 2026-04-01  
**Source doc:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/index.html

---

## Project State (baseline)

| Item | Current | Target |
|------|---------|--------|
| Angular | ~18.2.0 | ~19.x.x |
| @onecx/* | ^5.47.0 | ^6.x.y |
| @ngrx/* | ^18.0.2 | ^19.x.y |
| nx | 19.8.14 | via migrate |
| primeng | ^17.18.8 | ^19.0.0 |
| primeflex | ^3.3.1 | ^4.0.0 |
| primeicons | ^7.0.0 | ^7.0.0 (ok) |
| @ngx-translate/core | ^15.0.0 | ^16.0.0 |
| @ngx-translate/http-loader | ^8.0.0 | ^8.0.0 (ok) |
| ngrx-store-localstorage | ^18.0.0 | ^19.0.0 |
| TypeScript | ~5.5.4 | ~5.7.x |
| Nx workspace | YES | — |
| PrimeNG | YES | — |

---

## Phase A — Pre-Upgrade Preparation

> Complete all Phase A tasks before running the Angular/Nx upgrade.  
> After completing Phase A, run `npm run build` to verify no pre-migration issues remain.

---

### A.1 — Remove @onecx/keycloak-auth

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-keycloak-auth.html
- **Applicable:** YES — `@onecx/keycloak-auth` is in `package.json` (`^5.47.0`), used in `src/app/app.module.ts` (`KeycloakAuthModule`), and listed as a shared package in `webpack.config.js`
- **Description:**
  1. Uninstall `@onecx/keycloak-auth`: `npm uninstall @onecx/keycloak-auth`
  2. Remove `KeycloakAuthModule` import and usage from `src/app/app.module.ts`
  3. Remove `@onecx/keycloak-auth` entry from the `shared()` block in `webpack.config.js`
  4. Remove any other `@onecx/keycloak-auth` references across the codebase
  5. Do **not** add `keycloak-js` directly to `package.json` dependencies

---

### A.2 — Update Component Imports

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-component-imports.html
- **Applicable:** YES — multiple imports from `@onecx/portal-integration-angular` exist throughout the codebase
- **Description:** Reorganize imports to match the new v6 library structure:

  #### A.2.1 — Move imports from `@onecx/portal-integration-angular` → `@onecx/angular-accelerator`
  Affected symbols (check all files importing from `@onecx/portal-integration-angular`):
  - `ColumnGroupSelectionComponent`, `CustomGroupColumnSelectorComponent`
  - `DataLayoutSelectionComponent`, `DataListGridComponent`, `DataListGridSortingComponent`
  - `DataTableComponent`, `DataViewComponent`, `DiagramComponent`
  - `FilterViewComponent`, `GroupByCountDiagramComponent`, `InteractiveDataViewComponent`
  - `LifecycleComponent`, `PageHeaderComponent`, `SearchHeaderComponent`
  - `AdvancedDirective`, `IfBreakpointDirective`, `IfPermissionDirective`
  - `SrcDirective`, `TooltipOnOverflowDirective`
  - Evidence: `SearchHeaderComponent` imported in search component, `InteractiveDataViewComponent` likely used

  #### A.2.2 — Move imports from `@onecx/portal-integration-angular` → `@onecx/angular-utils`
  - `PortalPageComponent`
  - `PortalApiConfiguration` — **CONFIRMED** used in `src/app/shared/utils/apiConfigProvider.utils.ts`

  #### A.2.3 — Move imports from `@onecx/portal-integration-angular` → `@onecx/shell-core`
  - `PortalFooterComponent`, `HeaderComponent`, `PortalViewportComponent`
  - Check if any of these are used (not confirmed in current codebase)

  #### A.2.4 — Move imports from `@onecx/angular-accelerator` → `@onecx/angular-utils`
  - `HasPermissionChecker`, `HAS_PERMISSION_CHECKER` (injection token) — **CONFIRMED** used in two spec files
  - `AlwaysGrantPermissionChecker`
  - `TranslationCacheService`, `CachingTranslateLoader`, `TranslateCombinedLoader`

  #### A.2.5 — Remove completely deleted symbols
  - `DataLoadingErrorComponent` (`ocx-data-loading-error`) from `@onecx/angular-accelerator`
  - `IAuthService`, `AUTH_SERVICE` from `@onecx/angular-integration-interface` — **CONFIRMED**: `AUTH_SERVICE` used in `src/app/app.component.spec.ts`
  - `HelpPageAPIService`, `UserProfileAPIService`, `AppInlineProfileComponent`, `AnnouncementsApiService` from `@onecx/portal-integration-angular`

  #### A.2.6 — Update renamed functions in `@onecx/angular-integration-interface`
  - Replace `provideAppServiceMock` with `provideAppStateServiceMock`

  #### A.2.7 — Update renamed functions in `@onecx/ngrx-accelerator`
  - Replace `filterForOnlyQueryParamsChanged` → `filterOutOnlyQueryParamsChanged`
  - Replace `filterForQueryParamsChanged` → `filterOutQueryParamsHaveNotChanged`
  - Note: `filterForNavigatedTo` is still used in effects — verify it is not renamed

  #### A.2.8 — Remote components (now separate OneCX apps)
  Remove imports for: `HelpItemEditorComponent`, `NoHelpItemComponent`, `AnnouncementBannerComponent`, `PortalMenuComponent`, `PortalMenuHorizontalComponent`, `UserAvatarComponent` — check if any are used and replace with `<ocx-slot>` pattern if needed

---

### A.3 — Replace Removed Components

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-new-components.html
- **Applicable:** PARTIALLY — `ocx-page-content` (PageContentComponent) confirmed in use

  #### A.3.1 — Replace DataViewControlsComponent → InteractiveDataViewComponent
  - **Applicability:** NEEDS CHECK — search for `DataViewControlsComponent` or `ocx-data-view-controls`

  #### A.3.2 — Replace PageContentComponent → OcxContentComponent or OcxContentContainerComponent
  - **Applicable:** YES — `<ocx-page-content>` used in `src/app/appointment-planning-group/pages/appointment-planning-group-details/appointment-planning-group-details.component.html` (lines 35, 71)
  - Replace `<ocx-page-content>` with `<ocx-content>` or `<ocx-content-container>` as appropriate
  - Update imports in the corresponding `.ts` module file

  #### A.3.3 — Replace SearchCriteriaComponent → SearchHeaderComponent
  - **Applicable:** NOT APPLICABLE — project already uses `SearchHeaderComponent`

  #### A.3.4 — Replace ButtonDialogComponent → OcxDialogInlineComponent
  - **Applicability:** NEEDS CHECK — search for `ButtonDialogComponent` or `ocx-button-dialog`

---

### A.4 — Adjust Packages in Webpack Config

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/adjust-packages-in-webpack-config.html
- **Applicable:** YES — `webpack.config.js` contains `@onecx/keycloak-auth` and `@onecx/portal-integration-angular` in the `shared()` block
- **Description:**
  1. Remove `@onecx/keycloak-auth` entry from the `shared()` block (also covered by A.1 but must be done here too)
  2. Remove `@onecx/portal-integration-angular` entry from the `shared()` block in `webpack.config.js` (this package is removed in v6)
  3. Ensure any new packages introduced as replacements (e.g. `@onecx/angular-accelerator`, `@onecx/angular-utils`) are listed if they need to be shared

---

### A.5 — Adjust Standalone Mode

- **Status:** `[-]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/adjust-standalone-mode.html
- **Applicable:** NOT APPLICABLE — `@onecx/standalone-shell` is not present in `package.json`; project uses standard NgModule setup

---

### A.6 — Remove MenuService

- **Status:** `[-]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-menuservice.html
- **Applicable:** NOT APPLICABLE — no `MenuService` usage found in the codebase

---

### A.7 — Update Translations

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-translations.html
- **Applicable:** YES — `translateServiceInitializer` from `@onecx/portal-integration-angular` is used in `src/app/app.module.ts`; `TranslateService` used in multiple files
- **Description:**
  1. Review changes to translation initialization as `translateServiceInitializer` may have moved or changed its API in v6
  2. Ensure `@ngx-translate/core` usage aligns with v6 expectations
  3. Check if any translation loader setup needs updating per v6 docs

---

### A.8 — Pre-migration Build Verification

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/index.html
- **Applicable:** YES — mandatory gate before Phase B
- **Description:** Run `npm run build` and ensure it completes without errors. Fix any remaining compilation issues before proceeding with the Angular/Nx upgrade.

---

## Phase B — Core Angular / Nx Upgrade

> Do NOT execute Phase B until all Phase A tasks are complete and `npm run build` passes.  
> This phase is performed by the developer (or explicitly triggered).

---

### B.1 — Update @onecx/nx-plugin to ^6

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/upgrade-nx-angular-version.html
- **Applicable:** YES — Nx workspace, current `@onecx/nx-plugin` is `5.0.0`
- **Description:** `npm install @onecx/nx-plugin@^6`

---

### B.2 — Run NX Migration (Angular + TypeScript upgrade)

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/upgrade-nx-angular-version.html
- **Applicable:** YES — Nx workspace
- **Description:**
  ```bash
  nx migrate 20.4.0 --interactive
  ```
  Apply all proposed updates up to **Angular 19.1** and **TypeScript 5.7**.  
  Reference: [Angular NX Version Matrix](https://nx.dev/docs/technologies/angular/guides/angular-nx-version-matrix)

---

### B.3 — Update Package Versions in package.json

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/upgrade-nx-angular-version.html
- **Applicable:** YES
- **Description:** After `nx migrate`, manually update the remaining packages:
  1. Update all `@onecx/*` packages to latest `6.x.y`: `npm install @onecx/<package-name>@^6`
  2. Remove `@onecx/keycloak-auth` (handled in A.1)
  3. Remove `@onecx/portal-layout-styles`
  4. Remove `@onecx/portal-integration-angular`
  5. Update packages per Required Package Updates table (see C.1)
  6. If peer dependency conflicts persist: `rm -rf node_modules package-lock.json .angular dist ~/.angular/cache && npm cache clean --force && npm install`

---

### B.4 — Run npm install

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/upgrade-nx-angular-version.html
- **Applicable:** YES
- **Description:** `npm install` — resolve any peer dependency errors and update affected packages to compatible versions.

---

### B.5 — Run NX Migration Scripts

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/upgrade-nx-angular-version.html
- **Applicable:** YES
- **Description:**
  ```bash
  nx migrate --run-migrations
  ```
  This applies the generated migration scripts from the `nx migrate` step.

---

## Phase C — Post-Upgrade Cleanup

> Execute Phase C only after Phase B is complete (Angular 19 + OneCX libs v6 installed).

---

### C.1 — Required Package Updates

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-packages.html
- **Applicable:** YES — several packages need specific version bumps
- **Description:** Install all packages at their Angular 19-compatible versions:
  ```bash
  npm install @ngx-translate/core@^16.0.0 \
    @ngx-translate/http-loader@^8.0.0 \
    primeng@^19.0.0 \
    primeicons@^7.0.0 \
    primeflex@^4.0.0 \
    ngrx-store-localstorage@^19.0.0 \
    ngx-build-plus@^19.0.0

  npm install @ngrx/store@^19 @ngrx/effects@^19 @ngrx/router-store@^19 \
    @ngrx/component@^19 @ngrx/store-devtools@^19

  npm install @onecx/accelerator@^6 @onecx/angular-accelerator@^6 \
    @onecx/angular-auth@^6 @onecx/angular-integration-interface@^6 \
    @onecx/angular-remote-components@^6 @onecx/angular-webcomponents@^6 \
    @onecx/integration-interface@^6 @onecx/ngrx-accelerator@^6 \
    @onecx/nx-plugin@^6 @onecx/portal-integration-angular@^6
  ```
  > Do NOT add `keycloak-js` directly to `package.json`.

  | Package | From | To |
  |---------|------|----|
  | primeng | ^17.18.8 | ^19.0.0 |
  | primeflex | ^3.3.1 | ^4.0.0 |
  | primeicons | ^7.0.0 | ^7.0.0 (already ok) |
  | @ngx-translate/core | ^15.0.0 | ^16.0.0 |
  | @ngx-translate/http-loader | ^8.0.0 | ^8.0.0 (already ok) |
  | ngrx-store-localstorage | ^18.0.0 | ^19.0.0 |
  | @ngrx/* | ^18.0.2 | ^19.x.y |
  | @onecx/* | ^5.47.0 | ^6.x.y |

---

### C.2 — Update FilterType Value

- **Status:** `[-]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-filtertype-value.html
- **Applicable:** NOT APPLICABLE — no `FilterType` enum usage found in the codebase

---

### C.3 — Update ConfigurationService Usage

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-configuration-service-usage.html
- **Applicable:** YES — `ConfigurationService` is used in:
  - `src/app/app.module.ts` (line 20, 73)
  - `src/app/appointment-planning-page-app.remote.module.ts` (line 30, 86)
  - `src/app/shared/utils/apiConfigProvider.utils.ts` (indirectly via import from `@onecx/portal-integration-angular`)
- **Description:** Review the v6 API changes for `ConfigurationService` and update usages accordingly. Check if constructor injection pattern or factory `deps` array needs updating.

---

### C.4 — Update Component Imports after Migration

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-component-import-post-migration.html
- **Applicable:** YES — remaining imports from `@onecx/portal-integration-angular` that survived Phase A still need to be resolved with v6 packages installed
- **Description:** After v6 is installed, perform a final sweep for any remaining `@onecx/portal-integration-angular` imports and update them to the correct v6 package. This includes any symbols not explicitly listed in A.2 that were missed.

---

### C.5 — Update Portal API Configuration Object Parameters

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-portal-api-configuration.html
- **Applicable:** YES — `PortalApiConfiguration` used in `src/app/shared/utils/apiConfigProvider.utils.ts`; import source changes from `@onecx/portal-integration-angular` → `@onecx/angular-utils`
- **Description:**
  1. Update import of `PortalApiConfiguration` to `@onecx/angular-utils`
  2. Review if the constructor signature or object parameter shape has changed in v6
  3. Update `apiConfigProvider.utils.ts` accordingly

---

### C.6 — Remove @onecx/portal-layout-styles

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-portal-layout-styles.html
- **Applicable:** YES — `@onecx/portal-layout-styles: ^5.47.0` in `package.json` dependencies
- **Description:**
  1. Run `npm uninstall @onecx/portal-layout-styles`
  2. Remove any `@import` or `@use` statements referencing `@onecx/portal-layout-styles` in SCSS files (check `src/styles.scss` and component SCSS files)
  3. Ensure no style references remain in `nx.json`, `project.json`, or angular build config

---

### C.7 — Remove addInitializeModuleGuard()

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-add-initialize-module-guard.html
- **Applicable:** YES — `addInitializeModuleGuard` used in:
  - `src/app/app-routing.module.ts` (lines 4, 19)
  - `src/app/appointment-planning-page-app.remote.module.ts` (lines 42, 54)
  - `src/app/appointment-planning-group/appointment-planning-group.module.ts` (lines 9, 45)
- **Description:**
  1. Remove import of `addInitializeModuleGuard` from `@onecx/angular-integration-interface`
  2. Replace `RouterModule.forRoot(addInitializeModuleGuard(routes))` with `RouterModule.forRoot(routes)` (or equivalent v6 pattern)
  3. Repeat for all `forChild` and `forRoot` uses

---

### C.8 — Remove PortalCoreModule

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-portal-core-module.html
- **Applicable:** YES — `PortalCoreModule` used in:
  - `src/app/app.module.ts` (lines 22, 57 — `PortalCoreModule.forRoot(...)`)
  - `src/app/appointment-planning-page-app.remote.module.ts` (lines 32, 53 — `PortalCoreModule.forMicroFrontend()`)
  - `src/app/appointment-planning-group/appointment-planning-group.module.ts` (lines 10, 44 — `PortalCoreModule.forMicroFrontend()`)
  - `src/app/app.component.spec.ts` (lines 7, 77 — `PortalCoreModule.forRoot('test')`)
- **Description:**
  1. Remove `PortalCoreModule` import from all modules and spec files
  2. Replace with the v6 equivalent providers/modules (per official doc — likely a `provide*` function or alternative module)
  3. Update spec files to use appropriate mock/stub

---

### C.9 — Replace BASE_URL Injection Token

- **Status:** `[-]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-base-url.html
- **Applicable:** NOT APPLICABLE — no `BASE_URL` token usage found in the codebase

---

### C.10 — Update Theme Service Usage

- **Status:** `[-]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-theme-service.html
- **Applicable:** NOT APPLICABLE — no `ThemeService` usage found in the codebase

---

### C.11 — Add Webpack Plugin for PrimeNG

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/add-required-plugin-to-primeng.html
- **Applicable:** YES — `primeng` is a dependency and is listed in the `shared()` block in `webpack.config.js`
- **Description:** Add the required PrimeNG webpack plugin to `webpack.config.js` and/or `webpack.prod.config.js` as specified in the official documentation. This ensures proper tree-shaking and build compatibility with PrimeNG v19.

---

### C.12 — Add Webpack Plugin for Angular Material

- **Status:** `[-]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/add-angular-material-plugin.html
- **Applicable:** NOT APPLICABLE — `@angular/material` is not a dependency (only `@angular/cdk` is present)

---

### C.13 — Provide ThemeConfig

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/provide-theme-config.html
- **Applicable:** NEEDS VERIFICATION — check if the v6 bootstrap requires `provideThemeConfig()` in app module providers
- **Description:** Check the official documentation and verify whether `provideThemeConfig()` must be added to `AppModule` or `app.module.ts` provider array. Add if required.

---

### C.14 — PrimeNG v17 → v19 Migration

- **Status:** `[ ]`
- **Source:** https://primeng.org/migration/v19 (PrimeNG official docs)
- **Applicable:** YES — current version `primeng: ^17.18.8`, target `primeng: ^19.0.0`
- **Description:**
  1. **New theming architecture**: PrimeNG v19 introduces a design token system; legacy theming is deprecated. Update any direct theme CSS class overrides to use design tokens.
  2. **Component API changes**: Review all PrimeNG component usages for breaking API changes (see `https://primeng.org/migration/v19`)
  3. **primeflex upgrade**: `^3.3.1` → `^4.0.0` — review any primeflex utility classes that may have been renamed
  4. **primeicons**: already at `^7.0.0` (compatible)
  5. Note: After Angular 19 installation, if "Component is standalone, and cannot be declared in an NgModule" error appears, add `standalone: false` to the component declaration

---

### C.15 — Final Verification

- **Status:** `[ ]`
- **Source:** https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/index.html
- **Applicable:** YES — mandatory final gate
- **Description:**
  ```bash
  npm run build
  npm run test -- --watch=false
  ```
  Report results. Fix any remaining issues before declaring migration complete.

---

## Summary

| Phase | Tasks | Applicable | Skipped |
|-------|-------|------------|---------|
| A (pre-upgrade) | 8 | 6 | 2 (A.5, A.6) |
| B (core upgrade) | 5 | 5 | 0 |
| C (post-upgrade) | 15 | 10 | 5 (C.2, C.9, C.10, C.12) + 1 needs-check |
| **Total** | **28** | **21** | **7** |

### Task Tree

```
Phase A — Pre-upgrade preparation
├─ A.1  Remove @onecx/keycloak-auth                          [ ]
├─ A.2  Update Component Imports                             [ ]
│   ├─ A.2.1  Move to @onecx/angular-accelerator
│   ├─ A.2.2  Move to @onecx/angular-utils
│   ├─ A.2.3  Move to @onecx/shell-core
│   ├─ A.2.4  Move HAS_PERMISSION_CHECKER etc. to @onecx/angular-utils
│   ├─ A.2.5  Remove deleted symbols (AUTH_SERVICE, IAuthService, etc.)
│   ├─ A.2.6  Replace provideAppServiceMock
│   ├─ A.2.7  Rename filterForOnlyQueryParamsChanged / filterForQueryParamsChanged
│   └─ A.2.8  Remote components cleanup
├─ A.3  Replace Removed Components                           [ ]
│   ├─ A.3.1  DataViewControlsComponent → (check applicability)
│   ├─ A.3.2  PageContentComponent → OcxContentComponent    [ ]  ← CONFIRMED
│   ├─ A.3.3  SearchCriteriaComponent → SearchHeaderComponent[-]  ← already done
│   └─ A.3.4  ButtonDialogComponent → (check applicability)
├─ A.4  Adjust Packages in Webpack Config                    [ ]
├─ A.5  Adjust Standalone Mode                               [-]  ← N/A
├─ A.6  Remove MenuService                                   [-]  ← N/A
├─ A.7  Update Translations                                  [ ]
└─ A.8  Pre-migration build verification                     [ ]

Phase B — Core Angular/Nx upgrade (⚠ developer action)
├─ B.1  Update @onecx/nx-plugin to ^6                       [ ]
├─ B.2  nx migrate 20.4.0 --interactive                     [ ]
├─ B.3  Update package versions in package.json             [ ]
├─ B.4  npm install                                          [ ]
└─ B.5  nx migrate --run-migrations                         [ ]

Phase C — Post-upgrade cleanup
├─ C.1   Required Package Updates (primeng/ngrx/onecx/etc.) [ ]
├─ C.2   Update FilterType Value                            [-]  ← N/A
├─ C.3   Update ConfigurationService Usage                  [ ]
├─ C.4   Update Component Imports after Migration           [ ]
├─ C.5   Update Portal API Configuration parameters         [ ]
├─ C.6   Remove @onecx/portal-layout-styles                 [ ]
├─ C.7   Remove addInitializeModuleGuard()                  [ ]
├─ C.8   Remove PortalCoreModule                            [ ]
├─ C.9   Replace BASE_URL injection token                   [-]  ← N/A
├─ C.10  Update Theme Service usage                         [-]  ← N/A
├─ C.11  Add Webpack Plugin for PrimeNG                     [ ]
├─ C.12  Add Webpack Plugin for Angular Material            [-]  ← N/A
├─ C.13  Provide ThemeConfig                                [ ]  ← needs verify
├─ C.14  PrimeNG v17→v19 migration                          [ ]
└─ C.15  Final verification (build + test)                  [ ]
```
