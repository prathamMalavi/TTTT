# OneCX Local Environment (Local-ENV) - Developer Documentation

> Draft technical documentation for onecx-local-env. This file focuses on architecture, services, scripts, configuration, and how to integrate custom apps. To be expanded iteratively.

## 1. Purpose and High-Level Overview

- Why: Provide a complete, reproducible local development and testing environment for the OneCX platform using Docker and Docker Compose.
- What: A Docker-based stack that includes Traefik, Keycloak, Postgres, PgAdmin, and all core OneCX products (shell, workspace, IAM, permissions, etc.), plus data-import tooling.
- How: Shell scripts (start-onecx.sh, stop-onecx.sh, etc.) orchestrate docker compose projects defined in versions/v1 and versions/v2, using shared env vars from versions/v2/.env and init-data for Keycloak, Postgres, and Traefik.
- When: Use whenever you want to develop or debug OneCX applications locally, or when you need a near-production-like environment on your laptop.

## 2. Repository Layout (Developer View)

### 2.1 Root Level

- README.md  
  - Why? Entry point for new developers and link to canonical docs.  
  - What? Short description of onecx-local-env and reference to hosted documentation.  
  - How? Open it first when you land in the repo to confirm scope and pointer to online docs.  
  - When? Any time you need a high-level reminder or shareable link.

- compose.yaml  
  - Why? Single, stable Docker Compose entry that always points to the current environment version (v2 right now).  
  - What? Minimal compose file that uses `include` to pull in versions/v2/compose.yaml.  
  - How? Docker Compose reads this file and then expands all included services, volumes and networks.  
  - When? Run `docker compose ...` from repo root without worrying about the underlying version.

  ```yaml
  # Pattern: Delegate to versioned stack
  name: onecx-local-env
  include:
    - ./versions/v2/compose.yaml
  ```

- start-onecx.sh / stop-onecx.sh  
  - Why? Encapsulate common `docker compose` and import sequences into simple, memorable commands.  
  - What? Shell wrappers that start or stop profiles, manage data import, and handle timing/health checks.  
  - How? Execute them from repo root; they call `docker compose` with appropriate profiles and options.  
  - When? Daily: start your environment in the morning, stop it when you’re done.

  ```bash
  # Pattern: Start full environment for development
  ./start-onecx.sh -p base      # common default profile
  ./start-onecx.sh -p all       # everything, for integration testing

  # Pattern: Gracefully stop stack
  ./stop-onecx.sh
  ```

- check-images.sh / update-images.sh / list-containers.sh  
  - Why? Keep dev images consistent with central registry and quickly inspect runtime state.  
  - What? Convenience scripts around `docker images`, `docker pull`, and `docker ps`.  
  - How? Run them from repo root; they read the same `.env` and compose metadata.  
  - When? Before debugging issues where outdated images might be involved.

- toggle-mfes.sh  
  - Why? Allow local Angular/React microfrontends to be integrated into the running OneCX Shell without rebuilding images.  
  - What? Manipulates Traefik file-provider configuration under `init-data/traefik/active` to route certain app paths to `host.docker.internal` instead of containerized UIs.  
  - How? You pass a microfrontend key and action (enable/disable); the script edits YAML fragments and reloads Traefik via file watches.  
  - When? When you run a UI locally on port 4200/4300 and want it reachable under `onecx.localhost` paths.

  ```bash
  # Pattern: Develop a UI locally but keep the rest in Docker
  # 1) Run UI on host (e.g., hello-world-ui on :4200)
  npm start

  # 2) Enable routing of that MFE through Traefik
  ./toggle-mfes.sh enable hello-world-ui

  # 3) Access via shell inside onecx-local-env
  #    http://onecx.localhost/onecx-shell/admin → Hello World app
  ```

### 2.2 Core Directories

- docs/  
  - Why? Single source of truth for how to use and extend Local-ENV.  
  - What? Antora AsciiDoc module: setup, running, versions, networking, AI setup, utilities, scripts and troubleshooting.  
  - How? Rendered into the public docs site; can also be read directly in the repo.  
  - When? Whenever you need authoritative guidance (e.g., profiles, networking, AI configuration).

- init-data/  
  - Why? Ensure deterministic bootstrap of identity, database schemas, Traefik routing and admin tools.  
  - What? Data and config consumed by container entrypoints.  
  - How? Mounted into containers via volumes in compose v2.
  - When? On every environment bootstrap; you rarely touch it unless you’re altering base platform defaults.

  - init-data/keycloak/realm-onecx.json  
    - What? Realm export for Keycloak containing users, roles, clients and realm settings for OneCX.  
    - Real-world use: When a new developer starts, they immediately get ready-to-use client IDs (`onecx-shell-ui-client`, `onecx-local-env-client-id`) and admin logins.

  - init-data/postgres/create-databases.sql  
    - What? SQL script executed at Postgres init; creates per-service databases such as `onecx_theme`, `onecx_workspace`, etc.  
    - Real-world use: Allows each backend (`onecx-*-svc`) to run migrations and manage its own schema without interfering with others.

  - init-data/traefik/base & init-data/traefik/active  
    - What? Base configuration and active routers/services for Traefik.  
    - Real-world use: When you enable a new local microfrontend, the corresponding YAML is placed in `active/` so Traefik routes to host or container.

