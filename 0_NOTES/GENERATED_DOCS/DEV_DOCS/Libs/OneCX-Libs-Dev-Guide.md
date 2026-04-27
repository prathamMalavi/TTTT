# OneCX Libs – Developer Guide

> Technical documentation for developers integrating with OneCX UI libraries.

## 1. Introduction

This document explains the core OneCX UI libraries, how they are wired together in the OneCX workspace, and how to use them when building micro frontends (MFEs), remote components, or standalone Angular apps.

It focuses on:
- `accelerator` and `integration-interface` (core topics/event bus)
- `angular-integration-interface` (Angular services over topics)
- `angular-auth` (authentication integration)
- `angular-utils` (i18n, permissions, portal helpers)
- `angular-remote-components` and related webcomponents helpers
- `angular-standalone-shell`
- `ngrx-accelerator` / `ngrx-integration-interface`

Real-world patterns and examples from the workspace will be added and refined over time.

## 2. Core Event Bus: accelerator and integration-interface

The `accelerator` library exposes a generic `Topic<T>` abstraction that is used as a browser-wide event bus. The `integration-interface` library builds on top of this with concrete, versioned topics representing shared portal state (workspace, location, messages, theme, etc.).

### 2.1 Topic pattern

```ts
import { Topic } from '@onecx/accelerator'

interface WorkspaceNotification {
	type: 'created' | 'updated'
	workspaceName: string
}

const workspaceEvents = new Topic<WorkspaceNotification>('workspace-events', 1)

workspaceEvents.subscribe((event) => {
	console.log('Workspace event', event.workspaceName, event.type)
})

await workspaceEvents.publish({ type: 'created', workspaceName: 'sales-portal' })
```

- **Why?**  Topics decouple micro frontends and the shell so that teams only need to agree on topic names and payload shapes instead of direct service contracts. This is essential in a portal where Angular, React, and webcomponents coexist.
- **What?**  `Topic<T>` represents a named, versioned message stream. Internally it uses `window.postMessage` to distribute state updates across frames and browser contexts.
- **How?**  Instantiate a topic with a name and version, subscribe to receive updates, and call `publish` to broadcast a new value. The implementation ensures late subscribers can synchronize via `TopicGet` / `TopicNext` messages before resolving the `publish` promise.
- **When?**  Use this pattern for cross-app portal state (workspace, theme, loading, messages), not for local component state. If multiple MFEs must react to the same event, model it as a topic.

### 2.2 Predefined topics (integration-interface)

`integration-interface` defines a catalogue of concrete topic classes so apps do not invent their own names. Examples:

- `CurrentWorkspaceTopic` – active workspace (name, baseUrl, routes, etc.).
- `CurrentLocationTopic` – the current URL inside the portal.
- `GlobalLoadingTopic` – global loading indicator state.
- `GlobalErrorTopic` – cross-application error messages.
- `EventsTopic` / `NavigatedEventPayload` – high-level navigation events.
- `IsAuthenticatedTopic` – overall user authentication status.

```ts
import { CurrentWorkspaceTopic } from '@onecx/integration-interface'

const currentWorkspace$ = new CurrentWorkspaceTopic()

currentWorkspace$.subscribe((ws) => {
	console.log('Now in workspace', ws?.workspaceName)
})

await currentWorkspace$.publish({
	baseUrl: 'https://portal.example.com/sales',
	workspaceName: 'sales',
	portalName: 'onecx',
	routes: [],
	homePage: '/overview',
	microfrontendRegistrations: [],
	displayName: 'Sales Portal',
})
```

- **Why?**  Standard topics ensure all MFEs and the shell share the same vocabulary for portal concepts like “current workspace” or “current URL”, reducing integration bugs.
- **What?**  These classes wrap `Topic<T>` and fix the name, version, and payload type, so callers cannot accidentally publish incompatible data.
- **How?**  Construct the topic class, subscribe to it, and call `publish` with payloads defined in the integration-interface models. The shell and other apps can react to the same events.
- **When?**  Use these predefined topics whenever you need portal-level state; only define custom topics for feature-specific needs that are not already covered.

## 3. Angular integration: angular-integration-interface

The `angular-integration-interface` library turns topics into Angular services and observables. This is what typical Angular MFEs depend on when they need access to OneCX shell state.

Key services include:

- `AppStateService` – exposes topics like `currentWorkspace$`, `currentLocation$`, `globalError$`, `globalLoading$`, `currentPage$`, `isAuthenticated$`.
- `UserService`, `ThemeService`, `WorkspaceService`, `RemoteComponentsService`, `PortalMessageService`, and more, each wrapping a subset of topics and helper logic.

