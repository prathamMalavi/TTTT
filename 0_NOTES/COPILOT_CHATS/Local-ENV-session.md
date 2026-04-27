# Local-ENV Session Notes

## Overview
- Topic: OneCX Local Environment (onecx-local-env)
- Goal: Understand all files, scripts, services, and how they are used for local OneCX development.

## Initial Findings
- Root repo: onecx-local-env
- Core docs: docs/modules/onecx-local-env/pages
  - index.adoc: high-level overview and links
  - setup.adoc: installation, prerequisites, hosts entries
  - run-onecx.adoc: starting, accessing, stopping OneCX
- Main compose setup:
  - versions/v1/docker-compose.yaml (legacy)
  - versions/v2/compose.yaml (current recommended)
  - versions/v2/.env: central place for service image tags and core env vars
- Helper scripts in repo root:
  - start-onecx.sh: starts core services and imports data
  - stop-onecx.sh: stops stack
  - check-images.sh, list-containers.sh, update-images.sh: maintenance helpers
  - toggle-mfes.sh: controls micro-frontends activation via Traefik files
- Init data folders:
  - init-data/keycloak: realm initialization for OneCX
  - init-data/postgres: DB bootstrap script
  - init-data/traefik: base and active configs for routing
- onecx-data/: import payloads for AI, bookmarks, parameters, permissions, tenant, etc.

## Next Steps
- Deep-dive versions/v2 compose and .env to map all services and their APIs (hosts, paths, ports).
- Review docs under internal/ (networking, environment configuration).
- Document AI, permission, parameter, workspace imports from onecx-data.
- Produce DEV and CLIENT docs under 0_NOTES/GENERATED_DOCS for Local-ENV.
- Document end-to-end flow for creating a new OneCX microfrontend (using OneCX UI libs), wiring it with onecx-local-env via onecx-local-env-cli (sync/menu/docker), and running it in Shell for local dev and as a basis for production deployment.
