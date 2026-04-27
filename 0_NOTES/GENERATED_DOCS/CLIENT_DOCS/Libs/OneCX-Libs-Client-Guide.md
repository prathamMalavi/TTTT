# OneCX Libs – Client/Product Guide

> High-level explanation of OneCX UI libraries from a product and usage perspective.

## 1. What Are OneCX Libs?

OneCX libraries provide reusable building blocks so that multiple applications (micro frontends and remote widgets) can behave consistently inside the OneCX portal shell:

- Shared authentication and user session handling
- Consistent look-and-feel, translations, and permissions
- A common event bus so apps can coordinate navigation, loading spinners, and error handling
- Support for remote pluggable components (slots) and workspaces

This document explains the capabilities in business terms, with examples of how product features are enabled by these libraries.

(Technical details and code are in the Developer Guide.)

## 2. How Libs Show Up in the Product

From a product or client point of view, you rarely work with the libraries directly, but you see their effects in the way OneCX behaves:

- Users sign in once and stay authenticated across many apps (driven by the auth and integration libs).
- Screens from different teams share the same style, language, and permission rules (driven by angular-utils, accelerator, and integration-interface).
- Menus, workspaces, and widgets can be added or removed without redeploying the entire portal (driven by angular-remote-components and workspace topics).

Below is a plain-language description of the most important libraries and the product capabilities they enable.

## 3. Authentication and User Session

**Libraries involved:**
- `@onecx/angular-auth`
- `@onecx/integration-interface`
- `@onecx/angular-integration-interface`

**Business value**

- Single sign-on: a user logs in once and can navigate across multiple OneCX micro frontends without re-entering credentials.
- Consistent access control: apps can check whether a user is authenticated or not, and react accordingly.
- Smooth user journeys: login redirects, token refresh, and logout flows are handled centrally instead of being reimplemented by every team.

**How it behaves in the portal**

- When a user opens the OneCX shell, the auth module negotiates with the identity provider (e.g., Keycloak).
- Once the user is authenticated, a shared "is authenticated" state is broadcast through the integration topics.
- Individual apps use that shared state to decide whether to show content, to call secured APIs, or to redirect back to login.

**Example scenario**

- A user logs in at the portal home page.
- They then move into the Parameter Management app and later into the Workspace Management app.
- Both apps know the user is already logged in and can read the user profile from a shared user topic, so they show personalized information without asking the user to authenticate again.

## 4. Translations, Look-and-Feel, and Permissions

**Libraries involved:**
- `@onecx/angular-utils`
- `@onecx/accelerator`
- `@onecx/integration-interface`

**Business value**

- Consistent language behavior: when a user switches their language, all apps in the portal follow that choice.
- Unified design: UI components share styling and theming rules, so the portal looks like one product rather than many stitched-together apps.
- Centralized permissions: apps can show or hide actions, menus, and data fields depending on the user’s roles and entitlements.

**How it behaves in the portal**

- Language: once the user’s preferred language is known, it is stored in a shared profile and propagated through the integration topics. All MFEs using the shared translation utilities automatically pick up that language.
- Styling: theming services provide a common set of colors, spacing, and PrimeNG theme configuration so that common components (tables, forms, menus) feel identical across apps.
- Permissions: an app can ask "Can this user see the advanced configuration page?" and get a yes/no answer based on a central permission model. The same rules apply in multiple apps.

**Example scenario**

- A German-speaking user chooses "Deutsch" in their user profile.
- The workspace header, the Parameter Management app, and the Workspace menu all switch labels and messages to German.
- A junior support agent logs in and can only see read-only views of certain configuration pages, while an administrator sees additional buttons such as "Edit" or "Delete" in the same screens.

## 5. Workspaces, Navigation, and Menus

**Libraries involved:**
- `@onecx/integration-interface`
- `@onecx/angular-integration-interface`
- `@onecx/angular-remote-components`

**Business value**

