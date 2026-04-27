# OneCX Platform - Complete Repository Catalog

> **Version:** 6.x  
> **Last Updated:** February 2026  
> **Target Audience:** Developers, DevOps Engineers, System Architects

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Infrastructure](#core-infrastructure)
3. [Business Applications](#business-applications)
4. [Kubernetes Operators](#kubernetes-operators)
5. [Developer Tools & Libraries](#developer-tools--libraries)
6. [CI/CD & Automation](#cicd--automation)
7. [Docker Base Images](#docker-base-images)
8. [Helm Charts](#helm-charts)
9. [Documentation](#documentation)
10. [Development & Testing](#development--testing)
11. [Example Applications](#example-applications)

---

## Introduction

This document provides a comprehensive catalog of ALL repositories in the OneCX ecosystem. Each repository is documented with:
- **Purpose**: What the repository does
- **Use Cases**: When and why to use it
- **Examples**: Real-world implementation scenarios
- **Dependencies**: Related repositories
- **Technology Stack**: Key technologies used

**Total Repositories**: 100+

---

## Core Infrastructure

### onecx-shell-ui
**Path**: `/onecx-shell-ui`  
**Type**: Angular Microfrontend  
**Technology**: Angular 19+, Module Federation

**Purpose**:
The Shell is the orchestration layer that loads and manages all microfrontends in the OneCX platform. It provides:
- Application routing and navigation
- Microfrontend lifecycle management
- Global state management
- Authentication integration
- Layout rendering

**Use Cases**:
1. **Portal Bootstrap**: First application loaded when user accesses OneCX
2. **Microfrontend Host**: Dynamically loads microfrontends from Product Store
3. **Navigation Management**: Provides top menu, sidebar, and breadcrumbs

**Example**:
```typescript
// Shell bootstraps remote microfrontends
const remoteConfig = {
  remotes: {
    'workspace-ui': 'http://workspace-ui:8080/remoteEntry.js',
    'theme-ui': 'http://theme-ui:8080/remoteEntry.js'
  }
};

// Shell router loads microfrontend
{
  path: 'workspace',
  loadChildren: () => import('workspace-ui/Module')
}
```

**Dependencies**:
- onecx-shell-bff (backend communication)
- onecx-portal-ui-libs (shared UI components)
- onecx-workspace-svc (workspace metadata)

---

### onecx-shell-bff
**Path**: `/onecx-shell-bff`  
**Type**: Backend for Frontend  
**Technology**: Quarkus, Java 17

**Purpose**:
Security gateway and API aggregation layer for the Shell UI. Handles:
- User authentication and authorization
- Token validation and refresh
- Menu structure aggregation
- User settings retrieval

**Use Cases**:
1. **Security Layer**: Validates JWT tokens before forwarding requests
2. **API Composition**: Aggregates data from multiple microservices
3. **Token Management**: Handles token refresh and session management

**Example**:
```java
@Path("/shell/menu")
public class MenuRestController {
    
    @Inject
    WorkspaceClient workspaceClient;
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getMenuStructure() {
        // Aggregate menu from workspace and permissions
        var workspace = workspaceClient.getCurrentWorkspace();
        var menu = buildMenuFromWorkspace(workspace);
        return Response.ok(menu).build();
    }ye
}
```

---

### onecx-portal-ui-libs
**Path**: `/0_onecx-portal-ui-libs`  
**Type**: Angular Library Collection  
**Technology**: Angular 19+, PrimeNG

**Purpose**:
Shared Angular libraries providing reusable UI components, services, and utilities for all OneCX microfrontends.

**Key Libraries**:
- **@onecx/angular-integration-interface**: Module Federation integration
- **@onecx/portal-integration-angular**: Core portal services (theme, permissions, user)
- **@onecx/angular-accelerator**: Data tables, forms, search components
- **@onecx/keycloak-auth**: Authentication integration

**Use Cases**:
1. **Component Reuse**: Standard UI components across all applications
2. **Theme Integration**: Consistent theming using portal theme service
3. **Permission Control**: Declarative permission-based rendering

**Example**:
```typescript
// Using shared data table component
import { DataTableComponent } from '@onecx/angular-accelerator';

@Component({
  template: `
    <ocx-data-table
      [data]="users"
      [columns]="columns"
      [paginator]="true"
      (rowSelect)="onUserSelect($event)">
    </ocx-data-table>
  `
})
export class UserListComponent {
  columns = [
    { field: 'username', header: 'Username' },
    { field: 'email', header: 'Email' }
  ];
}
```

---

## Business Applications

### onecx-workspace
**Path**: `/onecx-workspace`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Manages workspace definitions - isolated environments with specific applications, themes, and user groups.

**Use Cases**:
1. **Multi-Tenancy**: Different workspaces for different departments
2. **Application Scoping**: Control which apps are available in each workspace
3. **Theme Assignment**: Assign different themes per workspace

**Example Scenario**:
```
Company XYZ has three departments:
- HR Department → "hr-workspace" with HR apps (User Profile, Announcements)
- Sales Department → "sales-workspace" with CRM apps
- IT Department → "admin-workspace" with all admin tools

Each workspace has:
- Own theme (colors, logo)
- Own set of applications
- Own menu structure
- Own permissions
```

#### onecx-workspace-svc
**Technology**: Quarkus, PostgreSQL, REST API

**REST API Example**:
```bash
# Create workspace
POST /internal/workspaces
{
  "name": "sales-workspace",
  "theme": "sales-theme",
  "baseUrl": "/sales",
  "description": "Sales Department Workspace"
}

# Add product to workspace
POST /internal/workspaces/sales-workspace/products
{
  "productName": "onecx-user-profile",
  "baseUrl": "/profile"
}
```

#### onecx-workspace-ui
**Technology**: Angular, PrimeNG

**Features**:
- Workspace CRUD operations
- Product assignment UI
- Slot configuration
- Menu editor
- Theme assignment

---

### onecx-user-profile
**Path**: `/onecx-user-profile`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI, Avatar SVC

**Purpose**:
Manages user profile data including preferences, settings, avatar, and account information.

**Use Cases**:
1. **User Preferences**: Store locale, timezone, theme preferences
2. **Avatar Management**: Upload and manage user profile pictures
3. **JWT Auto-Creation**: Automatically create profile from JWT token on first login
4. **Account Settings**: Manage email, phone, address

**Example**:
```java
// Auto-create profile from JWT
@Path("/internal/userProfile")
public class UserProfileRestController {
    
    @POST
    @Path("/me")
    public Response getOrCreateCurrentUserProfile(@Context SecurityContext ctx) {
        var userId = ctx.getUserPrincipal().getName();
        var profile = profileService.findByUserId(userId);
        
        if (profile == null) {
            // Auto-create from JWT claims
            profile = profileService.createProfileFromToken(ctx);
        }
        
        return Response.ok(profile).build();
    }
}
```

**Components**:

#### onecx-user-profile-svc
- Main profile management
- Preferences storage
- Account information

#### onecx-user-profile-avatar-svc
- Dedicated service for avatar images
- Image storage and retrieval
- Image optimization

#### onecx-user-profile-bff
- Security layer
- API aggregation for UI

#### onecx-user-profile-ui
- Profile editor
- Avatar upload
- Preferences management
- Account settings

---

### onecx-announcement
**Path**: `/onecx-announcement`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Manages system-wide and workspace-specific announcements displayed as banners or on landing pages.

**Use Cases**:
1. **System Maintenance Alerts**: "System will be down for maintenance on..."
2. **Important News**: "New feature available!"
3. **Workspace-Specific**: Announcements visible only in specific workspaces
4. **Priority Levels**: IMPORTANT, NORMAL, LOW with different display styles

**Example**:
```java
// Create announcement
POST /internal/announcements
{
  "title": "System Maintenance",
  "content": "System will be unavailable on Saturday 10:00-12:00 UTC",
  "type": "SYSTEM_MAINTENANCE",
  "priority": "IMPORTANT",
  "status": "ACTIVE",
  "startDate": "2026-02-20T00:00:00Z",
  "endDate": "2026-02-22T23:59:59Z",
  "workspaceName": "admin"
}

// Announcements displayed:
// - As banner at top of pages
// - On welcome/landing page
// - Filtered by workspace, date range, status
```

**Components**:

#### onecx-announcement-svc
```java
@Path("/internal/announcements")
public class AnnouncementControllerInternal {
    
    @GET
    @Path("/search")
    public Response searchAnnouncements(
        @QueryParam("workspaceName") String workspace,
        @QueryParam("status") String status) {
        
        var criteria = new AnnouncementSearchCriteria();
        criteria.setWorkspaceName(workspace);
        criteria.setStatus(Status.valueOf(status));
        criteria.setCurrentDate(OffsetDateTime.now());
        
        var results = announcementDAO.findBySearchCriteria(criteria);
        return Response.ok(results).build();
    }
}
```

#### onecx-announcement-ui
**Features**:
- Announcement editor with rich text
- Priority and type selection
- Date range picker
- Preview mode
- Workspace filter

---

### onecx-permission
**Path**: `/onecx-permission`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI, Operator

**Purpose**:
Role-Based Access Control (RBAC) system managing permissions, roles, and assignments.

**Use Cases**:
1. **Application Permissions**: Define what actions users can perform
2. **Role Management**: Create roles combining multiple permissions
3. **User Assignment**: Assign roles to users
4. **Permission Checking**: BFFs validate permissions before forwarding requests

**Example**:
```yaml
# Permission definition (managed by operator)
apiVersion: onecx.tkit.org/v1
kind: Permission
metadata:
  name: workspace-mgmt-permissions
spec:
  appId: onecx-workspace
  productName: onecx-workspace
  permissions:
    WORKSPACE#VIEW:
      description: "View workspaces"
    WORKSPACE#EDIT:
      description: "Edit workspaces"
    WORKSPACE#DELETE:
      description: "Delete workspaces"
```

```java
// Permission check in BFF
@Path("/workspaces")
public class WorkspaceBFFController {
    
    @Inject
    PermissionClient permissionClient;
    
    @DELETE
    @Path("/{id}")
    @RolesAllowed("WORKSPACE#DELETE")
    public Response deleteWorkspace(@PathParam("id") String id) {
        // Permission checked by @RolesAllowed
        workspaceClient.delete(id);
        return Response.noContent().build();
    }
}
```

#### onecx-permission-operator
**Technology**: Quarkus Operator SDK, Kubernetes Custom Resources

**Purpose**: Automates permission management in Kubernetes

**Example**:
```yaml
# permissions.yaml
apiVersion: onecx.tkit.org/v1
kind: Permission
metadata:
  name: user-profile-permissions
spec:
  appId: onecx-user-profile
  productName: onecx-user-profile
  permissions:
    USER_PROFILE#VIEW:
      description: "View user profiles"
    USER_PROFILE#EDIT:
      description: "Edit user profile"
    AVATAR#UPLOAD:
      description: "Upload avatar"
```

Apply: `kubectl apply -f permissions.yaml`
Operator creates permissions in permission-svc database automatically.

---

### onecx-theme
**Path**: `/onecx-theme`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Manages visual themes including colors, logos, fonts, and CSS customizations.

**Use Cases**:
1. **Corporate Branding**: Custom colors and logos per organization
2. **Dark Mode**: Light/dark theme variants
3. **Workspace Themes**: Different themes for different workspaces
4. **CSS Overrides**: Custom styling for specific elements

**Example**:
```json
// Theme definition
{
  "name": "corporate-blue",
  "description": "Corporate Blue Theme",
  "properties": {
    "--primary-color": "#1976D2",
    "--secondary-color": "#424242",
    "--surface-ground": "#ffffff",
    "--text-color": "#333333"
  },
  "faviconUrl": "https://cdn.example.com/favicon.ico",
  "logoUrl": "https://cdn.example.com/logo.png",
  "font": "Roboto, sans-serif"
}
```

#### onecx-theme-ui
**Features**:
- Visual theme editor with color picker
- Logo/favicon upload
- CSS editor with syntax highlighting
- Theme preview
- Theme export/import

---

### onecx-product-store
**Path**: `/onecx-product-store`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI, Operator

**Purpose**:
Central registry of all OneCX applications (microfrontends and microservices). Functions like an "app store" for the platform.

**Use Cases**:
1. **Application Registry**: Register new applications
2. **Version Management**: Track application versions
3. **Microfrontend Discovery**: Shell queries store to find available microfrontends
4. **Microservice Registry**: Track backend services and their endpoints

**Example**:
```yaml
# Product registration via operator
apiVersion: onecx.tkit.org/v1
kind: Product
metadata:
  name: onecx-workspace
spec:
  productName: onecx-workspace
  version: 2.5.0
  description: "Workspace Management Application"
  microfrontends:
    - mfeName: onecx-workspace-ui
      remoteBaseUrl: "http://workspace-ui:8080"
      remoteName: "OnecxWorkspaceModule"
      exposedModule: "./OnecxWorkspaceModule"
  microservices:
    - msName: onecx-workspace-svc
      appId: onecx-workspace
      endpoints:
        - path: "/internal/workspaces"
          name: "workspace-internal-api"
```

---

### onecx-tenant
**Path**: `/onecx-tenant`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Multi-tenancy support using database discriminator pattern. Each tenant has isolated data in shared tables.

**Use Cases**:
1. **SaaS Deployments**: Multiple customers on same infrastructure
2. **Data Isolation**: Each tenant sees only their data
3. **Tenant Onboarding**: Create new tenants dynamically

**Example**:
```java
// Every entity has tenantId
@Entity
@Table(name = "workspaces")
public class Workspace {
    
    @Id
    private String id;
    
    @Column(name = "tenant_id")
    private String tenantId; // Discriminator
    
    private String name;
    // ... other fields
}

// Hibernate filter ensures tenant isolation
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
```

**Database Structure**:
```sql
-- Single table, multiple tenants
CREATE TABLE workspaces (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Tenant A sees only their data
SELECT * FROM workspaces WHERE tenant_id = 'tenant-a';
```

---

### onecx-parameter
**Path**: `/onecx-parameter`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI, Operator

**Purpose**:
Application-specific configuration parameters stored in database instead of environment variables.

**Use Cases**:
1. **Dynamic Configuration**: Change settings without redeployment
2. **Application Settings**: Store app-specific key-value pairs
3. **Feature Flags**: Enable/disable features dynamically

**Example**:
```yaml
# Parameter CRD
apiVersion: onecx.tkit.org/v1
kind: Parameter
metadata:
  name: workspace-params
spec:
  appId: onecx-workspace
  productName: onecx-workspace
  parameters:
    MAX_WORKSPACES_PER_USER:
      value: "10"
      description: "Maximum workspaces per user"
    ENABLE_WORKSPACE_TEMPLATES:
      value: "true"
      description: "Enable workspace templates"
```

**API Usage**:
```java
@Path("/parameters")
public class ParameterRestController {
    
    @GET
    @Path("/{appId}/{key}")
    public Response getParameter(
        @PathParam("appId") String appId,
        @PathParam("key") String key) {
        
        var param = parameterDAO.findByAppIdAndKey(appId, key);
        return Response.ok(param).build();
    }
}
```

---

### onecx-search-config
**Path**: `/onecx-search-config`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Saves user search configurations including filters, columns, and sort orders.

**Use Cases**:
1. **Saved Searches**: Save frequently used search criteria
2. **Column Configuration**: Remember which columns to display
3. **User Preferences**: Persist search preferences per user

**Example**:
```json
// Saved search configuration
{
  "userId": "john.doe",
  "productName": "onecx-workspace",
  "pageName": "workspace-search",
  "configName": "My Active Workspaces",
  "criteria": {
    "status": "ACTIVE",
    "name": "",
    "theme": ""
  },
  "columns": ["name", "theme", "status", "createdDate"],
  "sortField": "createdDate",
  "sortOrder": "DESC"
}
```

**UI Integration**:
```typescript
// Load saved search
ngOnInit() {
  this.searchConfigService.getUserSearchConfig(
    'onecx-workspace',
    'workspace-search'
  ).subscribe(configs => {
    this.savedSearches = configs;
  });
}

// Apply saved search
applySavedSearch(config: SearchConfig) {
  this.searchForm.patchValue(config.criteria);
  this.tableColumns = config.columns;
  this.performSearch();
}
```

---

### onecx-help
**Path**: `/onecx-help`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Context-sensitive help system providing documentation and tooltips within the application.

**Use Cases**:
1. **Inline Help**: Help buttons on forms showing relevant documentation
2. **Help Articles**: Searchable help documentation
3. **Context-Aware**: Show help based on current page/context

**Example**:
```typescript
// Help widget in component
@Component({
  template: `
    <form>
      <input pInputText [(ngModel)]="workspace.name" />
      <ocx-help-button 
        productName="onecx-workspace"
        helpKey="workspace.name">
      </ocx-help-button>
    </form>
  `
})
```

---

### onecx-bookmark
**Path**: `/onecx-bookmark`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Personal bookmarks for frequently accessed pages or resources.

**Use Cases**:
1. **Quick Access**: Bookmark frequently used pages
2. **Personal Links**: Save important external links
3. **Workspace Bookmarks**: Bookmarks scoped to specific workspaces

**Example**:
```json
// Bookmark
{
  "userId": "john.doe",
  "workspaceName": "admin",
  "url": "/admin/users?status=ACTIVE",
  "displayName": "Active Users",
  "description": "List of all active users",
  "scope": "WORKSPACE"
}
```

---

### onecx-data-orchestrator
**Path**: `/onecx-data-orchestrator`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI, Operator

**Purpose**:
Import/export automation for OneCX data including workspaces, themes, permissions, parameters.

**Use Cases**:
1. **Environment Migration**: Export from DEV, import to PROD
2. **Backup/Restore**: Backup configuration data
3. **Template Distribution**: Share workspace templates
4. **Bulk Operations**: Import multiple configurations at once

**Supported Data Types**:
- Workspaces
- Themes
- Permissions
- Parameters
- Slots
- Products
- Microfrontends
- Microservices
- Keycloak Clients
- Databases

**Example**:
```yaml
# Export workspace with dependencies
apiVersion: onecx.tkit.org/v1
kind: Data
metadata:
  name: hr-workspace-export
spec:
  operation: EXPORT
  dataTypes:
    - WORKSPACE
    - THEME
    - PERMISSION
    - PARAMETER
  filter:
    workspaceName: "hr-workspace"
  outputFormat: YAML
```

**Export Result**:
```yaml
# Generated export file
workspaces:
  - name: hr-workspace
    theme: hr-theme
    products:
      - onecx-user-profile
      - onecx-announcement
themes:
  - name: hr-theme
    properties:
      --primary-color: "#4CAF50"
permissions:
  - appId: onecx-user-profile
    permissions:
      USER_PROFILE#VIEW: {}
```

---

### onecx-iam
**Path**: `/onecx-iam`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI, KC-Client-Operator

**Purpose**:
Identity and Access Management integration with Keycloak. Manages users, roles, and authentication.

**Use Cases**:
1. **User Management**: Create/update/delete users in Keycloak
2. **Role Assignment**: Assign Keycloak roles to users
3. **Realm Management**: Manage Keycloak realms
4. **Client Management**: Automate Keycloak client creation

#### onecx-iam-kc-client-operator
**Technology**: Quarkus Operator SDK

**Purpose**: Automates Keycloak client creation from Kubernetes CRDs

**Example**:
```yaml
# Keycloak client CRD
apiVersion: onecx.tkit.org/v1
kind: KeycloakClient
metadata:
  name: workspace-ui-client
spec:
  realm: onecx
  type: ui
  kcConfig:
    clientId: onecx-workspace-ui
    redirectUris:
      - "https://portal.example.com/*"
    webOrigins:
      - "https://portal.example.com"
    publicClient: true
    standardFlowEnabled: true
```

Operator automatically:
1. Creates client in Keycloak
2. Configures redirect URIs
3. Sets up client scopes
4. Generates client secret (for backend clients)

---

### onecx-welcome
**Path**: `/onecx-welcome`  
**Type**: Product (Bundle)  
**Components**: SVC, BFF, UI

**Purpose**:
Customizable welcome/landing page with image carousel and widgets.

**Use Cases**:
1. **Landing Page**: First page users see after login
2. **Image Carousel**: Display rotating banner images
3. **Widgets**: Quick links, announcements, getting started guides

**Example**:
```json
// Welcome configuration
{
  "workspaceName": "admin",
  "images": [
    {
      "url": "https://cdn.example.com/welcome1.jpg",
      "title": "Welcome to OneCX",
      "description": "Modern enterprise portal"
    },
    {
      "url": "https://cdn.example.com/welcome2.jpg",
      "title": "Get Started",
      "description": "Click here to begin"
    }
  ],
  "autoPlayDelay": 5000,
  "showIndicators": true
}
```

---

### onecx-admin
**Path**: `/onecx-admin`  
**Type**: Product (Bundle)  
**Components**: BFF, UI

**Purpose**:
Administrative dashboard aggregating all admin functions (users, workspaces, themes, permissions).

**Use Cases**:
1. **Central Admin**: Single interface for all admin tasks
2. **Dashboard**: Overview of system status
3. **Quick Actions**: Common admin operations

---

## Kubernetes Operators

### onecx-permission-operator
**Path**: `/onecx-permission-operator`  
**Technology**: Quarkus, Operator SDK, Java 17

**Purpose**:
Automates permission management by watching Permission CRDs and syncing to permission-svc database.

**Workflow**:
```
1. Developer creates permissions.yaml
2. kubectl apply -f permissions.yaml
3. Operator detects new Permission CRD
4. Operator calls onecx-permission-svc REST API
5. Permissions created in database
6. Status updated in CRD
```

**Example**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: Permission
metadata:
  name: theme-permissions
spec:
  appId: onecx-theme
  productName: onecx-theme
  permissions:
    THEME#VIEW:
      description: "View themes"
    THEME#CREATE:
      description: "Create themes"
    THEME#EDIT:
      description: "Edit themes"
    THEME#DELETE:
      description: "Delete themes"
```

**Operator Code**:
```java
@ControllerConfiguration
public class PermissionReconciler 
    implements Reconciler<Permission> {
    
    @Inject
    PermissionServiceClient permissionClient;
    
    @Override
    public UpdateControl<Permission> reconcile(
        Permission resource, Context<Permission> context) {
        
        var spec = resource.getSpec();
        
        // Call permission-svc to create/update permissions
        permissionClient.createOrUpdatePermissions(
            spec.getAppId(),
            spec.getPermissions()
        );
        
        // Update CRD status
        resource.setStatus(new PermissionStatus()
            .status(Status.CREATED)
            .message("Permissions synced"));
            
        return UpdateControl.updateStatus(resource);
    }
}
```

---

### onecx-parameter-operator
**Path**: `/onecx-parameter-operator`  
**Technology**: Quarkus, Operator SDK

**Purpose**:
Automates parameter management by syncing Parameter CRDs to parameter-svc.

**Example**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: Parameter
metadata:
  name: workspace-config
spec:
  appId: onecx-workspace
  productName: onecx-workspace
  parameters:
    MAX_WORKSPACES:
      value: "50"
      description: "Max workspaces per tenant"
    ENABLE_TEMPLATES:
      value: "true"
```

---

### onecx-product-store-operator
**Path**: `/onecx-product-store-operator`  
**Technology**: Quarkus, Operator SDK

**Purpose**:
Automates product registration by syncing Product CRDs to product-store-svc.

**Example**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: Product
metadata:
  name: onecx-workspace
spec:
  productName: onecx-workspace
  version: 2.5.0
  microfrontends:
    - mfeName: onecx-workspace-ui
      remoteBaseUrl: "http://workspace-ui:8080"
      exposedModule: "./OnecxWorkspaceModule"
```

---

### onecx-infra-kc-operator
**Path**: `/onecx-infra-kc-operator`  
**Technology**: Quarkus, Operator SDK

**Purpose**:
Automates Keycloak client creation and configuration.

**Example**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: KeycloakClient
metadata:
  name: workspace-ui
spec:
  realm: onecx
  type: ui
  kcConfig:
    clientId: onecx-workspace-ui
    publicClient: true
    redirectUris: ["https://portal.example.com/*"]
    webOrigins: ["https://portal.example.com"]
```

**Features**:
- Auto-creates client in Keycloak
- Manages client scopes
- Handles client secrets (for backend clients)
- Updates client configuration

---

### onecx-k8s-db-postgresql-operator
**Path**: `/onecx-k8s-db-postgresql-operator`  
**Technology**: Quarkus, Operator SDK

**Purpose**:
Automates PostgreSQL database and schema creation for OneCX applications.

**Example**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: Database
metadata:
  name: workspace-db
spec:
  host: postgresdb
  name: onecx_workspace
  user: workspace_user
  schema: workspace
  extensions:
    - uuid-ossp
    - pg_trgm
```

**Workflow**:
1. Operator creates database if not exists
2. Creates user with password
3. Creates schema
4. Installs extensions
5. Grants permissions

---

### onecx-data-orchestrator-operator
**Path**: `/onecx-data-orchestrator-operator`  
**Technology**: Quarkus, Operator SDK

**Purpose**:
Automates data import/export operations.

**Example**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: Data
metadata:
  name: prod-migration
spec:
  operation: IMPORT
  dataTypes:
    - WORKSPACE
    - THEME
    - PERMISSION
  source:
    type: GIT
    url: "https://github.com/myorg/configs"
    path: "production/"
```

---

## Developer Tools & Libraries

### onecx-quarkus
**Path**: `/onecx-quarkus`  
**Type**: Quarkus Extension Library  
**Technology**: Quarkus, Java 17

**Purpose**:
Collection of Quarkus extensions accelerating OneCX microservice development.

**Extensions**:
- **onecx-tenant**: Multi-tenancy support
- **onecx-permissions**: Permission checking
- **onecx-log**: Structured logging
- **onecx-rest**: REST client/server utilities
- **onecx-test**: Testing utilities

**Use Cases**:
1. **Rapid Development**: Pre-built functionality for common patterns
2. **Consistency**: Standard patterns across all microservices
3. **Multi-Tenancy**: Built-in tenant isolation

**Example**:
```xml
<dependency>
    <groupId>org.tkit.onecx.quarkus</groupId>
    <artifactId>onecx-tenant</artifactId>
</dependency>
```

```java
// Automatic tenant filtering
@Entity
@TenantAware
public class Workspace {
    @Id
    private String id;
    // No need to manually add tenant_id - handled by extension
}
```

**Available Extensions**:
```
onecx-tenant
onecx-permissions
onecx-log
onecx-rest
onecx-test
onecx-parameters
onecx-core
```

---

### onecx-quarkus3-parent
**Path**: `/onecx-quarkus3-parent`  
**Type**: Maven Parent POM  
**Technology**: Maven

**Purpose**:
Parent POM for all OneCX Quarkus applications providing dependency management and build configuration.

**Use Cases**:
1. **Dependency Management**: Centralized version management
2. **Build Plugins**: Standard plugin configuration
3. **Consistent Builds**: Same build setup across all projects

**Usage**:
```xml
<parent>
    <groupId>org.tkit.onecx</groupId>
    <artifactId>onecx-quarkus3-parent</artifactId>
    <version>0.62.0</version>
</parent>

<dependencies>
    <!-- Versions managed by parent -->
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-hibernate-orm-panache</artifactId>
    </dependency>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-rest-client-reactive-jackson</artifactId>
    </dependency>
</dependencies>
```

---

### onecx-nx-plugins
**Path**: `/onecx-nx-plugins`  
**Type**: NX Workspace Plugins  
**Technology**: Node.js, TypeScript, NX

**Purpose**:
Code generators for creating new OneCX Angular applications following best practices.

**Generators**:
- `@onecx/nx-plugin:angular` - Generate Angular microfrontend
- `@onecx/nx-plugin:feature` - Generate feature module
- `@onecx/nx-plugin:search` - Generate search component with NgRx

**Use Cases**:
1. **Project Scaffolding**: Generate complete Angular app structure
2. **Feature Generation**: Add new features to existing apps
3. **Code Consistency**: Generated code follows OneCX patterns

**Example**:
```bash
# Generate new Angular microfrontend
npx create-nx-workspace@latest my-onecx-app \
  --preset=@onecx/nx-plugin

# Generate search feature
nx generate @onecx/nx-plugin:search workspace-search \
  --project=onecx-workspace-ui \
  --path=src/app/workspace

# Generates:
# - workspace-search.component.ts
# - workspace-search.component.html
# - workspace-search.state.ts (NgRx)
# - workspace-search.actions.ts
# - workspace-search.effects.ts
# - workspace-search.selectors.ts
```

**Generated Structure**:
```
onecx-workspace-ui/
├── src/
│   ├── app/
│   │   ├── workspace/
│   │   │   ├── workspace-search/
│   │   │   │   ├── workspace-search.component.ts
│   │   │   │   ├── workspace-search.component.html
│   │   │   │   ├── workspace-search.state.ts
│   │   │   ├── workspace-detail/
│   │   │   ├── workspace.module.ts
│   ├── bootstrap.ts
│   ├── main.ts
├── webpack.config.js (Module Federation)
├── project.json (NX config)
```

---

### onecx-local-env-cli
**Path**: `/onecx-local-env-cli`  
**Type**: CLI Tool  
**Technology**: Node.js, TypeScript

**Purpose**:
Command-line tool for managing local OneCX development environment.

**Commands**:
- `sync` - Synchronize application to local environment
- `menu` - Create menu entries
- `docker` - Generate Docker Compose files

**Use Cases**:
1. **Local Development**: Set up local environment quickly
2. **Service Registration**: Register new services
3. **Menu Management**: Add menu entries

**Example**:
```bash
# Sync UI to local environment
npx @onecx/local-env-cli sync ui onecx-workspace /workspace \
  ./values.yaml \
  --env ./onecx-local-env \
  --workspace admin

# Create menu entry
npx @onecx/local-env-cli menu create my-app \
  "/my-app" \
  "My Application" \
  --badge briefcase \
  --workspace admin

# Generate Docker Compose
npx @onecx/local-env-cli docker create mycustom onecx-myapp \
  --sections svc,bff,ui \
  --uiPath myapp
```

**Generated Files**:
```yaml
# Adds to local-env/values.yaml
products:
  onecx-workspace:
    ui:
      enabled: true
      image: ghcr.io/onecx/onecx-workspace-ui:main
      basePath: /workspace

# Adds to local-env/init-data/workspace-admin.json
{
  "menu": [
    {
      "key": "my-app",
      "name": "My Application",
      "url": "/my-app",
      "badge": "briefcase"
    }
  ]
}
```

---

### onecx-local-env
**Path**: `/onecx-local-env`  
**Type**: Docker Compose Environment  
**Technology**: Docker, Docker Compose

**Purpose**:
Complete local development environment with all OneCX services running in Docker.

**Components**:
- PostgreSQL database
- Keycloak (auth server)
- Traefik (reverse proxy)
- All OneCX core services
- PgAdmin (database UI)

**Use Cases**:
1. **Local Development**: Develop and test applications locally
2. **Integration Testing**: Test with full stack locally
3. **Demo Environment**: Show OneCX capabilities

**Setup**:
```bash
# Clone repository
git clone https://github.com/onecx/onecx-local-env.git
cd onecx-local-env

# Start environment
docker-compose up -d

# Access:
# Portal: http://onecx-portal
# Keycloak: http://keycloak-app
# PgAdmin: http://pgadmin
```

**Services Included**:
```yaml
services:
  postgresdb:
    image: postgres:13.4
    ports: ["5432:5432"]
  
  keycloak-app:
    image: quay.io/keycloak/keycloak:23.0.4
    ports: ["8080:8080"]
  
  onecx-shell-bff:
    image: ghcr.io/onecx/onecx-shell-bff:main-native
  
  onecx-shell-ui:
    image: ghcr.io/onecx/onecx-shell-ui:main
  
  onecx-workspace-svc:
    image: ghcr.io/onecx/onecx-workspace-svc:main-native
  
  # ... 20+ more services
```

**Directory Structure**:
```
onecx-local-env/
├── versions/
│   ├── v1/          # Version 1 (legacy)
│   ├── v2/          # Version 2 (current)
├── init-data/
│   ├── postgres/    # Database init scripts
│   ├── keycloak/    # Keycloak realm exports
│   ├── workspace-admin.json
│   ├── products.json
├── docker-compose.yaml
├── .env
```

---

### onecx-webpack-plugin
**Path**: `/onecx-webpack-plugin`  
**Type**: Webpack Plugin  
**Technology**: Node.js, Webpack

**Purpose**:
Custom Webpack plugin for Module Federation configuration in OneCX Angular apps.

**Use Cases**:
1. **Module Federation**: Configure remote module loading
2. **Shared Dependencies**: Define shared libraries
3. **Build Optimization**: Optimize bundles

**Example**:
```javascript
// webpack.config.js
const OneCXWebpackPlugin = require('@onecx/webpack-plugin');

module.exports = {
  plugins: [
    new OneCXWebpackPlugin({
      appName: 'onecx-workspace-ui',
      exposes: {
        './OnecxWorkspaceModule': './src/app/workspace/workspace.module.ts'
      },
      shared: {
        '@angular/core': { singleton: true },
        '@angular/common': { singleton: true },
        '@onecx/portal-integration-angular': { singleton: true }
      }
    })
  ]
};
```

---

### onecx-test
**Path**: `/onecx-test`  
**Type**: Testing Framework  
**Technology**: Java, TestContainers

**Purpose**:
Testing utilities and base classes for OneCX applications.

---

### onecx-test-operator
**Path**: `/onecx-test-operator`  
**Type**: Testing Tool  
**Technology**: Quarkus, Kubernetes

**Purpose**:
Operator for running tests in Kubernetes environment.

---

### onecx-integration-tests
**Path**: `/onecx-integration-tests`  
**Type**: Integration Test Suite  
**Technology**: TypeScript, Jest, TestContainers

**Purpose**:
Integration tests for OneCX platform using TestContainers.

**Use Cases**:
1. **End-to-End Testing**: Test complete workflows
2. **Container Testing**: Test services in containers
3. **Integration Validation**: Verify service interactions

**Example**:
```typescript
describe('Workspace Integration Test', () => {
  let postgres: StartedPostgresContainer;
  let keycloak: StartedKeycloakContainer;
  let workspaceSvc: StartedWorkspaceSvcContainer;

  beforeAll(async () => {
    const network = await new Network().start();
    
    postgres = await new OnecxPostgresContainer('postgres:13.4')
      .withNetwork(network)
      .start();
    
    keycloak = await new OnecxKeycloakContainer('quay.io/keycloak/keycloak:23.0.4', postgres)
      .withNetwork(network)
      .start();
    
    workspaceSvc = await new WorkspaceSvcContainer('ghcr.io/onecx/onecx-workspace-svc:main-native', postgres, keycloak)
      .withNetwork(network)
      .start();
  });

  it('should create workspace', async () => {
    const response = await axios.post(
      `http://localhost:${workspaceSvc.getPort()}/internal/workspaces`,
      {
        name: 'test-workspace',
        theme: 'default'
      }
    );
    
    expect(response.status).toBe(201);
  });
});
```

---

### onecx-test-oidc
**Path**: `/onecx-test-oidc`  
**Type**: Testing Tool  
**Technology**: Quarkus

**Purpose**:
Mock OIDC server for testing authentication flows.

---

## CI/CD & Automation

### ci-common
**Path**: `/ci-common`  
**Type**: GitHub Actions Workflows  
**Technology**: GitHub Actions, YAML

**Purpose**:
Reusable GitHub Actions workflows for CI/CD across all OneCX repositories.

**Workflows**:
- `helm-build.yml` - Build and publish Helm charts
- `helm-release.yml` - Release Helm charts
- `docker-build.yml` - Build and push Docker images
- `docker-release.yml` - Release Docker images

**Use Cases**:
1. **Standardized CI/CD**: Consistent build process across repos
2. **Reusability**: Single workflow definition, used by many repos
3. **Maintenance**: Update once, applies to all

**Example Usage**:
```yaml
# .github/workflows/build.yml in any repo
name: build
on:
  push:
    branches: [main]

jobs:
  java:
    uses: onecx/ci-common/.github/workflows/docker-build.yml@v1
    secrets: inherit
    with:
      samoDockerFile: 'src/main/docker/Dockerfile'
      artifact: 'package'
```

---

### ci-quarkus
**Path**: `/ci-quarkus`  
**Type**: GitHub Actions Workflows  
**Technology**: GitHub Actions

**Purpose**:
Specialized CI/CD workflows for Quarkus applications.

**Workflows**:
- `quarkus-build.yml` - Build JVM and push Docker image
- `quarkus-build-native.yml` - Build native and push Docker image
- `quarkus-build-native-multi.yml` - Multi-architecture native builds

**Example**:
```yaml
# .github/workflows/build.yml
name: build
on: [push]

jobs:
  quarkus:
    uses: onecx/ci-quarkus/.github/workflows/quarkus-build.yml@v1
    secrets: inherit
    with:
      jdk: '17'
      push: true
      platform: 'linux/amd64,linux/arm64'
```

---

### ci-java-lib
**Path**: `/ci-java-lib`  
**Type**: GitHub Actions Workflows

**Purpose**:
CI/CD workflows for Java library projects (not Docker images).

---

### ci-angular
**Path**: `/ci-angular`  
**Type**: GitHub Actions Workflows

**Purpose**:
CI/CD workflows for Angular applications.

**Workflows**:
- Build Angular app
- Run tests
- Build Docker image
- Push to registry

---

### ci-npm
**Path**: `/ci-npm`  
**Type**: GitHub Actions Workflows

**Purpose**:
CI/CD workflows for NPM packages.

---

### ci-product
**Path**: `/ci-product`  
**Type**: GitHub Actions Workflows

**Purpose**:
CI/CD workflows for OneCX product bundles (multi-repo products).

---

### bundle-install-action
**Path**: `/bundle-install-action`  
**Type**: GitHub Action  
**Technology**: Node.js, GitHub Actions

**Purpose**:
Custom GitHub Action for installing OneCX bundle dependencies.

---

### code-scan-summary
**Path**: `/code-scan-summary`  
**Type**: GitHub Action  
**Technology**: Node.js

**Purpose**:
Generates code quality summary from SonarQube scans.

---

## Docker Base Images

### docker-quarkus-jvm
**Path**: `/docker-quarkus-jvm`  
**Type**: Base Docker Image  
**Technology**: Docker, Java

**Purpose**:
Base Docker image for Quarkus applications running in JVM mode.

**Use Cases**:
1. **Base Layer**: Foundation for all Quarkus JVM Docker images
2. **Optimized**: Pre-configured for Quarkus apps
3. **Security**: Regularly updated with security patches

**Example Dockerfile**:
```dockerfile
FROM ghcr.io/onecx/docker-quarkus-jvm:0.5.0

COPY --chown=1001:0 target/quarkus-app/lib/ /deployments/lib/
COPY --chown=1001:0 target/quarkus-app/*.jar /deployments/
COPY --chown=1001:0 target/quarkus-app/app/ /deployments/app/
COPY --chown=1001:0 target/quarkus-app/quarkus/ /deployments/quarkus/

EXPOSE 8080
USER 1001
```

**Features**:
- Based on Red Hat UBI
- Non-root user (1001)
- Optimized Java options
- Health check support

---

### docker-quarkus-native
**Path**: `/docker-quarkus-native`  
**Type**: Base Docker Image  
**Technology**: Docker, GraalVM

**Purpose**:
Base Docker image for Quarkus applications compiled to native executables.

**Example Dockerfile**:
```dockerfile
FROM ghcr.io/onecx/docker-quarkus-native:0.3.0

WORKDIR /work/
COPY --chown=1001:0 target/*-runner /work/application

EXPOSE 8080
USER 1001

CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
```

**Benefits**:
- Minimal image size (~50MB vs 500MB JVM)
- Fast startup (milliseconds)
- Low memory footprint

---

### docker-spa-base
**Path**: `/docker-spa-base`  
**Type**: Base Docker Image  
**Technology**: Docker, Nginx

**Purpose**:
Base Docker image for Angular Single Page Applications.

**Example Dockerfile**:
```dockerfile
FROM ghcr.io/onecx/docker-spa-base:latest

COPY dist/onecx-workspace-ui /usr/share/nginx/html/

EXPOSE 8080
```

**Features**:
- Nginx web server
- Optimized for SPAs
- Gzip compression
- Security headers

---

## Helm Charts

### helm-quarkus-app
**Path**: `/helm-quarkus-app`  
**Type**: Helm Chart Template  
**Technology**: Helm, Kubernetes

**Purpose**:
Reusable Helm chart for deploying Quarkus applications to Kubernetes.

**Use Cases**:
1. **Standardized Deployment**: Same chart structure for all Quarkus apps
2. **Configuration**: Customize via values.yaml
3. **Best Practices**: Built-in security and scalability

**Usage**:
```yaml
# Chart.yaml
dependencies:
  - name: helm-quarkus-app
    version: ^0
    repository: oci://ghcr.io/onecx/charts
    alias: app

# values.yaml
app:
  name: workspace-svc
  image:
    repository: ghcr.io/onecx/onecx-workspace-svc
    tag: 2.5.0
  
  db:
    enabled: true
    name: onecx_workspace
  
  operator:
    keycloak:
      client:
        enabled: true
        spec:
          realm: onecx
          type: machine
```

**Generated Resources**:
- Deployment
- Service
- ConfigMap
- Secret
- Ingress (optional)
- HorizontalPodAutoscaler (optional)
- Database CRD (if enabled)
- Keycloak Client CRD (if enabled)

---

### helm-angular-app
**Path**: `/helm-angular-app`  
**Type**: Helm Chart Template  
**Technology**: Helm, Kubernetes

**Purpose**:
Reusable Helm chart for deploying Angular applications.

**Example**:
```yaml
# Chart.yaml
dependencies:
  - name: helm-angular-app
    version: ^0
    repository: oci://ghcr.io/onecx/charts
    alias: ui

# values.yaml
ui:
  name: workspace-ui
  image:
    repository: ghcr.io/onecx/onecx-workspace-ui
    tag: 2.5.0
  
  operator:
    keycloak:
      client:
        enabled: true
        spec:
          realm: onecx
          type: ui
```

---

### helm-nextjs-app
**Path**: `/helm-nextjs-app`  
**Type**: Helm Chart Template

**Purpose**:
Helm chart for Next.js applications.

---

### helm-product
**Path**: `/helm-product`  
**Type**: Helm Chart Template

**Purpose**:
Umbrella Helm chart for OneCX products (bundles of SVC, BFF, UI).

**Example**:
```yaml
# onecx-workspace/helm/Chart.yaml
dependencies:
  - name: helm-product
    version: ^0
    repository: oci://ghcr.io/onecx/charts
    alias: product
  - name: onecx-workspace-svc
    version: "*-0"
    repository: oci://ghcr.io/onecx/charts
    alias: svc
  - name: onecx-workspace-bff
    version: "*-0"
    repository: oci://ghcr.io/onecx/charts
    alias: bff
  - name: onecx-workspace-ui
    version: "*-0"
    repository: oci://ghcr.io/onecx/charts
    alias: ui
```

---

## Documentation

### docs
**Path**: `/docs`  
**Type**: Documentation Site  
**Technology**: Antora, AsciiDoc

**Purpose**:
Main documentation website for OneCX platform.

**Content**:
- Platform overview
- Architecture documentation
- Developer guides
- User guides

**Build**:
```bash
# Generate docs site
npm install
npm run build

# Output: build/site/index.html
```

---

### docs-antora-ui
**Path**: `/docs-antora-ui`  
**Type**: UI Theme  
**Technology**: Antora, CSS, JavaScript

**Purpose**:
Custom UI theme for Antora documentation site.

---

### docs-contribution
**Path**: `/docs-contribution`  
**Type**: Documentation  
**Technology**: AsciiDoc

**Purpose**:
Guidelines for contributing to OneCX project.

---

### docs-guides
**Path**: `/docs-guides`  
**Type**: Documentation

**Purpose**:
General development guides.

---

### docs-guides-ui
**Path**: `/docs-guides-ui`  
**Type**: Documentation  
**Technology**: AsciiDoc

**Purpose**:
Angular/UI development guides for OneCX.

**Topics**:
- Module Federation setup
- Component development
- State management with NgRx
- Translation/i18n
- Styling and theming

---

### docs-guides-quarkus
**Path**: `/docs-guides-quarkus`  
**Type**: Documentation  
**Technology**: AsciiDoc

**Purpose**:
Quarkus development guides for OneCX.

**Topics**:
- Project structure
- REST API development
- Database access with Hibernate
- Security configuration
- Testing strategies

---

### docs-guides-bpmn
**Path**: `/docs-guides-bpmn`  
**Type**: Documentation

**Purpose**:
BPMN/workflow development guides.

---

### docs-guides-cicd
**Path**: `/docs-guides-cicd`  
**Type**: Documentation

**Purpose**:
CI/CD pipeline guides.

---

### docs-guides-documentation
**Path**: `/docs-guides-documentation`  
**Type**: Documentation

**Purpose**:
Guide for writing OneCX documentation.

---

### docs-guides-local-dev
**Path**: `/docs-guides-local-dev`  
**Type**: Documentation

**Purpose**:
Local development environment setup guides.

---

## Development & Testing

### onecx-develop
**Path**: `/onecx-develop`  
**Type**: Development Tools

**Purpose**:
Development utilities and tools.

---

### onecx-develop-adminer
**Path**: `/onecx-develop-adminer`  
**Type**: Development Tool  
**Technology**: Adminer, PHP

**Purpose**:
Lightweight database management UI (alternative to PgAdmin).

---

### onecx-db-check
**Path**: `/onecx-db-check`  
**Type**: Utility Tool  
**Technology**: Quarkus

**Purpose**:
Database connection health check utility.

**Use Cases**:
1. **Init Container**: Check database readiness before starting app
2. **Health Check**: Verify database connectivity
3. **Migration Check**: Validate schema exists

**Example**:
```yaml
# Kubernetes init container
initContainers:
  - name: db-check
    image: ghcr.io/onecx/onecx-db-check:latest
    env:
      - name: DB_HOST
        value: postgresdb
      - name: DB_PORT
        value: "5432"
      - name: DB_NAME
        value: onecx_workspace
      - name: DB_USER
        valueFrom:
          secretKeyRef:
            name: db-secret
            key: username
      - name: DB_PASSWORD
        valueFrom:
          secretKeyRef:
            name: db-secret
            key: password
```

---

### adminer
**Path**: `/adminer`  
**Type**: Docker Image  
**Technology**: Adminer

**Purpose**:
Pre-configured Adminer database UI.

---

### onecx-devops
**Path**: `/onecx-devops`  
**Type**: DevOps Tools  
**Technology**: Terraform, Bash

**Purpose**:
Infrastructure as Code and automation scripts for OneCX.

**Content**:
- Terraform scripts for GitHub organization
- Kubernetes manifests
- Automation scripts

**Example**:
```hcl
# Terraform: Create GitHub repository
module "onecx-workspace" {
  source = "../../modules/product"
  repository_name = "onecx-workspace"
  repository_description = "Workspace Management"
  topics = ["product", "workspace"]
  team_id = module.onecx-team.team_id
}
```

---

## Example Applications

### onecx-hello-world
**Path**: `/onecx-hello-world`  
**Type**: Example Product  
**Components**: SVC, BFF, UI

**Purpose**:
Simple "Hello World" example showing complete OneCX application structure.

**Use Cases**:
1. **Learning**: Understand OneCX architecture
2. **Template**: Starting point for new applications
3. **Testing**: Verify platform setup

**Components**:

#### onecx-hello-world-svc
**Example REST Endpoint**:
```java
@Path("/internal/hello")
public class HelloWorldRestController {
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response sayHello() {
        return Response.ok(Map.of("message", "Hello from OneCX!")).build();
    }
    
    @GET
    @Path("/{name}")
    public Response sayHelloTo(@PathParam("name") String name) {
        return Response.ok(Map.of("message", "Hello " + name + "!")).build();
    }
}
```

#### onecx-hello-world-bff
**Example BFF**:
```java
@Path("/hello")
public class HelloWorldBFFController {
    
    @Inject
    @RestClient
    HelloWorldServiceClient serviceClient;
    
    @GET
    @RolesAllowed("HELLO#VIEW")
    public Response getHello() {
        // Validate permissions, then forward to service
        return serviceClient.sayHello();
    }
}
```

#### onecx-hello-world-ui
**Example Component**:
```typescript
@Component({
  selector: 'app-hello-world',
  template: `
    <div class="card">
      <h2>Hello World</h2>
      <p>{{ message }}</p>
      <button pButton (click)="loadMessage()">Get Message</button>
    </div>
  `
})
export class HelloWorldComponent {
  message = '';

  constructor(private api: HelloWorldBFFService) {}

  loadMessage() {
    this.api.getHello().subscribe(
      response => this.message = response.message
    );
  }
}
```

---

### onecx-example
**Path**: `/onecx-example`  
**Type**: Example Product  
**Components**: Custom Auth BFF, Custom Auth UI

**Purpose**:
Advanced examples showing custom authentication and authorization patterns.

---

### ping-quarkus
**Path**: `/ping-quarkus`  
**Type**: Test Application  
**Technology**: Quarkus

**Purpose**:
Minimal Quarkus application for testing infrastructure.

**Example**:
```java
@Path("/ping")
public class PingResource {
    
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String ping() {
        return "pong";
    }
}
```

**Use Cases**:
1. **Infrastructure Testing**: Verify Kubernetes cluster works
2. **Network Testing**: Test service discovery
3. **Load Testing**: Simple endpoint for load tests

---

### ping-angular
**Path**: `/ping-angular`  
**Type**: Test Application  
**Technology**: Angular

**Purpose**:
Minimal Angular application for testing.

---

### ping-product
**Path**: `/ping-product`  
**Type**: Test Product

**Purpose**:
Complete product example for testing.

---

## Additional Repositories

### onecx-k8s
**Path**: `/onecx-k8s`  
**Type**: Kubernetes Management  
**Technology**: Helm, Kubernetes

**Purpose**:
Kubernetes resources and CRDs for OneCX platform.

**Components**:
- onecx-k8s-crds
- onecx-k8s-db-postgresql-operator

---

### onecx-k8s-crds
**Path**: `/onecx-k8s-crds`  
**Type**: Custom Resource Definitions  
**Technology**: Kubernetes

**Purpose**:
Kubernetes CRD definitions for OneCX operators.

**CRDs Defined**:
```yaml
# Product CRD
apiVersion: onecx.tkit.org/v1
kind: Product

# Permission CRD
apiVersion: onecx.tkit.org/v1
kind: Permission

# Parameter CRD
apiVersion: onecx.tkit.org/v1
kind: Parameter

# Database CRD
apiVersion: onecx.tkit.org/v1
kind: Database

# KeycloakClient CRD
apiVersion: onecx.tkit.org/v1
kind: KeycloakClient

# Data CRD (orchestrator)
apiVersion: onecx.tkit.org/v1
kind: Data
```

**Installation**:
```bash
# Install CRDs
kubectl apply -f onecx-k8s-crds/crds/

# Or via Helm
helm install onecx-crds oci://ghcr.io/onecx/charts/onecx-k8s-crds
```

---

### onecx-infra
**Path**: `/onecx-infra`  
**Type**: Infrastructure Product  
**Components**: KC-Operator

**Purpose**:
Infrastructure management tools and operators.

---

### onecx
**Path**: `/onecx`  
**Type**: Meta Repository

**Purpose**:
Organization-level configuration and documentation.

---

### bundle
**Path**: `/bundle`  
**Type**: Product Bundle

**Purpose**:
Complete OneCX product bundle for deployment.

---

### userdocs
**Path**: `/userdocs`  
**Type**: User Documentation

**Purpose**:
End-user documentation and help files.

---

### release-notes
**Path**: `/release-notes`  
**Type**: Release Documentation

**Purpose**:
Release notes and changelog.

---

## Repository Organization Summary

### By Type

**Business Applications**: 13 products
- workspace, user-profile, announcement, permission
- theme, product-store, tenant, parameter
- search-config, help, bookmark, data-orchestrator
- welcome, iam, admin

**Kubernetes Operators**: 7 operators
- permission-operator, parameter-operator, product-store-operator
- infra-kc-operator, iam-kc-client-operator
- k8s-db-postgresql-operator, data-orchestrator-operator

**Developer Libraries**: 5 libraries
- onecx-quarkus, onecx-quarkus3-parent
- onecx-portal-ui-libs, onecx-nx-plugins
- onecx-webpack-plugin

**CI/CD Tools**: 7 workflows
- ci-common, ci-quarkus, ci-angular
- ci-npm, ci-java-lib, ci-product
- bundle-install-action

**Docker Images**: 3 base images
- docker-quarkus-jvm, docker-quarkus-native
- docker-spa-base

**Helm Charts**: 4 charts
- helm-quarkus-app, helm-angular-app
- helm-nextjs-app, helm-product

**Documentation**: 9 docs repos
- docs, docs-antora-ui, docs-contribution
- docs-guides, docs-guides-ui, docs-guides-quarkus
- docs-guides-bpmn, docs-guides-cicd, docs-guides-documentation

**Testing**: 4 test repos
- onecx-integration-tests, onecx-test
- onecx-test-operator, onecx-test-oidc

**Examples**: 4 examples
- onecx-hello-world, onecx-example
- ping-quarkus, ping-angular, ping-product

---

## Technology Stack Overview

### Backend
- **Framework**: Quarkus 3.x
- **Language**: Java 17
- **Database**: PostgreSQL 13+
- **ORM**: Hibernate/Panache
- **API**: REST (JAX-RS), OpenAPI
- **Security**: OAuth2/OIDC, JWT, Keycloak
- **Build**: Maven 3.9+

### Frontend
- **Framework**: Angular 19+
- **UI Library**: PrimeNG
- **State Management**: NgRx
- **Module Federation**: Webpack 5
- **Build**: NX, Webpack
- **Language**: TypeScript 5.x

### Infrastructure
- **Container Runtime**: Docker
- **Orchestration**: Kubernetes
- **Operators**: Quarkus Operator SDK
- **Service Mesh**: Optional (Istio compatible)
- **Ingress**: Traefik (local), Nginx (prod)

### DevOps
- **CI/CD**: GitHub Actions
- **IaC**: Helm 3, Terraform
- **Registry**: GitHub Container Registry
- **Monitoring**: Prometheus compatible
- **Logging**: ELK stack compatible

---

## Repository Naming Conventions

### Patterns
- **Products**: `onecx-<domain>` (e.g., `onecx-workspace`)
- **Services**: `onecx-<domain>-svc` (e.g., `onecx-workspace-svc`)
- **BFFs**: `onecx-<domain>-bff` (e.g., `onecx-workspace-bff`)
- **UIs**: `onecx-<domain>-ui` (e.g., `onecx-workspace-ui`)
- **Operators**: `onecx-<domain>-operator` (e.g., `onecx-permission-operator`)
- **CI**: `ci-<technology>` (e.g., `ci-quarkus`)
- **Docker**: `docker-<purpose>` (e.g., `docker-quarkus-jvm`)
- **Helm**: `helm-<purpose>` (e.g., `helm-quarkus-app`)
- **Docs**: `docs-<category>` (e.g., `docs-guides-ui`)

---

## Getting Started with OneCX Development

### 1. Setup Local Environment
```bash
git clone https://github.com/onecx/onecx-local-env.git
cd onecx-local-env
docker-compose up -d
```

### 2. Create New Application
```bash
# Generate Angular microfrontend
npx create-nx-workspace@latest my-app \
  --preset=@onecx/nx-plugin

# Or use Hello World as template
git clone https://github.com/onecx/onecx-hello-world.git
cd onecx-hello-world
```

### 3. Register Application
```yaml
# Create Product CRD
apiVersion: onecx.tkit.org/v1
kind: Product
metadata:
  name: my-app
spec:
  productName: my-app
  microfrontends:
    - mfeName: my-app-ui
      remoteBaseUrl: "http://my-app-ui:8080"
```

### 4. Deploy to Local Environment
```bash
# Add to onecx-local-env
npx @onecx/local-env-cli sync ui my-app /my-app ./values.yaml

# Start services
docker-compose up my-app-svc my-app-bff my-app-ui
```

---

## Conclusion

This catalog provides a comprehensive overview of all 100+ repositories in the OneCX ecosystem. Each repository serves a specific purpose in building, deploying, and operating enterprise-grade portal applications.

**Key Takeaways**:
1. **Modular Architecture**: Each repository has a single responsibility
2. **Reusability**: Shared libraries, charts, and workflows reduce duplication
3. **Automation**: Operators automate Kubernetes resource management
4. **Developer Experience**: Tools like NX plugins and local-env accelerate development
5. **Best Practices**: CI/CD, Docker images, and Helm charts enforce standards

For detailed documentation on specific repositories, refer to their individual README files and the main documentation site at https://onecx.github.io/docs/

---

**Document End**