### 3.1 Pattern: consuming AppStateService

```ts
import { inject, Injectable } from '@angular/core'
import { map } from 'rxjs'
import { AppStateService } from '@onecx/angular-integration-interface'

@Injectable({ providedIn: 'root' })
export class WorkspaceContextService {
	private readonly appState = inject(AppStateService)

	readonly workspaceName$ = this.appState.currentWorkspace$.pipe(
		map((ws) => ws.workspaceName),
	)

	readonly currentUrl$ = this.appState.currentLocation$.pipe(
		map((loc) => loc.url ?? '/'),
	)
}
```

- **Why?**  Using AppStateService centralizes access to shell state and avoids every app manually instantiating topic classes or reading `window.location` directly.
- **What?**  `WorkspaceContextService` adapts low-level portal state (workspace topic and location topic) into two simple observables for consumption by components.
- **How?**  The service injects AppStateService, then uses RxJS `map` to transform the raw topic payloads into the exact properties UI code needs (workspace name and URL).
- **When?**  Use this pattern whenever you build Angular features that depend on which workspace is active or which route is currently loaded (menus, dashboards, breadcrumbs, etc.).

### 3.2 Pattern: portal messages via PortalMessageService

```ts
import { inject, Injectable } from '@angular/core'
import { PortalMessageService } from '@onecx/angular-integration-interface'

@Injectable({ providedIn: 'root' })
export class WelcomeNotificationService {
	private readonly messages = inject(PortalMessageService)

	notifyImageDeleted(): void {
		this.messages.success({ summaryKey: 'ACTIONS.DELETE.SUCCESS' })
	}

	notifyImageDeleteError(): void {
		this.messages.error({ summaryKey: 'ACTIONS.DELETE.ERROR' })
	}
}
```

- **Why?**  Centralized messaging ensures success and error banners look and behave the same across all MFEs and can be handled by shared components if needed.
- **What?**  The service wraps generic `success` and `error` APIs in domain-specific methods like `notifyImageDeleted`.
- **How?**  It injects `PortalMessageService` and forwards translated message keys; under the hood, these are published on an integration topic and rendered by message components.
- **When?**  Use this whenever you want user-visible notifications (e.g. after create/update/delete operations) that respect portal-wide UX conventions.

## 4. Authentication: angular-auth

`angular-auth` provides Angular abstractions for authentication and token propagation (e.g. with Keycloak) and is used by the shell and MFEs.

Core pieces:

- `AngularAuthModule` – NgModule that wires auth providers.
- `AuthService` – interface with `init`, `getHeaderValues`, `logout`, `updateTokenIfNeeded`.
- `TokenInterceptor` – HTTP interceptor that appends auth headers.

### 4.1 Pattern: HTTP token injection via TokenInterceptor

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http'
import { TokenInterceptor } from '@onecx/angular-auth'

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withInterceptorsFromDi()),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true,
		},
	],
}
```

- **Why?**  To ensure every backend call automatically carries the correct authentication headers, without each feature duplicating token logic.
- **What?**  This configuration adds `TokenInterceptor` to the Angular HTTP pipeline so that requests are enriched before they leave the app.
- **How?**  The interceptor waits until `AppStateService.isAuthenticated$` is initialized, calls `authService.updateTokenIfNeeded()`, then adds headers returned by `authService.getHeaderValues()` to the HTTP request.
- **When?**  Use this pattern in any OneCX Angular app that talks to secured BFFs or services as part of the authenticated portal session.

### 4.2 Pattern: using AngularAuthModule in remote modules

```ts
import { NgModule } from '@angular/core'
import { AngularAuthModule } from '@onecx/angular-auth'

@NgModule({
	imports: [
		AngularAuthModule,
		// other imports
	],
})
export class OneCXWelcomeModule {}
```

- **Why?**  To reuse shared auth setup (e.g. Keycloak integration) across many microfrontends without repeating configuration.
- **What?**  The module pulls in DI providers and interceptors defined by angular-auth so the remote module participates in the same auth session as the shell.
- **How?**  Import `AngularAuthModule` in the remote module root; the shell bootstrapping ensures auth is initialized before MFEs rely on it.
- **When?**  Use this in any remote module that should respect the user’s login state and access controlled APIs.

## 5. Translations, permissions, and helpers: angular-utils

`angular-utils` focuses on making Angular apps portal-aware by providing translation loaders, permission helpers, and convenience components.

### 5.1 Pattern: i18n with createTranslateLoader

```ts
import { HttpClient } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { createTranslateLoader, provideTranslationPathFromMeta } from '@onecx/angular-utils'