- onecx-data/  
  - Why? Store all OneCX domain import payloads and scripts centrally so environments can be recreated consistently.  
  - What? Subfolders for AI, bookmarks, parameters, permissions, tenant, theme, workspace, etc., each with JSON fixtures and import shell scripts.  
  - How? Scripts like `./import-onecx.sh -d permission` call into these directories to POST JSON into running BFF/SVC containers.  
  - When? After first boot or when you want to reset or extend seed data for a feature.

  ```bash
  # Pattern: Import full default data set
  ./import-onecx.sh           # imports all core data

  # Pattern: Import only AI-related data (requires AI profile)
  ./import-onecx.sh -x -d ai  # -x for extra logging
  ```

- certs/  
  - Why? Central place for trusted certificates when services need TLS to external AI providers or MCP servers.  
  - What? Truststore and certificate material used by Java-based SVCs (`-svc` containers).  
  - How? `setup-truststore.sh` builds/updates `truststore.jks` and compose mounts it into service containers.  
  - When? Any time you need to talk to a TLS endpoint with a custom CA (e.g., corporate proxy, internal AI cluster).

  ```bash
  # Pattern: Prepare truststore before using secure external services
  ./setup-truststore.sh
  ```

- versions/v1 and versions/v2  
  - Why? Version the environment without breaking existing automation or docs.  
  - What? Each folder contains compose files, env files, and helper scripts specific to that version.  
  - How? Root compose.yaml and import scripts always point to the “current” version (v2 now).  
  - When? V1 is legacy; v2 is the default. Migrations are documented in `docs/modules/onecx-local-env/pages/versions/migrate.adoc`.

  - versions/v2/.env  
    - What? Central definition of all base images (Traefik, Postgres, Keycloak, PgAdmin) and every OneCX product image tag (`ONECX_*` variables).  
    - How? Docker Compose automatically loads `.env`; service definitions use `${VAR}` interpolation.  
    - Example: Changing `ONECX_WORKSPACE_UI` here switches the Workspace UI image used by the entire stack.

  - versions/v2/compose.yaml  
    - What? Full stack definition: base services, all OneCX products, profiles, healthchecks, Traefik labels.  
    - How? Services are grouped into profiles (`minimal`, `base`, `workspace`, `all`, etc.) and share common env blocks via YAML anchors.

    ```yaml
    # Pattern: Reuse common env sets for BFF and SVC
    x-bff-variables: &bff_environment
      ONECX_PERMISSIONS_ENABLED: ${ONECX_PERMISSIONS_ENABLED}
      QUARKUS_OIDC_CLIENT_CLIENT_ID: ${ONECX_OIDC_CLIENT_CLIENT_ID}

    x-svc-variables: &svc_single_tenancy
      QUARKUS_LOG_LEVEL: ${ONECX_LOG_LEVEL}
      QUARKUS_DATASOURCE_JDBC_MIN_SIZE: ${ONECX_DATASOURCE_JDBC_MIN_SIZE}

    services:
      onecx-permission-svc:
        environment:
          <<: *svc_single_tenancy
          QUARKUS_DATASOURCE_USERNAME: onecx_permission
      onecx-permission-bff:
        environment:
          <<: *bff_environment
          ONECX_PERMISSIONS_PRODUCT_NAME: "onecx-permission"
    ```

    - Real-world use: When you enable multi-tenancy or tweak auth, you typically do it once in the env presets instead of per service.

## 3. Getting Started: Build a New OneCX MFE End-to-End

This section walks through a minimal but complete example based on the *Hello World* pattern from the official docs. It combines:

- OneCX UI libs (event bus, integration-interface, auth, utils)
- onecx-local-env for local development
- onecx-local-env-cli to wire import files, menu entries and Docker Compose
- A path that later aligns with production deployment via Helm

### 3.1 Prerequisites