- Workspaces: OneCX can be split into logical areas (e.g., "Welcome", "Permissions", "Themes", "User Profile", "Announcements"), each with its own routes and menus.
- Dynamic navigation: menus and navigation elements can be updated centrally (via configuration or BFF services) and roll out to all users without changing the core shell.
- Pluggable widgets: different business domains can contribute their own menu items, tiles, or logos into common regions of the portal.

**How it behaves in the portal**

- When the shell loads a workspace, it broadcasts workspace and navigation data through shared topics.
- Dedicated remote components (for example, the vertical main menu or workspace logo) subscribe to that data and render the right content.
- As the user navigates, events are fired describing the current URL and active workspace; menus and breadcrumbs update automatically.

**Example scenario**

- A customer administrator opens the portal and lands in the "Workspace" area.
- The left-hand menu shows workspace-specific navigation options, while a top bar logo changes according to the selected workspace.
- Without redeploying the shell, a new menu entry is added for a "Reports" feature in the same workspace. The menu remote component simply reflects this new configuration, and the user can click through to the new feature.

## 6. Remote Components and Slots

**Libraries involved:**
- `@onecx/angular-remote-components`
- `@onecx/angular-webcomponents`

**Business value**

- Pluggable UI: business teams can ship small, focused UI elements (remote components) that plug into predefined "slots" in the shell (header, sidebar, dashboard tiles, etc.).
- Technology flexibility: these components can be Angular-based or webcomponents, while still behaving like first-class citizens in the portal.
- Faster iteration: individual remote components can be evolved or replaced without taking down the entire portal.

**How it behaves in the portal**

- The shell defines named slots (e.g., "header-right", "vertical-main-menu").
- Remote components register themselves for specific slots and receive configuration (such as base URLs and feature flags) when loaded.
- Depending on user context, different remote components can appear in the same slot—for example, a different header widget for admin users than for standard users.

**Example scenario**

- The product team wants a "New Announcements" banner to appear at the top of the portal when there are unread announcements.
- They implement a small remote component in the Announcements app and configure it to occupy a header slot.
- When announcements are active, this component shows a banner and a link; when there are none, the slot remains empty.

## 7. NgRx and Advanced State Handling

**Libraries involved:**
- `@onecx/ngrx-accelerator`
- `@onecx/ngrx-integration-interface`

**Business value**

- Stable behavior across complex stateful screens that use NgRx for state management.
- Consistent handling of URL query parameters, local storage persistence, and integration events, especially in heavy data entry or search screens.

**How it behaves in the portal**

- For end users, this shows up as predictable behavior: search filters stay in sync with the URL, pages remember state where appropriate, and navigation back/forward acts intuitively.
- For product owners, this reduces the risk of edge cases when adding new filtering or navigation behavior because apps reuse proven patterns.

**Example scenario**

- In a search-heavy app, a user sets several filters and bookmarks the URL.
- Later, they open the same URL again and the page restores the same filter criteria, thanks to shared NgRx utilities that coordinate route parameters and store state.

## 8. Shell as an Integration Hub

The main OneCX shell (implemented in the `0_onecx-shell-ui` project) is where these libraries come together. From a client perspective, the shell is responsible for:

- Initializing authentication and user profile information.
- Loading the active workspace configuration (routes, themes, remote components, permissions).
- Connecting navigation events from the browser to the rest of the apps.
- Making sure remote components and MFEs receive the correct context (languages, permissions, base URLs).

As a result, new functional apps or widgets can be plugged into the portal with minimal friction, while still behaving as part of a single coherent product.

## 9. Summary

- The OneCX libs are not just technical utilities; they are the backbone that ensures a consistent user experience across many independently developed apps.
- Authentication-related libs give you single sign-on and unified user context.
- UI and i18n libs keep the look, feel, and language consistent across the portal.
- Workspace and remote-component libs make navigation and layout flexible without redesigning the shell.
- NgRx helpers and integration topics ensure that stateful flows behave in a predictable, shareable way.

Together, these libraries let product teams deliver new capabilities as independent micro frontends while end users still experience OneCX as a single, integrated platform.