@NgModule({
	imports: [
		TranslateModule.forRoot({
			isolate: true,
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient],
			},
		}),
	],
	providers: [
		provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
	],
})
export class WelcomeAppModule {}
```

- **Why?**  To share a single translation loading strategy between the shell and MFEs, while still letting each app deliver its own translation JSON files.
- **What?**  This config uses a OneCX-specific loader that merges multiple translation paths into one source for ngx-translate.
- **How?**  `provideTranslationPathFromMeta` registers the local i18n folder; `createTranslateLoader` internally builds a `OnecxTranslateLoader` that discovers all paths, wraps them in caching loaders, and returns a TranslateLoader instance.
- **When?**  Use this wherever you want OneCX-consistent i18n behavior (language switching, shared keys, caching) in an Angular app.

### 5.2 Pattern: permission checks in templates

```ts
import { Component, inject } from '@angular/core'
import { PermissionService } from '@onecx/angular-utils'

@Component({
	selector: 'app-secure-actions',
	template: `
		<button *ngIf="canEdit$ | async" type="button">
			Edit configuration
		</button>
	`,
})
export class SecureActionsComponent {
	private readonly permissions = inject(PermissionService)

	readonly canEdit$ = this.permissions.hasPermission$('WELCOME_CONFIG_EDIT')
}
```

- **Why?**  To keep authorization checks consistent and centralized instead of hard-coding roles in many components.
- **What?**  The component exposes an observable flag `canEdit$` that controls whether a sensitive action button is visible.
- **How?**  It injects `PermissionService`, which reads portal-level permissions (via topics and user profile) and exposes convenience APIs like `hasPermission$`.
- **When?**  Use this whenever UI elements (buttons, menu entries, pages) should only be visible to users with certain permissions.

## 6. Remote components and slots: angular-remote-components

`angular-remote-components` enables dynamic, pluggable UI via slots and remote component contracts.

```ts
import { Component, Inject, Input } from '@angular/core'
import { ReplaySubject } from 'rxjs'
import {
	AngularRemoteComponentsModule,
	BASE_URL,
	RemoteComponentConfig,
	ocxRemoteComponent,
} from '@onecx/angular-remote-components'

@Component({
	selector: 'app-vertical-main-menu',
	templateUrl: './vertical-main-menu.component.html',
	standalone: true,
	imports: [AngularRemoteComponentsModule],
	providers: [{ provide: BASE_URL, useValue: new ReplaySubject<string>(1) }],
})
export class VerticalMainMenuComponent implements ocxRemoteComponent {
	constructor(@Inject(BASE_URL) private readonly baseUrl: ReplaySubject<string>) {}

	@Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
		this.baseUrl.next(config.baseUrl)
	}
}
```

- **Why?**  To allow the shell to supply runtime configuration (base URLs, context) to menu/logo/widgets loaded into slots without tight coupling.
- **What?**  This is a remote component that implements the OneCX remote contract and reacts to configuration supplied by the shell.
- **How?**  The shell binds a `RemoteComponentConfig` to the `ocxRemoteComponentConfig` input; the component writes `config.baseUrl` into a shared `ReplaySubject` so that HTTP clients and other services can use it.
- **When?**  Use this pattern when building pluggable UI fragments that will live inside shell-defined slots (navigation menus, toolbars, dashboards, etc.).

## 7. Shell reference wiring (0_onecx-shell-ui)

The shell in `0_onecx-shell-ui` ties these libs together: it configures translations, initializes topics (workspace, user profile, remote components), and publishes navigation events into `CurrentLocationTopic`. Studying [0_onecx-shell-ui/src/app/app.module.ts](0_onecx-shell-ui/src/app/app.module.ts) gives a full, real-world view of how OneCX expects MFEs and remote components to behave at runtime.

## 8. UI building blocks: angular-accelerator

`angular-accelerator` is a UI toolkit built on top of PrimeNG and OneCX conventions. Its public API (see 0_onecx-portal-ui-libs/libs/angular-accelerator/src/index.ts) includes:

- Layout & content components: `ContentComponent`, `ContentContainerComponent`.
- Data display components: `DataTableComponent`, `DataListGridComponent`, `DataViewComponent`, diagrams, filter views.
- Page chrome: `PageHeaderComponent`, `SearchHeaderComponent`, breadcrumb support.
- Dialogs and error components: `DialogInlineComponent`, `DialogFooterComponent`, `GlobalErrorComponent`.
- Utilities and models: `Action`, `DataAction`, `DataTableColumn`, `BreadcrumbService`, export services.

### 8.1 Pattern: action-driven page headers

Many MFEs model toolbar buttons as `Action` objects that are rendered by `PageHeaderComponent`. For example, bookmark and welcome configuration screens use this pattern.

```ts
import { Component } from '@angular/core'
import { Observable, of } from 'rxjs'
import { Action } from '@onecx/angular-accelerator'

