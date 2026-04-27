# OneCX Local Environment (Local-ENV) - Client / User Guide

> Draft user-focused documentation for running and using onecx-local-env. This file focuses on setup steps, how to start and access OneCX, and typical daily workflows. To be expanded iteratively.

## 1. What Is OneCX Local Environment?

- Local-ENV is a ready-made Docker setup that runs the full OneCX platform on your machine.
- You use it to log into OneCX in a browser, try apps, and test features without needing a shared environment.

## 2. Typical User Workflow

1. Install Docker, Docker Compose, Git, Node.js, jq.
2. Clone the onecx-local-env repository.
3. Add host entries to your system hosts file (e.g., onecx.localhost, keycloak-app, postgresdb).
4. From the repo root, run ./start-onecx.sh.
5. Wait until containers are up; then open http://onecx.localhost/onecx-shell/admin in the browser.
6. Log in with the default admin user (onecx / onecx).
7. Use the OneCX Shell and the various apps (workspace, IAM, permissions, etc.).
8. When finished, run ./stop-onecx.sh.

## 3. What You Get Out of the Box

- Single browser URL for everything  
	- Open [http://onecx.localhost/onecx-shell/admin](http://onecx.localhost/onecx-shell/admin) and you land in the OneCX Shell (the main portal).  
	- From there you can navigate to Workspace, IAM, Permissions, Product Store, Welcome, Help, AI Chat, etc.

- Ready-made login and security  
	- Admin login is predefined (user: `onecx`, password: `onecx`).  
	- Identity is handled by Keycloak (reachable at [http://keycloak-app/admin/master/console/#/onecx](http://keycloak-app/admin/master/console/#/onecx)).

- Databases and tools  
	- PostgreSQL is provisioned automatically and used by all backend services.  
	- PgAdmin is available at [http://pgadmin](http://pgadmin) for inspecting data (user: `user@1000kit.org`, password: `admin`).

- Intelligent routing  
	- Traefik sits in front of all services, so you don’t have to remember ports for each app.  
	- You always use friendly hostnames like `onecx.localhost`, `keycloak-app`, or `pgadmin`.

## 4. Example Real-World Scenarios

- Explore the platform as a product owner  
	- Start Local-ENV and log into the Shell.  
	- Use Workspace to see which apps are available and how navigation looks.  
	- Open Permission, Tenant, and Theme apps to understand how access, tenants, and branding work.

- Try AI Chat  
	- After enabling AI as described by your dev team (truststore + import scripts), open the AI Chat icon in the top bar.  
	- Ask questions like “Which OneCX apps are available?” or “Show me the flows for workspace configuration”.

- Validate a new feature end-to-end  
	- Your developers deploy a new version of a service image and update the `.env` file.  
	- You restart the relevant profile (or the whole environment).  
	- You can now verify the new behavior via the UI in your browser without needing any additional infrastructure.

## 5. High-Level App Overview (User Perspective)

- Shell (onecx-shell)  
	- The central entry point where you log in and launch all other apps.

- Workspace  
	- Manages which apps are visible for which users/workspaces.  
	- Typical use: configure which apps appear in the left navigation for “Admin”, “Support”, etc.

- IAM & Permission  
	- IAM focuses on identity, roles and user management.  
	- Permission exposes what actions each role is allowed to perform inside apps.

- Product Store & Welcome  
	- Product Store shows available applications and bundles.  
	- Welcome is a landing experience to introduce users to OneCX.

- Help & AI  
	- Help provides documentation links and context help.  
	- AI adds chat-style assistance directly into the UI.

These apps are all wired together automatically by the Local-ENV setup, so as a user you mainly need to know how to start/stop the stack and how to reach the Shell in your browser.

## 6. Step-by-Step: See a New App in the Shell

This is a simplified, user-focused view of what happens when your team builds a new OneCX microfrontend and wants you to see it in the local Shell.

1. **Developer creates the app**  
	- They generate a new Angular app using OneCX tooling and libraries (so it “speaks” the same language as the Shell for login, navigation, etc.).

2. **Developer wires routing and metadata**  
	- The app defines where it should live, for example at `/hello-world/hello`.  
	- A Helm configuration (`values.yaml`) describes the app image, routing path, and integration details.

3. **Local-ENV is updated via CLI**  
	- The developer uses the `onecx-local-env-cli` to:
	  - Sync the app into the local environment (creates internal configuration files).
	  - Add a menu entry (e.g. “Hello World”) pointing to `/hello-world/hello`.
	  - Add the app’s Docker image to a dedicated compose file so Local-ENV can start it.

4. **You start or restart Local-ENV**  
	- From the onecx-local-env folder, you or your team run scripts like:
	  - `./import-onecx.sh` once to load configuration.  
	  - `docker compose -f hello-world.compose.yaml --profile base up -d` (or a script that wraps this) to start everything.

5. **You open the Shell and test**  
	- Go to `http://onecx.localhost/onecx-shell/admin`.  
	- Log in with the standard admin credentials (unless your team configured something else).  
	- In the navigation, under “Custom Applications” (or another workspace), you see the new entry, such as “Hello World”.  
	- Click it and you are now inside the new app, connected to the same local environment as all other OneCX apps.

In practice, you normally don’t need to run the CLI commands yourself – your developers prepare the environment. But understanding these steps helps you coordinate: if a menu entry is missing or a new app is not visible, you know the change likely hasn’t been synced into Local-ENV yet.