- OneCX Local Environment already set up and runnable (see setup/run docs in this file).
- Node.js and npm installed on your machine.
- Access to the OneCX generator and Hello World example docs under:
  - [docs/docs/modules/onecx-docs-start/pages/create_application.adoc](docs/docs/modules/onecx-docs-start/pages/create_application.adoc)
  - [docs/docs/modules/onecx-docs-start/pages/first-app/create_angular_app.adoc](docs/docs/modules/onecx-docs-start/pages/first-app/create_angular_app.adoc)
  - [docs-guides/docs/getting-started/modules/getting-started/pages/first-application/getting_started.adoc](docs-guides/docs/getting-started/modules/getting-started/pages/first-application/getting_started.adoc)


### 3.2 Step 1 – Create a New Angular MFE with OneCX Libs

**Why?** You need an Angular microfrontend that speaks OneCX’s language (topics, auth, i18n) so it can live inside the Shell like any other app.

**What?** A small Angular app (e.g. `hello-world-ui`) generated via the OneCX Nx plugin, with OneCX libs wired in.

**How (high level)?**

1. Use the OneCX generator (documented in the Nx plugins docs) to scaffold a new app, or clone the public `onecx-hello-world-ui` repo as a starting point.
2. Ensure the generated app imports OneCX Angular libs:
   - `@onecx/angular-integration-interface` for portal state
   - `@onecx/angular-auth` for authentication
   - `@onecx/angular-utils` for translations and permissions
3. Configure translations and auth similar to the examples in [0_NOTES/GENERATED_DOCS/DEV_DOCS/Libs/OneCX-Libs-Dev-Guide.md](0_NOTES/GENERATED_DOCS/DEV_DOCS/Libs/OneCX-Libs-Dev-Guide.md).

**Minimal pattern snippet (Angular app shell)**

```ts
// Pattern: minimal Angular bootstrap using OneCX libs
import { ApplicationConfig } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { TokenInterceptor } from '@onecx/angular-auth'
import { AppStateService } from '@onecx/angular-integration-interface'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    AppStateService,
  ],
}
```

- **When?** Do this immediately after generating the app, before integrating with Local-ENV, so that Shell and your app share auth and state correctly.


### 3.3 Step 2 – Define Routing, Base Path and Helm Values

**Why?** onecx-local-env-cli reads your Helm `values.yaml` to derive product name, routing path and microfrontend registration; these must be consistent across app, CLI and Shell.

**What?**

- A base path for the product, e.g. `/hello-world`.
- A microfrontend route inside that product, e.g. `/hello-world/hello`.
- A Helm values file describing the UI image and routing path, typically `helm/values.yaml`.

**How?**

1. In your Angular app’s Helm values (simplified):

   ```yaml
   # Pattern: OneCX UI values (simplified)
   product:
     name: hello-world

   ui:
     image: ghcr.io/onecx-apps/hello-world-ui:main
     routing:
       path: /mfe/helloWorld/
       # exposed Angular module name and other settings are defined here as well
   ```

2. In your Angular routes, ensure the feature path matches how you want to access it in the Shell, e.g. `path: 'hello'` under the app’s feature module.

**When?** Before running any `onecx-local-env-cli sync` commands – the CLI assumes `values.yaml` is correct.


### 3.4 Step 3 – Sync the UI with onecx-local-env (CLI)

**Why?** Instead of manually crafting JSON import files and Docker Compose snippets, the CLI reads your Helm values and updates onecx-local-env for you.

**What?** A `sync ui` command that:

- Creates/updates product, microfrontend and workspace import files under `onecx-local-env/onecx-data`.
- Prepares metadata so Shell and Workspace know about your app.

**How?** From your UI project root, run (adjust paths):

```sh
npx @onecx/local-env-cli sync ui hello-world /hello-world ./helm/values.yaml \
  -e /path/to/onecx-local-env -n hello-world-ui
```

- `hello-world` – product name
- `/hello-world` – base path for the product
- `./helm/values.yaml` – app’s Helm values
- `-e` – path to your local onecx-local-env checkout
- `-n` – technical name of the microfrontend service

Under the hood, this uses `SyncUICommand` from [onecx-local-env-cli/src/commands/sync/ui/sync-ui.ts](onecx-local-env-cli/src/commands/sync/ui/sync-ui.ts) to:

- Read values via `retrieveValuesYAML`.
- Sync products, microfrontends, workspace slots and permissions.

**When?** After your app and Helm values exist; repeat whenever routing or product metadata changes.


### 3.5 Step 4 – Add a Shell Menu Entry

**Why?** Users should be able to launch your MFE through the Shell navigation; menu entries drive that.

**What?** A menu entry under “Custom Applications” that points to your feature route.

**How?** Still in the UI repo, run:

```sh
npx @onecx/local-env-cli menu create hello-world-ui /hello-world/hello "Hello World" \
  -e /path/to/onecx-local-env
```

- `hello-world-ui` – microfrontend service name
- `/hello-world/hello` – feature module path (must match your Angular route)
- `"Hello World"` – display label in Shell