@Component({
	selector: 'app-orders-page',
	template: `
		<ocx-page-header [actions]="actions$ | async"></ocx-page-header>
		<!-- page body here -->
	`,
})
export class OrdersPageComponent {
	readonly actions$: Observable<Action[]> = of([
		{
			id: 'refresh',
			label: 'ACTIONS.REFRESH',
			icon: 'pi pi-refresh',
			handler: () => this.reload(),
		},
	])

	private reload(): void {
		// trigger data reload
	}
}
```

- **Why?**  Representing toolbar buttons as data (`Action` objects) makes it easy to configure, test, and reuse them across multiple pages, while the page header component ensures a consistent look-and-feel.
- **What?**  `OrdersPageComponent` exposes an observable list of `Action` objects; `PageHeaderComponent` renders them as buttons with icons and labels.
- **How?**  The component creates an `Action[]` containing IDs, translation keys, optional icons, and click handlers, wraps it in an observable, and binds it to the `ocx-page-header` input.
- **When?**  Use this pattern whenever a page has a toolbar of contextual actions (refresh, create, export, etc.) and you want them to follow OneCX visual and behavioral standards.

### 8.2 Pattern: data tables using DataTableColumn

Data-heavy apps such as Bookmark UI use `DataTableColumn` models to configure reusable tables.

```ts
import { DataTableColumn } from '@onecx/angular-accelerator'

export const BOOKMARK_COLUMNS: DataTableColumn[] = [
	{ field: 'name', headerKey: 'BOOKMARK.NAME', sortable: true },
	{ field: 'url', headerKey: 'BOOKMARK.URL', sortable: false },
]
```

- **Why?**  Declarative column definitions keep table configuration in one place and allow the same table component to be reused for many entities.
- **What?**  `BOOKMARK_COLUMNS` describes how bookmark properties map to table columns, including labels and sorting capabilities.
- **How?**  Features import this constant and pass it into an angular-accelerator data-table or list-grid component, which renders headers, sort icons, and cells accordingly.
- **When?**  Use this whenever building tabular views where configuration may evolve (adding columns, toggling sortability) without rewriting templates.

## 9. Testing helpers: angular-testing

`angular-testing` provides harnesses and utilities to write reliable tests for OneCX UIs. Its index (0_onecx-portal-ui-libs/libs/angular-testing/src/index.ts) exports:

- Harnesses for PrimeNG components (`PButtonHarness`, `PTableCheckboxHarness`, `PDialogHarness`, etc.).
- Generic DOM harnesses (`DivHarness`, `ButtonHarness`, `SpanHarness`, `TableRowHarness`).
- Utilities like `waitForDeferredViewsToBeRendered` and `fake-translate-loader`.

### 9.1 Pattern: testing data tables with PTableCheckboxHarness

```ts
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { PTableCheckboxHarness } from '@onecx/angular-testing'

it('selects a row in the table', async () => {
	const loader = TestbedHarnessEnvironment.loader(fixture)
	const checkboxes = await loader.getAllHarnesses(PTableCheckboxHarness)

	await checkboxes[0].toggle()

	expect(component.selection.length).toBe(1)
})
```

- **Why?**  Harnesses let tests interact with UI components in a semantic way ("toggle checkbox") instead of relying on brittle CSS selectors.
- **What?**  The test locates all table row checkboxes and toggles the first one, then asserts that the component’s selection model updated.
- **How?**  It uses the Angular CDK test harness loader to find `PTableCheckboxHarness` instances and calls the harness API; the harness hides DOM details and test setup complexity.
- **When?**  Use these harnesses in component tests that exercise OneCX/PrimeNG-based UIs, especially data tables, dialogs, and menus.

## 10. Webcomponent bootstrapping: angular-webcomponents

`angular-webcomponents` provides utilities to expose Angular applications and components as webcomponents or remote shells. The main exports (0_onecx-portal-ui-libs/libs/angular-webcomponents/src/index.ts) include:

- `dynamic-app-id.utils` – ensures unique element IDs.
- `webcomponent-bootstrap.utils` – utilities such as `bootstrapModule` and `bootstrapRemoteComponent`.
- `webcomponent-router.utils` and `webcomponent-router-initializer.utils` – integration with Angular Router.
- `webcomponent-connector.utils` – glue code connecting guards and topics for embedded webcomponents.

### 10.1 Pattern: bootstrapping a remote Angular module

Remote modules like onecx-welcome-ui use `bootstrapModule` and routing helpers to expose themselves as embeddable components.

```ts
import { bootstrapModule } from '@onecx/angular-webcomponents'
import { OneCXWelcomeModule } from './app/onecx-welcome-remote.module'

bootstrapModule(OneCXWelcomeModule, 'ocx-welcome-module')
```

- **Why?**  This allows an Angular MFE to be loaded dynamically by the shell as a webcomponent-like entrypoint, without hard-coding bootstrapping in the host.
- **What?**  `bootstrapModule` wires Angular bootstrapping to a custom element name (`ocx-welcome-module`) that the shell can render.
- **How?**  The library handles creating the custom element, initializing Angular when the element is attached, and cleaning up on detach.
- **When?**  Use this when turning a full Angular module into a remote entry that the shell or other apps need to embed.

## 11. NgRx helpers: ngrx-accelerator and ngrx-integration-interface

`ngrx-accelerator` and `ngrx-integration-interface` standardize NgRx patterns around routing, local storage, and the OneCX topic system.

- `ngrx-accelerator` exports router-aware effects utilities (`filterForNavigatedTo`, `filterForQueryParamsChanged`) and local-storage helpers (`lazy-loading-merge-reducer`).
- `ngrx-integration-interface` exports store connectors (`onecx-actions`, `onecx-reducer`, `onecx-selectors`, `onecx-state`) to synchronize NgRx state with integration topics.

### 11.1 Pattern: reacting to URL query parameter changes

```ts
import { inject } from '@angular/core'
import { Actions, createEffect } from '@ngrx/effects'
import { Router } from '@angular/router'
import { filterForQueryParamsChanged } from '@onecx/ngrx-accelerator'

export const searchParamsEffect = createEffect(
	(
		actions$ = inject(Actions),
		router = inject(Router),
	) => {
		return filterForQueryParamsChanged(actions$, router, ['search'])
	},
	{ dispatch: false },
)
```

- **Why?**  Many search-heavy screens need to react to URL query parameters (for bookmarking, deep-linking) in a consistent way; hand-rolling this logic in every app is error-prone.
- **What?**  This effect listens for route changes where the `search` query parameter changes and then triggers local logic (for example updating filters or reloading data).
- **How?**  `filterForQueryParamsChanged` encapsulates the boilerplate for subscribing to router events and comparing old/new query param values, returning a stream the effect can use.
- **When?**  Use this pattern when building NgRx-based screens whose state should track the URL query parameters, such as search, filter, or reporting pages.

## 12. Standalone shell: angular-standalone-shell

`angular-standalone-shell` provides a minimal shell environment for running OneCX-style apps in isolation, useful for local development or specialized deployments.

Exports (0_onecx-portal-ui-libs/libs/angular-standalone-shell/src/index.ts):

- `StandaloneShellModule` – module bundling shell infrastructure.
- `StandaloneShellViewportComponent` – root viewport component.
- `expose-standalone.utils` – helpers to expose standalone shells similarly to other webcomponent-based entries.

### 12.1 Pattern: running a feature in a standalone shell

```ts
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { StandaloneShellModule } from '@onecx/angular-standalone-shell'

import { FeatureModule } from './feature/feature.module'

@NgModule({
	imports: [BrowserModule, StandaloneShellModule, FeatureModule],
})
export class FeatureShellModule {}
```

- **Why?**  To run a feature in a lightweight shell that still behaves like OneCX (topics, translations, and routing) without depending on the full portal.
- **What?**  `FeatureShellModule` embeds a feature module inside `StandaloneShellModule`, producing a self-contained app.
- **How?**  You import `StandaloneShellModule` alongside your domain module and bootstrap `StandaloneShellViewportComponent` as the root.
- **When?**  Use this pattern when you need a standalone app for local development, demos, or special-purpose deployments that should still follow OneCX conventions.

---

Additional topics such as guards, gatherers, styles, theming, and storybook support are documented in the dev-docs folder of 0_onecx-portal-ui-libs and can be linked into this guide as the Libs evolve.