The CLI writes appropriate JSON into the workspace import files (e.g. under `onecx-local-env/onecx-data/workspace`).

**When?** After synchronization, or whenever you want to adjust menu paths/names.


### 3.6 Step 5 – Add the UI to Docker Compose

**Why?** onecx-local-env needs a service definition so Docker can run your UI image and Traefik can route traffic to it.

**What?** A separate compose file (e.g. `hello-world.compose.yaml`) that *includes* the base compose and adds your UI/BFF/SVC services.

**How?** From the UI repo, again using the CLI:

```sh
npx @onecx/local-env-cli docker hello-world create hello-world helloWorld \
  -e /path/to/onecx-local-env -s ui
```

- `hello-world` (after `docker`) – name of the custom compose file that will be created.
- `hello-world` (after `create`) – product name.
- `helloWorld` – UI path id, matching the `routing.path` (`/mfe/helloWorld/`) in `values.yaml`.
- `-s ui` – section type (UI; you can also add `bff` and `svc`).

This generates something conceptually similar to:

```yaml
# hello-world.compose.yaml (simplified pattern)
include:
  - compose.yaml

services:
  hello-world-ui:
    image: ${HELLO_WORLD_UI}
    environment:
      APP_BASE_HREF: /mfe/helloWorld/
      APP_ID: hello-world-ui
      PRODUCT_NAME: hello-world
    labels:
      - traefik.http.services.hello-world-ui.loadbalancer.server.port=8080
      - traefik.http.routers.hello-world-ui.rule=Host(`onecx.localhost`)&&PathPrefix(`/mfe/helloWorld/`)
    networks:
      - onecx
    profiles:
      - base
      - hello-world
```

**When?** After sync and menu creation; repeat if you add BFF/SVC or change image names.


### 3.7 Step 6 – Start Local-ENV with Your App

**Why?** To verify the full stack (Shell, your MFE, and optionally BFF/SVC) works together in Docker.

**What?** A running onecx-local-env instance with your compose extension.

**How?** From the `onecx-local-env` root:

```sh
# Import initial core data (if not done before)
./import-onecx.sh

# Start base stack plus your app using the generated compose file
docker compose -f hello-world.compose.yaml --profile base up -d
```

Then open the Shell:

- Browser: `http://onecx.localhost/onecx-shell/admin`
- Log in: `onecx` / `onecx`
- Navigate to the “Hello World” entry under Custom Applications; it should launch your UI.

**When?** Whenever you want to run the full Dockerized version, closer to how production runs (container images, Traefik routing, Keycloak, Postgres).


### 3.8 Step 7 – Local Dev with Hot Reload (Optional)

**Why?** Building Docker images for every code change is slow; hot reload keeps the UI fast during development while the rest of the stack stays in Docker.

**What?** A locally running Angular dev server (`nx serve` or `npm start`) combined with Traefik routing and (optionally) `toggle-mfes.sh` for local proxying.

**How?**

1. Start the core environment without the UI image (e.g. `base` profile only).
2. Run your UI with Nx or npm:

   ```sh
   nx serve hello-world-ui --proxy-config=proxy.conf.js
   # or
   npm run start -- --port=4200 --host 0.0.0.0
   ```

3. Configure Traefik and/or local proxy as described in the hot-reload guides under:
   - [docs-guides/docs/getting-started/modules/getting-started/pages/first-application/enable_hot_reload.adoc](docs-guides/docs/getting-started/modules/getting-started/pages/first-application/enable_hot_reload.adoc)

4. Optionally use `toggle-mfes.sh` in `onecx-local-env` to direct the microfrontend route to your local dev server instead of the Docker image.

**When?** During daily development cycles when you care about iteration speed more than image parity.


### 3.9 Step 8 – From Local-ENV to Production

**Why?** The same Helm values and image coordinates used in Local-ENV should be deployable to real Kubernetes clusters without rework.

**What?**

- Docker images published to a registry (e.g. `ghcr.io/onecx-apps/hello-world-ui`).
- Helm charts and values used both by your CI/CD and by `onecx-local-env-cli` for imports.

**How?**

1. Ensure your UI/BFF/SVC CI pipelines build and push images with tags compatible with Local-ENV (`main`, `main-native`, etc.).
2. Keep `helm/values.yaml` authoritative; treat it as the contract for both Local-ENV and production.
3. In production, the OneCX platform’s devops modules (e.g. under [onecx-devops/terraform-scripts](onecx-devops/terraform-scripts)) use these values to register your product and deploy workloads.
4. In Local-ENV, you simply point the `.env` in `versions/v2` to those same images or local tags during debugging.

**When?** When stabilizing a new app for wider testing or rollout; Local-ENV becomes your realistic staging ground prior to deployment.

