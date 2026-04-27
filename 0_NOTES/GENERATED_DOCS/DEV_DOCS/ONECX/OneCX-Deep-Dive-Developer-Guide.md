# OneCX Platform - Deep Dive Developer Guide

> **Version:** 6.x  
> **Last Updated:** February 2026  
> **Target Audience:** Senior Developers, Solution Architects, Technical Leads  
> **Prerequisite**: Read "OneCX-Complete-Technical-Documentation.md" first

---

## Table of Contents

### Core Platform Components
1. [Document Purpose](#document-purpose)
2. [OneCX Workspace - Complete Deep Dive](#onecx-workspace---complete-deep-dive)
3. [OneCX Tenant - Complete Deep Dive](#onecx-tenant---complete-deep-dive)
4. [OneCX User Profile - Complete Deep Dive](#onecx-user-profile---complete-deep-dive)
5. [OneCX Permission - Complete Deep Dive](#onecx-permission---complete-deep-dive)
6. [OneCX Theme - Complete Deep Dive](#onecx-theme---complete-deep-dive)
7. [OneCX Product Store - Complete Deep Dive](#onecx-product-store---complete-deep-dive)
8. [OneCX Parameter - Complete Deep Dive](#onecx-parameter---complete-deep-dive)

### Application Features
9. [OneCX Announcement - Complete Deep Dive](#onecx-announcement---complete-deep-dive)
10. [OneCX Bookmark - Complete Deep Dive](#onecx-bookmark---complete-deep-dive)
11. [OneCX Help - Complete Deep Dive](#onecx-help---complete-deep-dive)
12. [OneCX Search Config - Complete Deep Dive](#onecx-search-config---complete-deep-dive)

### Frontend Platform
13. [OneCX Shell - Complete Deep Dive](#onecx-shell---complete-deep-dive)
14. [OneCX Portal UI Libs - Complete Deep Dive](#onecx-portal-ui-libs---complete-deep-dive)

### Infrastructure
15. [OneCX IAM (Identity & Access Management)](#onecx-iam---complete-deep-dive)
16. [OneCX Operators](#onecx-operators)
17. [Cross-Cutting Concerns](#cross-cutting-concerns)
18. [Advanced Patterns](#advanced-patterns)

---

## Document Purpose

This document provides **extreme technical detail** for core OneCX repositories including:
- Complete folder structure breakdown
- Every REST API endpoint with request/response examples
- Complete database schema with relationships
- Frontend component architecture
- State management patterns
- Real production code examples

**Scope**: This covers the top 5 critical repositories in extreme detail. For other repositories, refer to the Repository Catalog.

---

## OneCX Workspace - Complete Deep Dive

### Overview
Workspace Management is the **most critical** component in OneCX. It defines isolated environments with specific applications, themes, and user groups.

**GitHub**: `onecx-workspace`  
**Components**: workspace-svc, workspace-bff, workspace-ui  
**Lines of Code**: ~15,000 (service), ~8,000 (UI)  
**Database Tables**: 8 tables

---

### onecx-workspace-svc - Complete Service Breakdown

#### Folder Structure
```
onecx-workspace-svc/
├── src/main/java/org/tkit/onecx/workspace/
│   ├── domain/
│   │   ├── daos/              # Data Access Objects
│   │   │   ├── MenuItemDAO.java
│   │   │   ├── ProductDAO.java
│   │   │   ├── RoleDAO.java
│   │   │   ├── SlotDAO.java
│   │   │   └── WorkspaceDAO.java
│   │   ├── models/            # JPA Entities
│   │   │   ├── Assignment.java
│   │   │   ├── Component.java
│   │   │   ├── Image.java
│   │   │   ├── MenuItem.java
│   │   │   ├── Microfrontend.java
│   │   │   ├── Product.java
│   │   │   ├── Role.java
│   │   │   ├── Slot.java
│   │   │   ├── Workspace.java
│   │   │   └── WorkspaceAddress.java
│   │   └── criteria/          # Search Criteria
│   │       ├── AssignmentSearchCriteria.java
│   │       ├── MenuItemLoadCriteria.java
│   │       ├── ProductSearchCriteria.java
│   │       ├── RoleSearchCriteria.java
│   │       └── WorkspaceSearchCriteria.java
│   ├── rs/                    # REST Controllers
│   │   ├── internal/          # Internal APIs (for BFF/UI)
│   │   │   ├── controllers/
│   │   │   │   ├── MenuInternalRestController.java
│   │   │   │   ├── ProductsInternalRestController.java
│   │   │   │   ├── RolesInternalRestController.java
│   │   │   │   ├── SlotsInternalRestController.java
│   │   │   │   └── WorkspaceInternalRestController.java
│   │   │   └── mappers/       # DTOs to Entity mapping
│   │   │       ├── InternalExceptionMapper.java
│   │   │       ├── MenuInternalMapper.java
│   │   │       ├── ProductMapper.java
│   │   │       ├── RoleMapper.java
│   │   │       ├── SlotMapper.java
│   │   │       └── WorkspaceMapper.java
│   │   ├── user/              # User-facing APIs
│   │   │   ├── controllers/
│   │   │   │   ├── UserMenuRestController.java
│   │   │   │   └── UserWorkspaceRestController.java
│   │   │   ├── mappers/
│   │   │   │   └── UserMenuMapper.java
│   │   │   └── services/
│   │   │       └── ClaimService.java
│   │   └── v1/                # Versioned External APIs
│   │       └── controllers/
│   │           └── WorkspaceV1RestController.java
│   └── Application.java
├── src/main/resources/
│   ├── application.properties
│   └── import.sql             # Initial data
└── src/test/                  # Tests
```

---

#### Complete Database Schema

**Purpose**: The database schema defines how OneCX stores workspace configurations, supporting multi-tenancy, hierarchical menus, role-based access, and dynamic application loading.

**Why This Design?**
- **8 separate tables**: Each table has a focused responsibility (Single Responsibility Principle)
- **Tenant isolation**: `tenant_id` column in every table ensures data separation
- **Cascading deletes**: When workspace is deleted, all related data (products, menus, roles) is automatically removed
- **Unique constraints**: Prevent duplicate workspace names or URLs within same tenant

**Key Relationships**:
```
Workspace (1) --< (many) Products --< (many) Microfrontends
Workspace (1) --< (many) Menu Items (hierarchical, self-join)
Workspace (1) --< (many) Roles --< (many) Assignments --< (many) Menu Items
Workspace (1) --< (many) Slots (extension points for UI)
Workspace (1) --< (1) Image (logo storage)
```

**When to Use**: Every OneCX installation needs workspace tables - they're the foundation for organizing applications, users, and permissions.

```sql
-- Main Workspace Table
CREATE TABLE WORKSPACE (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    -- Core Fields
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    theme VARCHAR(255),
    base_url VARCHAR(255) NOT NULL,
    home_page VARCHAR(255),
    mandatory BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    
    -- Branding
    logo_url VARCHAR(500),
    small_logo_url VARCHAR(500),
    company_name VARCHAR(255),
    phone_number VARCHAR(50),
    footer_label VARCHAR(255),
    rss_feed_url VARCHAR(500),
    
    -- Address (Embedded)
    street VARCHAR(255),
    street_no VARCHAR(50),
    city VARCHAR(255),
    country VARCHAR(255),
    postal_code VARCHAR(20),
    
    -- Internationalization (JSONB)
    i18n JSONB,
    
    -- Operator flag
    operator BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT workspace_name_tenant_id UNIQUE (name, tenant_id),
    CONSTRAINT workspace_base_url_tenant_id UNIQUE (base_url, tenant_id)
);

-- Product Table (Applications in workspace)
CREATE TABLE PRODUCT (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    workspace_guid VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    base_url VARCHAR(255) NOT NULL,
    operator BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (workspace_guid) REFERENCES WORKSPACE(guid) ON DELETE CASCADE,
    CONSTRAINT product_name_workspace UNIQUE (product_name, workspace_guid)
);

-- Microfrontend Table
CREATE TABLE MICROFRONTEND (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    product_guid VARCHAR(255) NOT NULL,
    mfe_id VARCHAR(255) NOT NULL,
    base_path VARCHAR(255) NOT NULL,
    exposed_module VARCHAR(255),
    remote_base_url VARCHAR(500),
    remote_name VARCHAR(255),
    technology VARCHAR(50),
    type VARCHAR(50),
    
    FOREIGN KEY (product_guid) REFERENCES PRODUCT(guid) ON DELETE CASCADE,
    CONSTRAINT mfe_id_product UNIQUE (mfe_id, product_guid)
);

-- Menu Item Table (Hierarchical)
CREATE TABLE MENU_ITEM (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    workspace_guid VARCHAR(255) NOT NULL,
    parent_item_id VARCHAR(255),
    position INTEGER DEFAULT 0,
    key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    badge VARCHAR(50),
    disabled BOOLEAN DEFAULT FALSE,
    external BOOLEAN DEFAULT FALSE,
    scope VARCHAR(50), -- WORKSPACE, APP, PAGE
    
    -- i18n
    i18n JSONB,
    
    FOREIGN KEY (workspace_guid) REFERENCES WORKSPACE(guid) ON DELETE CASCADE,
    FOREIGN KEY (parent_item_id) REFERENCES MENU_ITEM(guid) ON DELETE CASCADE,
    CONSTRAINT menu_key_workspace UNIQUE (key, workspace_guid)
);

-- Role Table (RBAC)
CREATE TABLE ROLE (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    workspace_guid VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    operator BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (workspace_guid) REFERENCES WORKSPACE(guid) ON DELETE CASCADE,
    CONSTRAINT role_name_workspace UNIQUE (name, workspace_guid)
);

-- Assignment Table (many-to-many: Role <-> Menu)
CREATE TABLE ASSIGNMENT (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    role_guid VARCHAR(255) NOT NULL,
    menu_item_guid VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (role_guid) REFERENCES ROLE(guid) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_guid) REFERENCES MENU_ITEM(guid) ON DELETE CASCADE,
    CONSTRAINT assignment_role_menu UNIQUE (role_guid, menu_item_guid)
);

-- Slot Table (UI extension points)
CREATE TABLE SLOT (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    workspace_guid VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    component VARCHAR(255) NOT NULL, -- Remote component reference
    deprecated BOOLEAN DEFAULT FALSE,
    undeployed BOOLEAN DEFAULT FALSE,
    operator BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (workspace_guid) REFERENCES WORKSPACE(guid) ON DELETE CASCADE,
    CONSTRAINT slot_name_workspace UNIQUE (name, workspace_guid)
);

-- Image Table (Logo storage)
CREATE TABLE IMAGE (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    ref_id VARCHAR(255) NOT NULL,   -- Workspace GUID or Product GUID
    ref_type VARCHAR(50) NOT NULL,  -- LOGO, SMALL_LOGO
    data_url TEXT,                  -- Base64 or URL
    mime_type VARCHAR(100),
    length INTEGER,
    
    CONSTRAINT image_ref UNIQUE (ref_id, ref_type)
);

-- Indexes for Performance
CREATE INDEX idx_workspace_name ON WORKSPACE(name);
CREATE INDEX idx_workspace_tenant ON WORKSPACE(tenant_id);
CREATE INDEX idx_product_workspace ON PRODUCT(workspace_guid);
CREATE INDEX idx_product_name ON PRODUCT(product_name);
CREATE INDEX idx_mfe_product ON MICROFRONTEND(product_guid);
CREATE INDEX idx_menu_workspace ON MENU_ITEM(workspace_guid);
CREATE INDEX idx_menu_parent ON MENU_ITEM(parent_item_id);
CREATE INDEX idx_role_workspace ON ROLE(workspace_guid);
CREATE INDEX idx_slot_workspace ON SLOT(workspace_guid);
```

**Relationships**:
```
WORKSPACE (1) ----< (M) PRODUCT
PRODUCT (1) ----< (M) MICROFRONTEND
WORKSPACE (1) ----< (M) MENU_ITEM
MENU_ITEM (1) ----< (M) MENU_ITEM (self-join, hierarchical)
WORKSPACE (1) ----< (M) ROLE
WORKSPACE (1) ----< (M) SLOT
ROLE (M) ----< (M) MENU_ITEM (through ASSIGNMENT)
```

---

#### Complete REST API Documentation

**Purpose**: REST APIs provide programmatic access to workspace management, enabling automation, UI interactions, and third-party integrations.

**Why Multiple API Layers?**
- **Internal APIs** (`/internal/*`): Called by BFF, no direct user access, full CRUD operations
- **User APIs** (`/user/*`): Called by frontend, filtered by user permissions in JWT token
- **External APIs** (`/v1/*`): Versioned public APIs for external integrations

**Security Model**:
- Internal APIs require service-to-service authentication (BFF → Service)
- User APIs validate JWT tokens and filter by tenant
- All endpoints return 403 if permission check fails

**When to Use Each**:
- **Internal**: Building admin UI, bulk operations, full data access
- **User**: Building user-facing features, showing only permitted workspaces
- **External**: Third-party tools, CI/CD pipelines, automation scripts

---

##### 1. Workspace Management API

**Base Path**: `/internal/workspaces`

###### Create Workspace
```http
POST /internal/workspaces
Content-Type: application/json

{
  "name": "sales-workspace",
  "displayName": "Sales Department",
  "description": "Workspace for sales team",
  "theme": "sales-theme",
  "baseUrl": "/sales",
  "homePage": "/sales/dashboard",
  "companyName": "ACME Corp",
  "phoneNumber": "+1-555-1234",
  "logoUrl": "https://cdn.example.com/sales-logo.png",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA",
    "postalCode": "10001"
  },
  "i18n": {
    "en": {
      "welcome": "Welcome to Sales",
      "dashboard": "Dashboard"
    },
    "de": {
      "welcome": "Willkommen im Vertrieb",
      "dashboard": "Übersicht"
    }
  }
}

Response: 201 Created
{
  "guid": "ws-12345",
  "name": "sales-workspace",
  "displayName": "Sales Department",
  "creationDate": "2026-02-19T10:00:00Z",
  "creationUser": "admin",
  ...
}
```

**DAO Implementation**:

**Pattern Purpose - Data Access Object (DAO)**:

**Why DAOs?**
- **Separation of Concerns**: Database logic separated from business logic
- **Reusability**: Complex queries written once, used everywhere
- **Testability**: Easy to mock DAOs in unit tests
- **Performance**: Optimized queries with Entity Graphs prevent N+1 problems

**What This DAO Does**:
- Provides type-safe database access for Workspace entities
- Implements complex search with dynamic criteria (name, tenant, etc.)
- Uses Entity Graphs to efficiently load related data (products, menus, roles)
- Handles pagination for large result sets

**How It Works**:
1. Extends `AbstractDAO<Workspace>` for basic CRUD (create, read, update, delete)
2. Adds custom methods for workspace-specific queries
3. Uses Hibernate Criteria API for dynamic filtering
4. Employs Entity Graphs to load relationships in single query

**When to Use**: Every service that needs database access should have a DAO layer.

```java
@ApplicationScoped
public class WorkspaceDAO extends AbstractDAO<Workspace> {
    
    public Workspace create(CreateWorkspaceRequest request) {
        var workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDisplayName(request.getDisplayName());
        workspace.setBaseUrl(request.getBaseUrl());
        workspace.setTheme(request.getTheme());
        // ... set all fields
        
        return persist(workspace); // JPA persist
    }
    
    public List<Workspace> searchWorkspaces(WorkspaceSearchCriteria criteria) {
        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<Workspace> cq = cb.createQuery(Workspace.class);
        Root<Workspace> root = cq.from(Workspace.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        // Add tenant filter automatically (via Hibernate filter)
        if (criteria.getName() != null) {
            predicates.add(cb.like(cb.lower(root.get("name")), 
                                   "%" + criteria.getName().toLowerCase() + "%"));
        }
        if (criteria.getTheme() != null) {
            predicates.add(cb.equal(root.get("theme"), criteria.getTheme()));
        }
        
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.asc(root.get("displayName")));
        
        return getEntityManager().createQuery(cq).getResultList();
    }
}
```

###### Search Workspaces

**Pattern Purpose - Searchable POST Endpoint**:

**Why POST for Search?**
- **Complex criteria**: Search filters don't fit in URL query params (200+ char limit)
- **Security**: Sensitive filters shouldn't appear in browser history/logs
- **Flexibility**: JSON body supports nested criteria, arrays, and complex operators

**What It Does**:
- Accepts dynamic search criteria (name, theme, tenant filtering)
- Returns paginated results to handle large datasets
- Supports sorting by any field

**How It Works**:
1. Client sends search criteria as JSON in POST body
2. Backend builds dynamic SQL query using Criteria API
3. Returns page of results with total count for pagination UI

**When to Use**: Any list/table UI that needs filtering, sorting, or pagination.

```http
POST /internal/workspaces/search
Content-Type: application/json

{
  "name": "sales",
  "theme": "dark",
  "pageNumber": 0,
  "pageSize": 10
}

Response: 200 OK
{
  "stream": [
    {
      "guid": "ws-12345",
      "name": "sales-workspace",
      "displayName": "Sales Department",
      "theme": "dark",
      "baseUrl": "/sales",
      "products": [...]
    }
  ],
  "totalElements": 1,
  "number": 0,
  "size": 10
}
```

###### Get Workspace by ID
```http
GET /internal/workspaces/{guid}

Response: 200 OK
{
  "guid": "ws-12345",
  "name": "sales-workspace",
  "products": [
    {
      "guid": "prod-1",
      "productName": "onecx-user-profile",
      "displayName": "User Profile",
      "microfrontends": [
        {
          "mfeId": "user-profile-ui",
          "basePath": "/user-profile",
          "remoteBaseUrl": "http://user-profile-ui:8080",
          "exposedModule": "./UserProfileModule"
        }
      ]
    }
  ],
  "slots": [
    {
      "name": "header-right",
      "component": "UserMenuComponent@user-profile-ui"
    }
  ],
  "roles": [
    {
      "name": "SALES_USER",
      "description": "Sales team member"
    }
  ]
}
```

**REST Controller**:

**Pattern Purpose - JAX-RS REST Controller**:

**Why This Structure?**
- **@ApplicationScoped**: Single instance shared across requests (memory efficient)
- **@Transactional(NOT_SUPPORTED)**: Explicit transaction control per method
- **@LogService**: Automatic request/response logging for debugging
- **Implements API interface**: Generated from OpenAPI spec ensures contract compliance

**What It Does**:
- Exposes REST endpoints for workspace CRUD operations
- Validates input using Bean Validation (@Valid)
- Maps between DTOs (Data Transfer Objects) and entities
- Handles errors and returns appropriate HTTP status codes

**How It Works**:
1. Client sends HTTP request
2. JAX-RS maps URL + method to controller method
3. Controller calls DAO for data access
4. Mapper converts entity to DTO
5. Returns JSON response with status code

**When to Use**: Every microservice needs REST controllers to expose functionality via HTTP.

```java
@Path("/internal/workspaces")
@ApplicationScoped
@Transactional(Transactional.TxType.NOT_SUPPORTED)
@LogService
public class WorkspaceInternalRestController implements WorkspaceInternalAPI {
    
    @Inject
    WorkspaceDAO workspaceDAO;
    
    @Inject
    WorkspaceMapper mapper;
    
    @POST
    @Transactional
    public Response createWorkspace(CreateWorkspaceRequestDTO request) {
        var workspace = mapper.createWorkspace(request);
        workspace = workspaceDAO.create(workspace);
        
        return Response
            .status(Response.Status.CREATED)
            .entity(mapper.mapWorkspace(workspace))
            .build();
    }
    
    @GET
    @Path("/{guid}")
    public Response getWorkspace(@PathParam("guid") String guid) {
        var workspace = workspaceDAO.findById(guid, 
                                              Workspace.WORKSPACE_FULL);
        if (workspace == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        return Response.ok(mapper.mapWorkspace(workspace)).build();
    }
    
    @POST
    @Path("/search")
    public Response searchWorkspaces(WorkspaceSearchCriteriaDTO criteria) {
        var searchCriteria = mapper.mapSearchCriteria(criteria);
        var workspaces = workspaceDAO.searchWorkspaces(searchCriteria);
        
        return Response.ok(mapper.mapWorkspaceList(workspaces)).build();
    }
    
    @PUT
    @Path("/{guid}")
    @Transactional
    public Response updateWorkspace(
            @PathParam("guid") String guid,
            UpdateWorkspaceRequestDTO request) {
        
        var workspace = workspaceDAO.findById(guid);
        if (workspace == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        mapper.updateWorkspace(workspace, request);
        workspace = workspaceDAO.update(workspace);
        
        return Response.ok(mapper.mapWorkspace(workspace)).build();
    }
    
    @DELETE
    @Path("/{guid}")
    @Transactional
    public Response deleteWorkspace(@PathParam("guid") String guid) {
        workspaceDAO.deleteById(guid);
        return Response.noContent().build();
    }
}
```

---

##### 2. Product Management API

**Pattern Purpose - Nested Resource Management**:

**Why Nested Under Workspace?**
- **Logical hierarchy**: Products belong to workspaces (parent-child relationship)
- **Context clarity**: URL `/workspaces/{id}/products` makes relationship explicit
- **Authorization**: Easy to check if user can access workspace before allowing product operations

**What It Does**:
- Manages applications (products) available within a workspace
- Handles product registration and removal
- Configures product-specific settings (base URL, display name)
- Links products to their microfrontends

**How It Works**:
1. Products are registered in Product Store (central catalog)
2. Workspaces "import" products they want to use
3. Each workspace can configure product differently (different URL, display name)
4. Microfrontends are automatically associated when product is added

**When to Use**: When building admin UI for workspace configuration or automation scripts that deploy applications to workspaces.

**Base Path**: `/internal/workspaces/{workspaceGuid}/products`

###### Add Product to Workspace
```http
POST /internal/workspaces/ws-12345/products
Content-Type: application/json

{
  "productName": "onecx-user-profile",
  "displayName": "User Management",
  "baseUrl": "/users",
  "microfrontends": [
    {
      "mfeId": "user-profile-ui",
      "basePath": "/profile",
      "exposedModule": "./UserProfileModule",
      "remoteBaseUrl": "http://user-profile-ui:8080",
      "remoteName": "userProfileUi",
      "technology": "angular",
      "type": "MODULE"
    }
  ]
}

Response: 201 Created
{
  "guid": "prod-abc123",
  "productName": "onecx-user-profile",
  "displayName": "User Management",
  "baseUrl": "/users",
  "microfrontends": [...]
}
```

**Implementation**:
```java
@POST
@Transactional
public Response createProduct(
        @PathParam("workspaceGuid") String workspaceGuid,
        CreateProductRequestDTO request) {
    
    var workspace = workspaceDAO.findById(workspaceGuid);
    if (workspace == null) {
        return Response.status(Response.Status.NOT_FOUND).build();
    }
    
    var product = mapper.createProduct(request);
    product.setWorkspace(workspace);
    product = productDAO.create(product);
    
    return Response
        .status(Response.Status.CREATED)
        .entity(mapper.mapProduct(product))
        .build();
}
```

###### Get All Products in Workspace
```http
GET /internal/workspaces/ws-12345/products

Response: 200 OK
{
  "stream": [
    {
      "guid": "prod-1",
      "productName": "onecx-user-profile",
      "microfrontends": [...]
    },
    {
      "guid": "prod-2",
      "productName": "onecx-workspace",
      "microfrontends": [...]
    }
  ]
}
```

---

##### 3. Menu Management API

**Pattern Purpose - Hierarchical Tree Structures**:

**Why Hierarchical Menus?**
- **Organization**: Users need nested menus (Dashboard → Reports → Sales Report)
- **Permissions**: Parent menu items can grant access to all children
- **Flexibility**: Unlimited nesting depth supports complex navigation structures

**What It Does**:
- Creates multi-level navigation menus (folders and links)
- Maintains parent-child relationships
- Supports internationalization (i18n keys for labels)
- Manages display order (position in menu)

**How It Works**:
1. Menu items stored with `parent_item_id` (self-referencing foreign key)
2. Root items have `parent_item_id = NULL`
3. Tree built recursively: find root → find children → find grandchildren
4. Frontend renders as nested sidebar navigation

**When to Use**: Any application requiring hierarchical navigation (sidebars, dropdowns, breadcrumbs).

**Database Design**:
```
MENU_ITEM table
├─ guid (primary key)
├─ parent_item_id (foreign key to same table)
├─ workspace_guid (which workspace owns this menu)
├─ key (unique identifier like "dashboard" or "reports")
├─ name (display label)
├─ position (sort order: 0, 1, 2...)
└─ url (link target)

Example Tree:
Dashboard (parent_id=NULL, position=0)
Reports (parent_id=NULL, position=1)
  ├─ Sales Report (parent_id=Reports.guid, position=0)
  └─ User Report (parent_id=Reports.guid, position=1)
Settings (parent_id=NULL, position=2)
```

**Base Path**: `/internal/workspaces/{workspaceGuid}/menu`

###### Create Menu Structure
```http
POST /internal/workspaces/ws-12345/menu
Content-Type: application/json

{
  "menuItems": [
    {
      "key": "dashboard",
      "name": "Dashboard",
      "url": "/dashboard",
      "position": 0,
      "badge": "pi-home",
      "i18n": {
        "en": {"name": "Dashboard"},
        "de": {"name": "Übersicht"}
      }
    },
    {
      "key": "users",
      "name": "Users",
      "position": 1,
      "badge": "pi-users",
      "children": [
        {
          "key": "users-list",
          "name": "User List",
          "url": "/users/list",
          "position": 0
        },
        {
          "key": "users-create",
          "name": "Create User",
          "url": "/users/create",
          "position": 1
        }
      ]
    }
  ]
}

Response: 201 Created
{
  "menuItems": [
    {
      "guid": "menu-1",
      "key": "dashboard",
      "name": "Dashboard",
      ...
    }
  ]
}
```

**Hierarchical Menu Query**:

**Pattern Purpose - Recursive Tree Building**:

**Why This Approach?**
- **Single DB query**: Loads all menu items at once (efficient)
- **In-memory tree building**: Java code organizes into hierarchy (fast)
- **Avoids N+1 problem**: Don't query for each level separately

**What It Does**:
- Fetches all menu items for a workspace
- Builds parent-child relationships in memory
- Returns tree structure ready for frontend rendering

**How It Works**:
1. Load all menu items in one query
2. Separate root items (parent_id = NULL) from children
3. For each root item, recursively find and attach children
4. Sort by position at each level

**When to Use**: Loading any hierarchical data (org charts, category trees, folder structures).

```java
public List<MenuItem> getMenuTreeForWorkspace(String workspaceGuid) {
    // Load all menu items for workspace
    var allItems = getEntityManager()
        .createQuery(
            "SELECT m FROM MenuItem m " +
            "WHERE m.workspace.guid = :workspaceGuid " +
            "ORDER BY m.position ASC",
            MenuItem.class)
        .setParameter("workspaceGuid", workspaceGuid)
        .getResultList();
    
    // Build tree structure
    Map<String, MenuItem> itemMap = new HashMap<>();
    List<MenuItem> rootItems = new ArrayList<>();
    
    for (MenuItem item : allItems) {
        itemMap.put(item.getGuid(), item);
        if (item.getParentItemId() == null) {
            rootItems.add(item);
        }
    }
    
    // Set children
    for (MenuItem item : allItems) {
        if (item.getParentItemId() != null) {
            MenuItem parent = itemMap.get(item.getParentItemId());
            if (parent != null) {
                parent.getChildren().add(item);
            }
        }
    }
    
    return rootItems;
}
```

---

##### 4. Role & Assignment API

**Pattern Purpose - Role-Based Access Control (RBAC) for Menus**:

**Why Role-Menu Assignments?**
- **Granular control**: Different roles see different menus
- **Security**: Hide admin menus from regular users
- **Flexibility**: Same menu can be assigned to multiple roles
- **Maintainability**: Change role assignments without code changes

**What It Does**:
- Creates roles (ADMIN, USER, MANAGER, etc.)
- Assigns menu items to roles
- Controls which navigation items users see based on their role

**How It Works**:
```
User → has JWT token → contains roles ["ADMIN", "USER"]
                            ↓
                    Shell loads menu for workspace
                            ↓
                    Filters menu items by user's roles
                            ↓
            Only shows menus assigned to ADMIN or USER roles
```

**Example Scenario**:
- Role "ADMIN" assigned to: Dashboard, Users, Settings
- Role "USER" assigned to: Dashboard, My Profile
- Admin sees all three menus
- Regular user sees only Dashboard and My Profile

**When to Use**: Any application requiring different navigation for different user types.

**Base Path**: `/internal/workspaces/{workspaceGuid}/roles`

###### Create Role
```http
POST /internal/workspaces/ws-12345/roles
Content-Type: application/json

{
  "name": "SALES_MANAGER",
  "description": "Sales Manager Role",
  "assignments": [
    {"menuItemKey": "dashboard"},
    {"menuItemKey": "sales"},
    {"menuItemKey": "sales-reports"}
  ]
}

Response: 201 Created
{
  "guid": "role-1",
  "name": "SALES_MANAGER",
  "description": "Sales Manager Role",
  "assignments": [...]
}
```

**Implementation with Assignments**:
```java
@POST
@Transactional
public Response createRole(
        @PathParam("workspaceGuid") String workspaceGuid,
        CreateRoleRequestDTO request) {
    
    var workspace = workspaceDAO.findById(workspaceGuid);
    if (workspace == null) {
        return Response.status(Response.Status.NOT_FOUND).build();
    }
    
    var role = mapper.createRole(request);
    role.setWorkspace(workspace);
    role = roleDAO.create(role);
    
    // Create assignments
    if (request.getAssignments() != null) {
        for (var assignmentReq : request.getAssignments()) {
            var menuItem = menuItemDAO.findByKey(
                workspaceGuid, 
                assignmentReq.getMenuItemKey()
            );
            
            if (menuItem != null) {
                var assignment = new Assignment();
                assignment.setRole(role);
                assignment.setMenuItem(menuItem);
                assignmentDAO.create(assignment);
            }
        }
    }
    
    return Response
        .status(Response.Status.CREATED)
        .entity(mapper.mapRole(role))
        .build();
}
```

---

##### 5. Slot Management API

**Pattern Purpose - UI Extension Points (Plugin Architecture)**:

**Why Slots?**
- **Extensibility**: Allow third-party apps to inject UI components
- **Flexibility**: Add features without modifying core code
- **Modularity**: Different workspaces can have different extensions in same slot

**What It Does**:
- Defines "slots" (extension points) in UI where components can be injected
- Maps remote components to slots
- Enables plugin architecture for OneCX applications

**How It Works**:
```
Shell UI renders page:
1. Encounters <slot name="header-actions"></slot>
2. Queries: "What component should I load for 'header-actions'?"
3. Slot service returns: "Load CustomButton from custom-app-ui"
4. Shell dynamically loads and renders CustomButton component
```

**Real-World Example**:
```
Header slot:
- Default workspace: Shows standard notifications button
- Custom workspace: Shows notifications + custom approval button + chat widget

Footer slot:
- Workspace A: Custom copyright text + social media links
- Workspace B: Different copyright + help center link
```

**When to Use**: Building pluggable/extensible applications where different deployments need different features.

**Base Path**: `/internal/workspaces/{workspaceGuid}/slots`

###### Register Slot
```http
POST /internal/workspaces/ws-12345/slots
Content-Type: application/json

{
  "name": "header-actions",
  "component": "CustomActionsComponent@custom-app-ui",
  "deprecated": false,
  "undeployed": false
}

Response: 201 Created
{
  "guid": "slot-1",
  "name": "header-actions",
  "component": "CustomActionsComponent@custom-app-ui"
}
```

**Slot Usage**: Slots are extension points where microfrontends can inject components.

```typescript
// In Shell UI
@Component({
  template: `
    <div class="header">
      <ocx-slot name="header-actions"></ocx-slot>
    </div>
  `
})
export class HeaderComponent {}

// Slot loads remote component from slot definition
// component = "CustomActionsComponent@custom-app-ui"
// → Loads CustomActionsComponent from custom-app-ui microfrontend
```

---

##### 6. User-Facing APIs

**Base Path**: `/user/workspaces`

###### Get User's Workspaces
```http
GET /user/workspaces

Response: 200 OK
{
  "workspaces": [
    {
      "name": "sales-workspace",
      "displayName": "Sales",
      "theme": "sales-theme",
      "logoUrl": "..."
    },
    {
      "name": "admin-workspace",
      "displayName": "Administration",
      "theme": "admin-theme"
    }
  ]
}
```

**Implementation with Claims**:
```java
@Path("/user/workspaces")
@ApplicationScoped
@Transactional(Transactional.TxType.NOT_SUPPORTED)
public class UserWorkspaceRestController {
    
    @Inject
    ClaimService claimService;
    
    @Inject
    WorkspaceDAO workspaceDAO;
    
    @GET
    public Response getUserWorkspaces() {
        // Get user's workspace claims from JWT
        var workspaceNames = claimService.getWorkspaceNames();
        
        var workspaces = workspaceDAO
            .findByNames(workspaceNames);
        
        return Response.ok(mapper.mapWorkspaces(workspaces)).build();
    }
}
```

**ClaimService** extracts workspace access from JWT:
```java
@ApplicationScoped
public class ClaimService {
    
    @ConfigProperty(name = "onecx.workspace.claim.path")
    String claimPath; // e.g., "workspaces"
    
    public Set<String> getWorkspaceNames() {
        var principal = ApplicationContext.get().getPrincipal();
        var token = (JsonWebToken) principal;
        
        var claim = token.getClaim(claimPath);
        if (claim instanceof List) {
            return new HashSet<>((List<String>) claim);
        }
        
        return Set.of();
    }
}
```

---

#### Complete Frontend Deep Dive

**Pattern Purpose - Angular Component Architecture**:

**Why Separate UI Components?**
- **Reusability**: Search component used in multiple places
- **Testability**: Each component tested independently
- **Maintainability**: Clear separation of concerns (search, detail, create, edit)
- **Lazy Loading**: Components loaded only when needed (performance)

**What the UI Does**:
- Provides admin interface for workspace management
- Implements search, create, edit, delete operations
- Renders forms with validation
- Handles API communication and error handling

**Component Structure**:
```
Workspace UI
├─ Search Component (list workspaces, filter, paginate)
├─ Detail Component (view workspace, tabs for products/menu/roles)
├─ Create Component (wizard: basic info → branding → products → review)
└─ Edit Component (modify existing workspace)
```

**How It Works**:
1. User interacts with UI (clicks, types, submits)
2. Component calls Angular service
3. Service calls BFF via HTTP
4. BFF calls backend service
5. Response flows back: Service → BFF → Angular Service → Component
6. Component updates UI with results

**When to Use**: Standard pattern for any Angular admin interface.

**Folder Structure**:
```
onecx-workspace-ui/src/app/
├── workspace/
│   ├── workspace-search/
│   │   ├── workspace-search.component.ts
│   │   ├── workspace-search.component.html
│   │   ├── workspace-search.component.scss
│   │   └── workspace-search.state.ts
│   ├── workspace-detail/
│   │   ├── workspace-detail.component.ts
│   │   ├── workspace-detail.component.html
│   │   ├── workspace-props/
│   │   │   └── workspace-props.component.ts
│   │   ├── workspace-products/
│   │   │   └── workspace-products.component.ts
│   │   ├── workspace-menu/
│   │   │   ├── workspace-menu.component.ts
│   │   │   └── menu-tree/
│   │   │       └── menu-tree.component.ts
│   │   ├── workspace-roles/
│   │   │   └── workspace-roles.component.ts
│   │   └── workspace-slots/
│   │       └── workspace-slots.component.ts
│   ├── workspace-create/
│   │   └── workspace-create.component.ts
│   ├── workspace-import/
│   │   └── workspace-import.component.ts
│   └── workspace.module.ts
├── shared/
│   ├── generated/          # OpenAPI generated
│   ├── utils.ts
│   └── label.resolver.ts
├── remotes/               # Remote module configs
├── app.module.ts
└── bootstrap.ts
```

##### Workspace Search Component

**Full Implementation**:
```typescript
import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { Observable, catchError, finalize, map, of } from 'rxjs'
import { DataView } from 'primeng/dataview'

import { Action, DataViewControlTranslations } from '@onecx/angular-accelerator'
import { AppStateService, PortalMessageService } from '@onecx/angular-integration-interface'

import {
  ImagesInternalAPIService,
  RefType,
  Workspace,
  WorkspaceAPIService,
  WorkspaceAbstract,
  WorkspaceSearchCriteria
} from 'src/app/shared/generated'

export interface WorkspaceSearchCriteria {
  name?: string
  theme?: string
}

@Component({
  selector: 'app-workspace-search',
  templateUrl: './workspace-search.component.html',
  styleUrls: ['./workspace-search.component.scss']
})
export class WorkspaceSearchComponent implements OnInit {
  @ViewChild(DataView) dataView: DataView | undefined

  // UI State
  public loading = false
  public exceptionKey: string | undefined
  public viewMode: 'list' | 'grid' = 'grid'
  public filter: string | undefined
  public sortField = 'displayName'
  public sortOrder = 1

  // Dialogs
  public showCreateDialog = false
  public showImportDialog = false
  public showDeleteDialog = false
  public workspaceToDelete?: Workspace

  // Data
  public workspaces$!: Observable<Workspace[]>
  public currentWorkspaceName: string | undefined
  public imageBasePath: string

  // i18n
  public actions$: Observable<Action[]> | undefined
  public dataViewControlsTranslations$: Observable<DataViewControlTranslations> | undefined

  // Constants
  public RefType = RefType

  constructor(
    private readonly workspaceApi: WorkspaceAPIService,
    private readonly imageApi: ImagesInternalAPIService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly appState: AppStateService,
    private readonly msgService: PortalMessageService
  ) {
    this.imageBasePath = this.imageApi.configuration.basePath
    this.appState.currentWorkspace$.subscribe((workspace) => {
      this.currentWorkspaceName = workspace?.workspaceName
    })
  }

  ngOnInit(): void {
    this.prepareDialogTranslations()
    this.prepareActionButtons()
    this.search()
  }

  /**
   * Search workspaces
   */
  public search(criteria?: WorkspaceSearchCriteria): void {
    this.loading = true
    this.exceptionKey = undefined

    const searchCriteria = {
      name: criteria?.name,
      theme: criteria?.theme
    }

    this.workspaces$ = this.workspaceApi
      .searchWorkspaces({ 
        workspaceSearchCriteria: searchCriteria 
      })
      .pipe(
        map((result) => {
          const workspaces = result.stream || []
          return workspaces.sort(this.sortWorkspacesByName)
        }),
        catchError((error) => {
          this.exceptionKey = `EXCEPTIONS.HTTP_STATUS_${error.status}.WORKSPACES`
          console.error('searchWorkspaces error:', error)
          return of([])
        }),
        finalize(() => (this.loading = false))
      )
  }

  /**
   * Sort workspaces alphabetically
   */
  private sortWorkspacesByName(a: WorkspaceAbstract, b: WorkspaceAbstract): number {
    return a.displayName.toUpperCase().localeCompare(b.displayName.toUpperCase())
  }

  /**
   * Navigate to workspace detail
   */
  public onViewDetails(workspace: Workspace): void {
    this.router.navigate(['./workspace', workspace.name])
  }

  /**
   * Open workspace in new tab
   */
  public onGoToWorkspace(workspace: Workspace): void {
    window.open(workspace.baseUrl, '_blank')
  }

  /**
   * Copy workspace (clone)
   */
  public onCopyWorkspace(workspace: Workspace): void {
    this.router.navigate(['./workspace/create'], {
      queryParams: { copyFrom: workspace.name }
    })
  }

  /**
   * Delete workspace
   */
  public onDeleteWorkspace(workspace: Workspace): void {
    this.workspaceToDelete = workspace
    this.showDeleteDialog = true
  }

  /**
   * Confirm delete
   */
  public onConfirmDelete(): void {
    if (!this.workspaceToDelete) return

    this.workspaceApi
      .deleteWorkspace({ id: this.workspaceToDelete.guid! })
      .subscribe({
        next: () => {
          this.msgService.success({ 
            summaryKey: 'ACTIONS.DELETE.SUCCESS' 
          })
          this.search()
        },
        error: (error) => {
          this.msgService.error({ 
            summaryKey: 'ACTIONS.DELETE.ERROR' 
          })
        }
      })

    this.showDeleteDialog = false
    this.workspaceToDelete = undefined
  }

  /**
   * Filter workspaces
   */
  public onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value
    this.dataView?.filter(value, 'contains')
  }

  /**
   * Change view mode
   */
  public onViewModeChange(viewMode: 'list' | 'grid'): void {
    this.viewMode = viewMode
  }

  /**
   * Create action buttons
   */
  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'ACTIONS.CREATE.LABEL',
        'ACTIONS.CREATE.WORKSPACE',
        'ACTIONS.IMPORT.LABEL',
        'ACTIONS.IMPORT.WORKSPACE'
      ])
      .pipe(
        map((translations) => {
          return [
            {
              label: translations['ACTIONS.CREATE.WORKSPACE'],
              title: translations['ACTIONS.CREATE.LABEL'],
              actionCallback: () => (this.showCreateDialog = true),
              icon: 'pi pi-plus',
              show: 'always',
              permission: 'WORKSPACE#CREATE'
            },
            {
              label: translations['ACTIONS.IMPORT.WORKSPACE'],
              title: translations['ACTIONS.IMPORT.LABEL'],
              actionCallback: () => (this.showImportDialog = true),
              icon: 'pi pi-upload',
              show: 'always',
              permission: 'WORKSPACE#IMPORT'
            }
          ]
        })
      )
  }

  /**
   * Prepare i18n for data view controls
   */
  private prepareDialogTranslations(): void {
    this.dataViewControlsTranslations$ = this.translate
      .get([
        'WORKSPACE.DISPLAY_NAME',
        'WORKSPACE.THEME',
        'WORKSPACE.NAME',
        'DIALOG.DATAVIEW.FILTER',
        'DIALOG.DATAVIEW.FILTER_OF',
        'DIALOG.DATAVIEW.SORT_BY'
      ])
      .pipe(
        map((data) => ({
          filterInputPlaceholder: data['DIALOG.DATAVIEW.FILTER'],
          filterInputTooltip:
            data['DIALOG.DATAVIEW.FILTER_OF'] +
            data['WORKSPACE.DISPLAY_NAME'] +
            ', ' +
            data['WORKSPACE.THEME'] +
            ', ' +
            data['WORKSPACE.NAME'],
          sortDropdownTooltip: data['DIALOG.DATAVIEW.SORT_BY'],
          sortDropdownPlaceholder: data['DIALOG.DATAVIEW.SORT_BY']
        }))
      )
  }

  /**
   * Handle dialog events
   */
  public onDialogHide(refresh: boolean): void {
    this.showCreateDialog = false
    this.showImportDialog = false
    
    if (refresh) {
      this.search()
    }
  }
}
```

**Template** (workspace-search.component.html):
```html
<ocx-portal-page 
  permission="WORKSPACE#VIEW" 
  helpArticleId="PAGE_WORKSPACE_SEARCH">
  
  <!-- Header -->
  <ocx-page-header 
    [header]="'DIALOG.SEARCH.HEADER' | translate"
    [subheader]="'DIALOG.SEARCH.SUBHEADER' | translate"
    [actions]="actions$ | async"
    [manualBreadcrumbs]="false">
  </ocx-page-header>

  <!-- Content -->
  <ocx-page-content>
    
    <!-- Data View Controls -->
    <div class="flex justify-content-between align-items-center mb-3">
      <ocx-data-view-controls
        [supportedViews]="['grid', 'list']"
        [initialViewMode]="viewMode"
        [translations]="dataViewControlsTranslations$ | async"
        (viewModeChange)="onViewModeChange($event)"
        (filterChange)="onFilterChange($event)">
      </ocx-data-view-controls>
    </div>

    <!-- Loading Indicator -->
    <p-progressBar 
      *ngIf="loading" 
      mode="indeterminate" 
      [style]="{ height: '3px' }">
    </p-progressBar>

    <!-- Data View -->
    <p-dataView
      #dv
      [value]="(workspaces$ | async) ?? []"
      [layout]="viewMode"
      [paginator]="true"
      [rows]="12"
      [rowsPerPageOptions]="[12, 24, 48]"
      [sortField]="sortField"
      [sortOrder]="sortOrder"
      [emptyMessage]="'GENERAL.NO_DATA' | translate"
      filterBy="name,displayName,theme">
      
      <!-- Grid View -->
      <ng-template let-workspace pTemplate="gridItem">
        <div class="col-12 md:col-6 lg:col-4 xl:col-3 p-2">
          <div class="card p-3 workspace-card">
            
            <!-- Logo -->
            <div class="workspace-logo mb-2">
              <img
                *ngIf="workspace.logoUrl"
                [src]="workspace.logoUrl"
                [alt]="workspace.displayName"
                class="w-full"
                style="max-height: 100px; object-fit: contain" />
              <i
                *ngIf="!workspace.logoUrl"
                class="pi pi-building text-6xl text-400">
              </i>
            </div>

            <!-- Info -->
            <div class="workspace-info">
              <h3 class="workspace-title">
                {{ workspace.displayName }}
              </h3>
              <p class="workspace-name text-sm text-500 mb-2">
                {{ workspace.name }}
              </p>
              <p class="workspace-description text-sm mb-2"
                 *ngIf="workspace.description">
                {{ workspace.description }}
              </p>
              
              <!-- Theme Badge -->
              <p-tag
                *ngIf="workspace.theme"
                [value]="workspace.theme"
                severity="info"
                icon="pi pi-palette">
              </p-tag>

              <!-- Current Workspace Badge -->
              <p-tag
                *ngIf="workspace.name === currentWorkspaceName"
                value="{{ 'WORKSPACE.CURRENT' | translate }}"
                severity="success"
                class="ml-2">
              </p-tag>
            </div>

            <!-- Actions -->
            <div class="workspace-actions mt-3 flex gap-2">
              <button
                pButton
                icon="pi pi-eye"
                class="p-button-sm p-button-outlined"
                [pTooltip]="'ACTIONS.VIEW.TOOLTIP' | translate"
                (click)="onViewDetails(workspace)">
              </button>
              <button
                pButton
                icon="pi pi-external-link"
                class="p-button-sm p-button-outlined"
                [pTooltip]="'ACTIONS.OPEN.TOOLTIP' | translate"
                (click)="onGoToWorkspace(workspace)">
              </button>
              <button
                pButton
                icon="pi pi-copy"
                class="p-button-sm p-button-outlined"
                [pTooltip]="'ACTIONS.COPY.TOOLTIP' | translate"
                permission="WORKSPACE#CREATE"
                (click)="onCopyWorkspace(workspace)">
              </button>
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-sm p-button-outlined p-button-danger"
                [pTooltip]="'ACTIONS.DELETE.TOOLTIP' | translate"
                permission="WORKSPACE#DELETE"
                (click)="onDeleteWorkspace(workspace)">
              </button>
            </div>

          </div>
        </div>
      </ng-template>

      <!-- List View -->
      <ng-template let-workspace pTemplate="listItem">
        <div class="col-12 p-2">
          <div class="card p-3 flex align-items-center gap-3">
            
            <!-- Logo -->
            <img
              *ngIf="workspace.logoUrl"
              [src]="workspace.logoUrl"
              [alt]="workspace.displayName"
              class="workspace-logo-small"
              style="width: 60px; height: 60px; object-fit: contain" />
            
            <!-- Info -->
            <div class="flex-grow-1">
              <h4 class="m-0">{{ workspace.displayName }}</h4>
              <p class="text-sm text-500 m-0">{{ workspace.name }}</p>
              <p class="text-sm m-0 mt-1" *ngIf="workspace.description">
                {{ workspace.description }}
              </p>
            </div>

            <!-- Theme -->
            <p-tag
              *ngIf="workspace.theme"
              [value]="workspace.theme"
              severity="info">
            </p-tag>

            <!-- Actions -->
            <div class="flex gap-2">
              <button pButton icon="pi pi-eye" 
                      class="p-button-sm p-button-outlined"
                      (click)="onViewDetails(workspace)">
              </button>
              <button pButton icon="pi pi-external-link"
                      class="p-button-sm p-button-outlined"
                      (click)="onGoToWorkspace(workspace)">
              </button>
              <button pButton icon="pi pi-trash"
                      class="p-button-sm p-button-outlined p-button-danger"
                      permission="WORKSPACE#DELETE"
                      (click)="onDeleteWorkspace(workspace)">
              </button>
            </div>

          </div>
        </div>
      </ng-template>

    </p-dataView>

    <!-- Exception Message -->
    <p-message
      *ngIf="exceptionKey"
      severity="error"
      [text]="exceptionKey | translate">
    </p-message>

  </ocx-page-content>

</ocx-portal-page>

<!-- Create Dialog -->
<app-workspace-create
  [(visible)]="showCreateDialog"
  (hideDialog)="onDialogHide($event)">
</app-workspace-create>

<!-- Import Dialog -->
<app-workspace-import
  [(visible)]="showImportDialog"
  (hideDialog)="onDialogHide($event)">
</app-workspace-import>

<!-- Delete Confirmation -->
<p-confirmDialog
  [(visible)]="showDeleteDialog"
  [header]="'ACTIONS.DELETE.WORKSPACE' | translate"
  [message]="'ACTIONS.DELETE.MESSAGE' | translate"
  [acceptLabel]="'ACTIONS.DELETE.CONFIRM' | translate"
  [rejectLabel]="'ACTIONS.CANCEL' | translate"
  acceptIcon="pi pi-check"
  rejectIcon="pi pi-times"
  (onAccept)="onConfirmDelete()">
</p-confirmDialog>
```

---

This is just the beginning! Due to token limits, I'm creating this as Part 1. The document will continue with:
- Part 2: User Profile deep dive
- Part 3: Permission system deep dive
- Part 4: Theme management deep dive
- Part 5: Shell orchestration deep dive

Would you like me to continue with the next parts?

---

## OneCX Tenant - Complete Deep Dive

### Overview
The Tenant service is the **foundation** of OneCX's multi-tenancy architecture. It manages tenant registration, configuration, and tenant-scoped data isolation across all services.

**GitHub**: `onecx-tenant`  
**Components**: tenant-svc, tenant-bff, tenant-ui  
**Database Tables**: 2 tables (TENANT, IMAGE)  
**Key Pattern**: Discriminator-based multi-tenancy with @TenantId

---

### Database Schema

**Pattern Purpose - Tenant Registry with Discriminator Pattern**:

**Why This Schema?**
- **Central registry**: All tenants defined in one table
- **Metadata storage**: Each tenant's configuration and branding
- **Referenced everywhere**: All other tables have `tenant_id` foreign key

**What It Stores**:
- Tenant identification (org_id, tenant_id)
- Display information (displayName, description)
- Branding (logo URLs, company info)

**How Discriminator Pattern Works**:
```
EVERY table in OneCX has tenant_id column:

WORKSPACE table          USER table             ANNOUNCEMENT table
├─ guid                 ├─ guid                 ├─ guid
├─ tenant_id →         ├─ tenant_id →         ├─ tenant_id →
├─ name                 ├─ username             ├─ title
└─ ...                  └─ ...                  └─ ...

Hibernate automatically adds: WHERE tenant_id = :currentTenant to ALL queries
```

**When to Use**: Use discriminator pattern when you need complete data isolation at row level.

```sql
-- Tenant Table
CREATE TABLE TENANT (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    -- Unique Identifiers
    org_id VARCHAR(255) NOT NULL UNIQUE,
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Configuration
    description TEXT,
    operator BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT tenant_org_id UNIQUE (org_id),
    CONSTRAINT tenant_tenant_id UNIQUE (tenant_id)
);

-- Image Table (for tenant logos)
CREATE TABLE IMAGE (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    ref_id VARCHAR(255) NOT NULL,     -- Tenant GUID
    ref_type VARCHAR(50) NOT NULL,    -- LOGO, SMALL_LOGO, FAVICON
    data_url TEXT,                    -- Base64 encoded image
    mime_type VARCHAR(100),
    length INTEGER,
    
    CONSTRAINT image_ref UNIQUE (ref_id, ref_type)
);

CREATE INDEX idx_tenant_org_id ON TENANT(org_id);
CREATE INDEX idx_tenant_tenant_id ON TENANT(tenant_id);
```

**Entity Model**:
```java
@Entity
@Table(name = "TENANT", uniqueConstraints = {
    @UniqueConstraint(name = "TENANT_ORG_ID", columnNames = {"ORG_ID"}),
    @UniqueConstraint(name = "TENANT_TENANT_ID", columnNames = {"TENANT_ID"})
})
public class Tenant extends TraceableEntity {
    
    @Column(name = "ORG_ID")
    private String orgId;  // Organization identifier (e.g., "acme-corp")
    
    @Column(name = "TENANT_ID")
    private String tenantId;  // Tenant discriminator value
    
    @Column(name = "DESCRIPTION")
    private String description;
    
    @Column(name = "OPERATOR")
    private Boolean operator;  // Created by Kubernetes operator
}
```

---

### REST API Endpoints

#### 1. Create Tenant
```http
POST /internal/tenants
Content-Type: application/json

{
  "orgId": "acme-corp",
  "tenantId": "ACME",
  "description": "ACME Corporation Tenant"
}

Response: 201 Created
{
  "guid": "tenant-12345",
  "orgId": "acme-corp",
  "tenantId": "ACME",
  "description": "ACME Corporation Tenant",
  "creationDate": "2026-02-19T10:00:00Z"
}
```

#### 2. Get All Tenants
```http
GET /internal/tenants

Response: 200 OK
{
  "stream": [
    {
      "guid": "tenant-1",
      "orgId": "acme-corp",
      "tenantId": "ACME",
      "description": "ACME Corporation"
    },
    {
      "guid": "tenant-2",
      "orgId": "contoso-ltd",
      "tenantId": "CONTOSO",
      "description": "Contoso Limited"
    }
  ]
}
```

#### 3. Upload Tenant Logo
```http
POST /internal/tenants/{tenantId}/images
Content-Type: multipart/form-data

refType=LOGO
file=<binary data>

Response: 201 Created
{
  "guid": "img-123",
  "refId": "tenant-12345",
  "refType": "LOGO",
  "mimeType": "image/png",
  "length": 45678
}
```

---

### Multi-Tenancy Implementation

**How Tenants Work in OneCX**:

1. **JWT Token Contains Tenant**: Every user's JWT token includes a tenant claim:
   ```json
   {
     "sub": "user@acme-corp.com",
     "tenant": "ACME",
     "roles": ["ADMIN"],
     ...
   }
   ```

2. **Hibernate Filter Applied**: When a request arrives, OneCX extracts the tenant from JWT and sets it in Hibernate:
   ```java
   @ApplicationScoped
   public class TenantResolver {
       
       @Inject
       JsonWebToken token;
       
       public String getCurrentTenant() {
           return token.getClaim("tenant");
       }
   }
   
   // Hibernate Filter
   @FilterDef(name = "tenantFilter", 
              parameters = @ParamDef(name = "tenantId", type = String.class))
   @Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
   public class BaseEntity {
       @TenantId
       @Column(name = "TENANT_ID")
       private String tenantId;
   }
   ```

3. **Automatic Query Filtering**: All database queries automatically filter by tenant:
   ```sql
   -- User writes:
   SELECT * FROM WORKSPACE WHERE name = 'sales'
   
   -- Hibernate executes:
   SELECT * FROM WORKSPACE 
   WHERE name = 'sales' 
   AND tenant_id = 'ACME'  -- Automatically added!
   ```

4. **Automatic Insert**: When creating new entities, tenant ID is automatically set:
   ```java
   Workspace workspace = new Workspace();
   workspace.setName("sales");
   // tenantId automatically set to "ACME" from JWT
   em.persist(workspace);
   ```

---

### Usage Example

**Creating a New Tenant for a Client**:

```java
// 1. Create tenant
TenantDTO tenant = tenantApi.createTenant(new CreateTenantRequest()
    .orgId("new-client")
    .tenantId("NEWCLIENT")
    .description("New Client Organization"));

// 2. Upload logo
byte[] logoData = Files.readAllBytes(Paths.get("client-logo.png"));
tenantApi.uploadLogo(tenant.getGuid(), "LOGO", logoData);

// 3. Create workspace for this tenant
// User logs in with JWT containing "tenant": "NEWCLIENT"
// All subsequent operations are tenant-scoped
workspaceApi.createWorkspace(new CreateWorkspaceRequest()
    .name("client-workspace")
    .displayName("Client Workspace"));
// This workspace is automatically associated with NEWCLIENT tenant
```

---

## OneCX Announcement - Complete Deep Dive

### Overview

**Pattern Purpose - System-Wide Notification System**:

**Why Announcements?**
- **Communication**: Inform users about maintenance, features, events
- **Visibility**: Display important messages where users will see them
- **Control**: Schedule messages, set priority, target specific audiences
- **Flexibility**: Different display modes (banner, welcome page, both)

**What This Service Does**:
- Creates and manages announcements (messages to users)
- Schedules announcements (start/end dates)
- Targets announcements (specific workspaces or products)
- Displays announcements (banners, welcome page)

**Display Modes**:
- **BANNER**: Shows at top of every page (for urgent messages)
- **WELCOME**: Shows on landing/welcome page (for general info)
- **ALL**: Shows in both locations (for very important messages)

**Priority Levels**:
- **IMPORTANT** (Red): Critical alerts (system down, security issues)
- **NORMAL** (Yellow): Standard notices (new features, updates)
- **LOW** (Blue): Informational (tips, upcoming events)

**When to Use**: Any application that needs to communicate with users in-app.

The Announcement service enables administrators to broadcast messages to users across workspaces and products. Supports scheduled announcements, priority levels, and targeted delivery.

**GitHub**: `onecx-announcement`  
**Components**: announcement-svc, announcement-bff, announcement-ui  
**Database Tables**: 1 table (ANNOUNCEMENT)  
**Key Features**: Scheduled publishing, multi-workspace targeting, priority banners

---

### Database Schema

```sql
CREATE TABLE ANNOUNCEMENT (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    content VARCHAR(1000),
    
    -- Classification
    type VARCHAR(50) NOT NULL,         -- EVENT, INFO, SYSTEM_MAINTENANCE
    appearance VARCHAR(50) NOT NULL,   -- BANNER, WELCOME, ALL
    priority VARCHAR(50) NOT NULL,     -- IMPORTANT, NORMAL, LOW
    status VARCHAR(50) NOT NULL,       -- ACTIVE, INACTIVE
    
    -- Scheduling
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    
    -- Targeting
    product_name VARCHAR(255),         -- NULL = all products
    workspaceName VARCHAR(255),        -- NULL = all workspaces
    
    -- Indexes for performance
    INDEX start_status_idx (startDate, status, tenant_id),
    INDEX product_idx (product_name, tenant_id),
    INDEX workspace_idx (workspaceName, tenant_id)
);
```

**Entity Model**:
```java
@Entity
@Table(name = "ANNOUNCEMENT", indexes = {
    @Index(name = "START_STATUS_IDX", columnList = "STARTDATE, STATUS, TENANT_ID"),
    @Index(name = "PRODUCT_IDX", columnList = "PRODUCT_NAME, TENANT_ID"),
    @Index(name = "WORKSPACE_IDX", columnList = "WORKSPACENAME, TENANT_ID")
})
public class Announcement extends TraceableEntity {
    
    @TenantId
    @Column(name = "TENANT_ID")
    private String tenantId;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "content", length = 1000)
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private Type type;  // EVENT, INFO, SYSTEM_MAINTENANCE
    
    @Enumerated(EnumType.STRING)
    @Column(name = "appearance", columnDefinition = "varchar(255) default 'ALL'")
    private Appearance appearance = Appearance.ALL;  // BANNER, WELCOME, ALL
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority;  // IMPORTANT, NORMAL, LOW
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;  // ACTIVE, INACTIVE
    
    @Column(name = "startDate")
    private LocalDateTime startDate;
    
    @Column(name = "endDate")
    private LocalDateTime endDate;
    
    @Column(name = "PRODUCT_NAME")
    private String productName;  // Null = all products
    
    @Column(name = "workspaceName")
    private String workspaceName;  // Null = all workspaces
}
```

---

### REST API Endpoints

#### 1. Create Announcement
```http
POST /internal/announcements
Content-Type: application/json

{
  "title": "System Maintenance",
  "content": "The system will be unavailable on Saturday 10pm-2am for scheduled maintenance.",
  "type": "SYSTEM_MAINTENANCE",
  "appearance": "BANNER",
  "priority": "IMPORTANT",
  "status": "ACTIVE",
  "startDate": "2026-02-22T22:00:00Z",
  "endDate": "2026-02-23T02:00:00Z",
  "workspaceName": null,
  "productName": null
}

Response: 201 Created
{
  "guid": "ann-12345",
  "title": "System Maintenance",
  "status": "ACTIVE",
  ...
}
```

#### 2. Get Active Announcements (User API)
```http
GET /user/announcements?workspaceName=sales-workspace&productName=onecx-user-profile

Response: 200 OK
{
  "stream": [
    {
      "guid": "ann-1",
      "title": "Welcome to Sales!",
      "content": "Welcome to the new sales workspace.",
      "type": "INFO",
      "appearance": "WELCOME",
      "priority": "NORMAL",
      "startDate": "2026-02-19T00:00:00Z",
      "endDate": null
    },
    {
      "guid": "ann-2",
      "title": "System Maintenance",
      "content": "Scheduled maintenance this weekend.",
      "type": "SYSTEM_MAINTENANCE",
      "appearance": "BANNER",
      "priority": "IMPORTANT",
      "startDate": "2026-02-22T22:00:00Z",
      "endDate": "2026-02-23T02:00:00Z"
    }
  ]
}
```

**Query Logic**:
```java
public List<Announcement> getActiveAnnouncements(
        String workspaceName, 
        String productName) {
    
    LocalDateTime now = LocalDateTime.now();
    
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<Announcement> cq = cb.createQuery(Announcement.class);
    Root<Announcement> root = cq.from(Announcement.class);
    
    List<Predicate> predicates = new ArrayList<>();
    
    // Status must be ACTIVE
    predicates.add(cb.equal(root.get("status"), Status.ACTIVE));
    
    // Start date must be in the past
    predicates.add(cb.lessThanOrEqualTo(root.get("startDate"), now));
    
    // End date must be in the future or null
    predicates.add(cb.or(
        cb.isNull(root.get("endDate")),
        cb.greaterThanOrEqualTo(root.get("endDate"), now)
    ));
    
    // Workspace filter: null (all) OR matches request
    predicates.add(cb.or(
        cb.isNull(root.get("workspaceName")),
        cb.equal(root.get("workspaceName"), workspaceName)
    ));
    
    // Product filter: null (all) OR matches request
    predicates.add(cb.or(
        cb.isNull(root.get("productName")),
        cb.equal(root.get("productName"), productName)
    ));
    
    cq.where(predicates.toArray(new Predicate[0]));
    cq.orderBy(
        cb.desc(root.get("priority")),  // IMPORTANT first
        cb.desc(root.get("startDate"))  // Newest first
    );
    
    return em.createQuery(cq).getResultList();
}
```

#### 3. Update Announcement
```http
PUT /internal/announcements/{guid}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "INACTIVE"
}

Response: 200 OK
```

#### 4. Delete Announcement
```http
DELETE /internal/announcements/{guid}

Response: 204 No Content
```

---

### Frontend Implementation

**Announcement Display Component**:
```typescript
@Component({
  selector: 'app-announcement-banner',
  template: `
    <div *ngFor="let announcement of announcements$ | async"
         [ngClass]="'announcement-' + announcement.priority?.toLowerCase()"
         class="announcement-banner">
      
      <!-- Icon based on type -->
      <i [ngClass]="getIconClass(announcement.type)" class="mr-2"></i>
      
      <!-- Content -->
      <div class="flex-grow-1">
        <h4 class="announcement-title mb-1">{{ announcement.title }}</h4>
        <p class="announcement-content m-0">{{ announcement.content }}</p>
      </div>
      
      <!-- Close button -->
      <button pButton 
              icon="pi pi-times" 
              class="p-button-text p-button-sm"
              (click)="dismissAnnouncement(announcement.guid)">
      </button>
    </div>
  `,
  styles: [`
    .announcement-banner {
      display: flex;
      align-items: center;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      border-left: 4px solid;
    }
    
    .announcement-important {
      background-color: #fff3cd;
      border-left-color: #ffc107;
    }
    
    .announcement-normal {
      background-color: #d1ecf1;
      border-left-color: #17a2b8;
    }
    
    .announcement-low {
      background-color: #e2e3e5;
      border-left-color: #6c757d;
    }
  `]
})
export class AnnouncementBannerComponent implements OnInit {
  announcements$!: Observable<Announcement[]>;
  dismissedIds: Set<string> = new Set();
  
  constructor(
    private announcementApi: AnnouncementsAPIService,
    private appState: AppStateService
  ) {}
  
  ngOnInit(): void {
    this.appState.currentWorkspace$.subscribe(workspace => {
      if (workspace) {
        this.loadAnnouncements(workspace.workspaceName);
      }
    });
  }
  
  loadAnnouncements(workspaceName: string): void {
    this.announcements$ = this.announcementApi
      .getActiveAnnouncements({
        workspaceName,
        productName: 'onecx-user-profile'  // Current product
      })
      .pipe(
        map(result => result.stream || []),
        map(announcements => 
          announcements.filter(a => !this.dismissedIds.has(a.guid!))
        )
      );
  }
  
  dismissAnnouncement(guid: string): void {
    this.dismissedIds.add(guid);
    sessionStorage.setItem('dismissed-announcements', 
                          JSON.stringify([...this.dismissedIds]));
  }
  
  getIconClass(type: string): string {
    switch (type) {
      case 'SYSTEM_MAINTENANCE':
        return 'pi pi-wrench text-warning';
      case 'EVENT':
        return 'pi pi-calendar text-primary';
      case 'INFO':
      default:
        return 'pi pi-info-circle text-info';
    }
  }
}
```

---

### Usage Scenarios

**Scenario 1: Global System Maintenance**
```typescript
// Admin creates announcement visible to ALL workspaces and products
announcementApi.createAnnouncement({
  title: "Planned Maintenance",
  content: "System will be offline Saturday 10pm-2am for upgrades.",
  type: "SYSTEM_MAINTENANCE",
  appearance: "BANNER",
  priority: "IMPORTANT",
  status: "ACTIVE",
  startDate: "2026-02-22T22:00:00Z",
  endDate: "2026-02-23T02:00:00Z",
  workspaceName: null,  // All workspaces
  productName: null     // All products
});
```

**Scenario 2: Workspace-Specific Welcome Message**
```typescript
// Admin creates welcome message for sales workspace only
announcementApi.createAnnouncement({
  title: "Welcome to Sales Workspace!",
  content: "This workspace is for the sales team. Check out the new dashboard.",
  type: "INFO",
  appearance: "WELCOME",
  priority: "NORMAL",
  status: "ACTIVE",
  startDate: "2026-02-19T00:00:00Z",
  endDate: null,
  workspaceName: "sales-workspace",  // Only sales workspace
  productName: null                   // All products in sales workspace
});
```

**Scenario 3: Product-Specific Event**
```typescript
// Admin announces new feature in user-profile product
announcementApi.createAnnouncement({
  title: "New Feature: Avatar Upload",
  content: "You can now upload custom avatars in your profile!",
  type: "EVENT",
  appearance: "BANNER",
  priority: "NORMAL",
  status: "ACTIVE",
  startDate: "2026-02-19T00:00:00Z",
  endDate: "2026-03-01T00:00:00Z",
  workspaceName: null,
  productName: "onecx-user-profile"  // Only in user profile app
});
```

---

## OneCX Permission - Complete Deep Dive

### Overview

**Pattern Purpose - Enterprise Role-Based Access Control (RBAC)**:

**Why RBAC?**
- **Security**: Control who can do what (principle of least privilege)
- **Scalability**: Manage thousands of users efficiently
- **Flexibility**: Change permissions without code changes
- **Auditability**: Track who has access to what

**What This Service Does**:
- Defines permissions (RESOURCE#ACTION like USER#CREATE)
- Creates roles (collections of permissions)
- Assigns roles to users
- Validates permissions in APIs and UI

**Permission Structure**:
```
Permission = RESOURCE#ACTION

Examples:
- USER#CREATE (can create users)
- USER#READ (can view users)
- USER#UPDATE (can modify users)
- USER#DELETE (can delete users)
- WORKSPACE#CREATE (can create workspaces)
```

**How RBAC Works**:
```
1. Application registers permissions:
   - USER#CREATE, USER#READ, USER#UPDATE, USER#DELETE

2. Admin creates roles:
   - ADMIN role: All USER permissions
   - MANAGER role: USER#READ, USER#UPDATE
   - VIEWER role: USER#READ

3. Admin assigns roles to users:
   - john.doe: ADMIN role
   - jane.smith: MANAGER role

4. Application checks permissions:
   - john.doe tries USER#DELETE → ALLOWED (has ADMIN role)
   - jane.smith tries USER#DELETE → DENIED (has MANAGER role, missing DELETE)
```

**When to Use**: Any application with multiple user types needing different access levels.

The Permission service is OneCX's **RBAC (Role-Based Access Control)** system. It manages applications, permissions, and role assignments across the platform.

**GitHub**: `onecx-permission`  
**Components**: permission-svc, permission-bff, permission-ui, permission-operator  
**Database Tables**: 4 tables (APPLICATION, PERMISSION, ROLE, ASSIGNMENT)  
**Key Features**: Hierarchical permissions, dynamic role assignment, Keycloak integration

---

### Database Schema

```sql
-- Application Table
CREATE TABLE APPLICATION (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    app_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    
    CONSTRAINT uc_app_key UNIQUE (app_id, product_name)
);

-- Permission Table
CREATE TABLE PERMISSION (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    app_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,    -- e.g., "WORKSPACE", "USER"
    action VARCHAR(255) NOT NULL,      -- e.g., "CREATE", "DELETE"
    description TEXT,
    mandatory BOOLEAN DEFAULT FALSE,
    operator BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT permission_key UNIQUE (app_id, product_name, resource, action)
);

-- Role Table (from Keycloak)
CREATE TABLE ROLE (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Assignment Table (Role <-> Permission many-to-many)
CREATE TABLE ASSIGNMENT (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    role_guid VARCHAR(255) NOT NULL,
    permission_guid VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (role_guid) REFERENCES ROLE(guid) ON DELETE CASCADE,
    FOREIGN KEY (permission_guid) REFERENCES PERMISSION(guid) ON DELETE CASCADE,
    CONSTRAINT assignment_key UNIQUE (role_guid, permission_guid)
);

CREATE INDEX idx_app_product ON APPLICATION(product_name);
CREATE INDEX idx_permission_app ON PERMISSION(app_id, product_name);
CREATE INDEX idx_permission_resource ON PERMISSION(resource);
CREATE INDEX idx_assignment_role ON ASSIGNMENT(role_guid);
CREATE INDEX idx_assignment_permission ON ASSIGNMENT(permission_guid);
```

**Relationships**:
```
APPLICATION (1) ----< (M) PERMISSION
ROLE (M) ----< (M) PERMISSION (through ASSIGNMENT)
```

---

### Entity Models

```java
@Entity
@Table(name = "APPLICATION", uniqueConstraints = {
    @UniqueConstraint(name = "UC_APPLICATION_KEY", 
                     columnNames = {"APP_ID", "PRODUCT_NAME"})
})
public class Application extends TraceableEntity {
    
    @Column(name = "APP_ID")
    private String appId;  // e.g., "workspace-mgmt"
    
    @Column(name = "NAME")
    private String name;  // Display name
    
    @Column(name = "DESCRIPTION")
    private String description;
    
    @Column(name = "PRODUCT_NAME")
    private String productName;  // e.g., "onecx-workspace"
}

@Entity
@Table(name = "PERMISSION", uniqueConstraints = {
    @UniqueConstraint(name = "PERMISSION_KEY", 
                     columnNames = {"APP_ID", "PRODUCT_NAME", "RESOURCE", "ACTION"})
})
public class Permission extends TraceableEntity {
    
    @Column(name = "APP_ID")
    private String appId;
    
    @Column(name = "PRODUCT_NAME")
    private String productName;
    
    @Column(name = "RESOURCE")
    private String resource;  // e.g., "WORKSPACE", "USER", "ROLE"
    
    @Column(name = "ACTION")
    private String action;  // e.g., "CREATE", "READ", "UPDATE", "DELETE", "SEARCH"
    
    @Column(name = "DESCRIPTION")
    private String description;
    
    @Column(name = "MANDATORY")
    private Boolean mandatory;  // Cannot be deleted
    
    @Column(name = "OPERATOR")
    private Boolean operator;  // Created by operator
}

@Entity
@Table(name = "ROLE", uniqueConstraints = {
    @UniqueConstraint(name = "UC_ROLE_NAME", columnNames = {"NAME"})
})
public class Role extends TraceableEntity {
    
    @Column(name = "NAME")
    private String name;  // e.g., "ADMIN", "USER", "WORKSPACE_MANAGER"
    
    @Column(name = "DESCRIPTION")
    private String description;
}

@Entity
@Table(name = "ASSIGNMENT", uniqueConstraints = {
    @UniqueConstraint(name = "ASSIGNMENT_KEY", 
                     columnNames = {"ROLE_GUID", "PERMISSION_GUID"})
})
public class Assignment extends TraceableEntity {
    
    @ManyToOne
    @JoinColumn(name = "ROLE_GUID", nullable = false)
    private Role role;
    
    @ManyToOne
    @JoinColumn(name = "PERMISSION_GUID", nullable = false)
    private Permission permission;
}
```

---

### REST API Endpoints

#### 1. Register Application
```http
POST /internal/applications
Content-Type: application/json

{
  "appId": "workspace-mgmt",
  "productName": "onecx-workspace",
  "name": "Workspace Management",
  "description": "Application for managing workspaces"
}

Response: 201 Created
{
  "guid": "app-12345",
  "appId": "workspace-mgmt",
  "productName": "onecx-workspace",
  "name": "Workspace Management"
}
```

#### 2. Register Permissions
```http
POST /internal/permissions/batch
Content-Type: application/json

{
  "appId": "workspace-mgmt",
  "productName": "onecx-workspace",
  "permissions": [
    {
      "resource": "WORKSPACE",
      "action": "CREATE",
      "description": "Create new workspace"
    },
    {
      "resource": "WORKSPACE",
      "action": "READ",
      "description": "View workspace details"
    },
    {
      "resource": "WORKSPACE",
      "action": "UPDATE",
      "description": "Update workspace configuration"
    },
    {
      "resource": "WORKSPACE",
      "action": "DELETE",
      "description": "Delete workspace"
    },
    {
      "resource": "WORKSPACE",
      "action": "SEARCH",
      "description": "Search workspaces"
    }
  ]
}

Response: 201 Created
{
  "created": 5,
  "permissions": [...]
}
```

#### 3. Assign Permissions to Role
```http
POST /internal/roles/{roleGuid}/assignments
Content-Type: application/json

{
  "permissionGuids": [
    "perm-1",  // WORKSPACE#CREATE
    "perm-2",  // WORKSPACE#READ
    "perm-3"   // WORKSPACE#UPDATE
  ]
}

Response: 201 Created
{
  "created": 3
}
```

#### 4. Get User Permissions
```http
GET /user/permissions?productName=onecx-workspace

Response: 200 OK
{
  "permissions": [
    "WORKSPACE#CREATE",
    "WORKSPACE#READ",
    "WORKSPACE#UPDATE",
    "WORKSPACE#SEARCH",
    "PRODUCT#READ",
    "MENU#UPDATE"
  ]
}
```

**Implementation**:
```java
@Path("/user/permissions")
public class UserPermissionRestController {
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    PermissionService permissionService;
    
    @GET
    public Response getUserPermissions(
            @QueryParam("productName") String productName) {
        
        // Extract roles from JWT
        List<String> userRoles = jwt.getGroups()
            .stream()
            .collect(Collectors.toList());
        
        // Query permissions for these roles
        List<Permission> permissions = permissionService
            .getPermissionsForRoles(userRoles, productName);
        
        // Format as "RESOURCE#ACTION"
        List<String> permissionStrings = permissions.stream()
            .map(p -> p.getResource() + "#" + p.getAction())
            .collect(Collectors.toList());
        
        return Response.ok(Map.of("permissions", permissionStrings)).build();
    }
}
```

---

### Permission Checking

**Backend Permission Check**:
```java
@Path("/internal/workspaces")
public class WorkspaceRestController {
    
    @Inject
    PermissionService permissionService;
    
    @POST
    @Transactional
    public Response createWorkspace(CreateWorkspaceRequest request) {
        
        // Check permission
        if (!permissionService.hasPermission("WORKSPACE", "CREATE")) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity("Missing WORKSPACE#CREATE permission")
                .build();
        }
        
        // Proceed with creation
        var workspace = workspaceDAO.create(request);
        return Response.status(Response.Status.CREATED)
            .entity(mapper.map(workspace))
            .build();
    }
}
```

**Frontend Permission Directive**:
```typescript
@Directive({
  selector: '[permission]'
})
export class PermissionDirective implements OnInit {
  @Input() permission!: string;  // e.g., "WORKSPACE#CREATE"
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}
  
  ngOnInit(): void {
    this.permissionService.hasPermission(this.permission).subscribe(hasPermission => {
      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

// Usage in template:
// <button *permission="'WORKSPACE#CREATE'" (click)="create()">
//   Create Workspace
// </button>
```

---

### Permission Operator

The Permission Operator automatically registers applications and permissions from Kubernetes custom resources:

```yaml
apiVersion: onecx.tkit.org/v1
kind: Permission
metadata:
  name: workspace-permissions
spec:
  appId: workspace-mgmt
  productName: onecx-workspace
  permissions:
    - resource: WORKSPACE
      action: CREATE
      description: Create workspace
      mandatory: true
    - resource: WORKSPACE
      action: READ
      description: View workspace
      mandatory: true
    - resource: WORKSPACE
      action: UPDATE
      description: Update workspace
      mandatory: false
    - resource: WORKSPACE
      action: DELETE
      description: Delete workspace
      mandatory: false
```

**Operator watches for these CRDs and calls the REST API to register permissions**.

---

## OneCX Theme - Complete Deep Dive

### Overview

**Pattern Purpose - Dynamic UI Theming System**:

**Why Theming?**
- **Branding**: Match company's visual identity
- **Customization**: Different look per workspace/tenant
- **Consistency**: Centralized theme ensures uniform appearance
- **Flexibility**: Change colors/fonts without code changes

**What This Service Does**:
- Stores theme definitions (colors, fonts, logos)
- Manages CSS custom properties (CSS variables)
- Provides workspace-specific overrides
- Handles logo upload and storage

**How CSS Variables Work**:
```css
/* Theme defines variables */
:root {
  --primary-color: #1976d2;  /* Blue */
  --text-color: #333333;
  --font-family: 'Roboto', sans-serif;
}

/* Components use variables */
.button {
  background-color: var(--primary-color);
  color: var(--text-color);
  font-family: var(--font-family);
}

/* Change theme = change variables = entire UI updates */
```

**Theme Hierarchy**:
```
Base Theme (corporate-blue)
   ↓
Workspace Override (sales-workspace: red primary color)
   ↓
Final Style (blue theme with red override for sales)
```

**When to Use**: Any multi-tenant application requiring white-label branding.

The Theme service manages visual branding and styling for workspaces and applications. Supports CSS custom properties, logo management, and workspace-specific theming.

**GitHub**: `onecx-theme`  
**Components**: theme-svc, theme-bff, theme-ui  
**Database Tables**: 2 tables (THEME, THEME_OVERRIDE)  
**Key Features**: CSS variables, logo upload, per-workspace themes, preview images

---

### Database Schema

```sql
-- Theme Table
CREATE TABLE THEME (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    -- Identification
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    
    -- Assets
    css_file VARCHAR(500),              -- URL to CSS file
    assets_url VARCHAR(500),            -- Base URL for theme assets
    assets_update_date TIMESTAMP,
    
    -- Logos
    logo_url VARCHAR(500),
    small_logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    preview_image_url VARCHAR(500),
    
    -- Properties (CSS variables stored as key=value lines)
    properties TEXT,
    
    -- Flags
    operator BOOLEAN DEFAULT FALSE,
    mandatory BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT theme_name UNIQUE (name, tenant_id)
);

-- Theme Override Table (workspace-specific overrides)
CREATE TABLE THEME_OVERRIDE (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    operator_version INTEGER,
    
    theme_id VARCHAR(255) NOT NULL,
    workspace_name VARCHAR(255) NOT NULL,
    
    -- Override properties
    logo_url VARCHAR(500),
    small_logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    properties TEXT,
    
    FOREIGN KEY (theme_id) REFERENCES THEME(guid) ON DELETE CASCADE,
    CONSTRAINT theme_override_key UNIQUE (theme_id, workspace_name)
);

CREATE INDEX idx_theme_name ON THEME(name, tenant_id);
CREATE INDEX idx_override_theme ON THEME_OVERRIDE(theme_id);
```

**Entity Models**:
```java
@Entity
@Table(name = "THEME", uniqueConstraints = {
    @UniqueConstraint(name = "THEME_NAME", columnNames = {"NAME", "TENANT_ID"})
})
public class Theme extends TraceableEntity {
    
    @TenantId
    @Column(name = "TENANT_ID")
    private String tenantId;
    
    @Column(name = "NAME")
    private String name;  // e.g., "corporate-blue"
    
    @Column(name = "DISPLAY_NAME")
    private String displayName;  // e.g., "Corporate Blue Theme"
    
    @Column(name = "CSS_FILE")
    private String cssFile;  // URL to compiled CSS
    
    @Column(name = "ASSETS_URL")
    private String assetsUrl;  // Base URL for images, fonts, etc.
    
    @Column(name = "LOGO_URL")
    private String logoUrl;
    
    @Column(name = "SMALL_LOGO_URL")
    private String smallLogoUrl;
    
    @Column(name = "FAVICON_URL")
    private String faviconUrl;
    
    @Column(name = "PREVIEW_IMAGE_URL")
    private String previewImageUrl;  // Preview screenshot
    
    @Column(name = "ASSETS_UPDATE_DATE")
    private LocalDateTime assetsUpdateDate;
    
    @Column(name = "PROPERTIES", columnDefinition = "TEXT")
    private String properties;  // CSS variables as text
    
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "THEME_ID")
    private List<ThemeOverride> overrides = new ArrayList<>();
    
    @Column(name = "OPERATOR")
    private Boolean operator;
    
    @Column(name = "MANDATORY")
    private Boolean mandatory;
}

@Entity
@Table(name = "THEME_OVERRIDE", uniqueConstraints = {
    @UniqueConstraint(name = "THEME_OVERRIDE_KEY", 
                     columnNames = {"THEME_ID", "WORKSPACE_NAME"})
})
public class ThemeOverride extends TraceableEntity {
    
    @Column(name = "THEME_ID")
    private String themeId;
    
    @Column(name = "WORKSPACE_NAME")
    private String workspaceName;
    
    @Column(name = "LOGO_URL")
    private String logoUrl;  // Override logo for this workspace
    
    @Column(name = "SMALL_LOGO_URL")
    private String smallLogoUrl;
    
    @Column(name = "FAVICON_URL")
    private String faviconUrl;
    
    @Column(name = "PROPERTIES", columnDefinition = "TEXT")
    private String properties;  // Override CSS variables
}
```

---

### REST API Endpoints

#### 1. Create Theme
```http
POST /internal/themes
Content-Type: application/json

{
  "name": "corporate-blue",
  "displayName": "Corporate Blue Theme",
  "description": "Professional blue theme for corporate environments",
  "properties": {
    "--primary-color": "#1976d2",
    "--secondary-color": "#424242",
    "--surface-color": "#ffffff",
    "--text-color": "#212121",
    "--border-radius": "4px",
    "--font-family": "'Roboto', sans-serif"
  }
}

Response: 201 Created
{
  "guid": "theme-12345",
  "name": "corporate-blue",
  "displayName": "Corporate Blue Theme",
  "properties": "..."
}
```

#### 2. Upload Theme Logo
```http
POST /internal/themes/{themeGuid}/logo
Content-Type: multipart/form-data

file=<binary data>

Response: 201 Created
{
  "logoUrl": "https://cdn.example.com/themes/corporate-blue/logo.png"
}
```

#### 3. Get Theme with Workspace Overrides
```http
GET /user/themes/{themeName}?workspaceName=sales-workspace

Response: 200 OK
{
  "guid": "theme-12345",
  "name": "corporate-blue",
  "displayName": "Corporate Blue Theme",
  "logoUrl": "https://cdn.example.com/sales-workspace/logo.png",  // Override!
  "properties": {
    "--primary-color": "#d32f2f",  // Overridden for sales workspace
    "--secondary-color": "#424242",
    "--surface-color": "#ffffff",
    ...
  }
}
```

**Implementation with Overrides**:
```java
@GET
@Path("/{themeName}")
public Response getThemeForWorkspace(
        @PathParam("themeName") String themeName,
        @QueryParam("workspaceName") String workspaceName) {
    
    var theme = themeDAO.findByName(themeName);
    if (theme == null) {
        return Response.status(Response.Status.NOT_FOUND).build();
    }
    
    var dto = mapper.mapTheme(theme);
    
    // Apply workspace-specific overrides
    if (workspaceName != null) {
        var override = theme.getOverrides().stream()
            .filter(o -> o.getWorkspaceName().equals(workspaceName))
            .findFirst()
            .orElse(null);
        
        if (override != null) {
            // Override properties
            if (override.getLogoUrl() != null) {
                dto.setLogoUrl(override.getLogoUrl());
            }
            if (override.getProperties() != null) {
                // Merge properties (override wins)
                var mergedProps = mergeProperties(
                    theme.getProperties(), 
                    override.getProperties()
                );
                dto.setProperties(mergedProps);
            }
        }
    }
    
    return Response.ok(dto).build();
}
```

#### 4. Export Theme Configuration
```http
GET /internal/themes/{themeGuid}/export

Response: 200 OK
Content-Type: application/json
Content-Disposition: attachment; filename="corporate-blue-theme.json"

{
  "name": "corporate-blue",
  "displayName": "Corporate Blue Theme",
  "properties": {
    "--primary-color": "#1976d2",
    "--secondary-color": "#424242",
    ...
  },
  "overrides": [
    {
      "workspaceName": "sales-workspace",
      "properties": {
        "--primary-color": "#d32f2f"
      }
    }
  ]
}
```

---

### Frontend Theme Application

**Theme Loader Service**:
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  
  private currentTheme$ = new BehaviorSubject<Theme | null>(null);
  
  constructor(
    private themeApi: ThemesAPIService,
    private appState: AppStateService,
    private document: Document
  ) {}
  
  loadTheme(themeName: string, workspaceName: string): Observable<Theme> {
    return this.themeApi.getTheme({ themeName, workspaceName }).pipe(
      tap(theme => {
        this.applyTheme(theme);
        this.currentTheme$.next(theme);
      })
    );
  }
  
  private applyTheme(theme: Theme): void {
    // 1. Load CSS file if provided
    if (theme.cssFile) {
      this.loadStylesheet(theme.cssFile);
    }
    
    // 2. Apply CSS custom properties
    if (theme.properties) {
      const root = this.document.documentElement;
      Object.entries(theme.properties).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    
    // 3. Update logos
    this.updateLogos(theme);
    
    // 4. Update favicon
    if (theme.faviconUrl) {
      this.updateFavicon(theme.faviconUrl);
    }
  }
  
  private loadStylesheet(url: string): void {
    const linkId = 'theme-css';
    let link = this.document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = this.document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      this.document.head.appendChild(link);
    }
    
    link.href = url;
  }
  
  private updateLogos(theme: Theme): void {
    // Update all logo elements
    const logoElements = this.document.querySelectorAll('[data-theme-logo]');
    logoElements.forEach(el => {
      (el as HTMLImageElement).src = theme.logoUrl || '';
    });
    
    const smallLogoElements = this.document.querySelectorAll('[data-theme-logo-small]');
    smallLogoElements.forEach(el => {
      (el as HTMLImageElement).src = theme.smallLogoUrl || '';
    });
  }
  
  private updateFavicon(faviconUrl: string): void {
    let link = this.document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }
}
```

**Usage in Shell**:
```typescript
@Component({
  selector: 'app-shell',
  template: `
    <div class="layout-wrapper">
      <app-header [logo]="(currentTheme$ | async)?.logoUrl"></app-header>
      <app-sidebar></app-sidebar>
      <main class="layout-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class ShellComponent implements OnInit {
  currentTheme$ = this.themeService.currentTheme$;
  
  constructor(
    private themeService: ThemeService,
    private appState: AppStateService
  ) {}
  
  ngOnInit(): void {
    this.appState.currentWorkspace$.subscribe(workspace => {
      if (workspace?.theme) {
        this.themeService.loadTheme(workspace.theme, workspace.workspaceName);
      }
    });
  }
}
```

---

### CSS Variables Supported

OneCX themes support these CSS custom properties:

```css
:root {
  /* Colors */
  --primary-color: #1976d2;
  --primary-color-text: #ffffff;
  --secondary-color: #424242;
  --surface-color: #ffffff;
  --text-color: #212121;
  --text-secondary-color: #757575;
  --border-color: #e0e0e0;
  
  /* Background Colors */
  --background-color: #f5f5f5;
  --card-background: #ffffff;
  
  /* Semantic Colors */
  --success-color: #4caf50;
  --info-color: #2196f3;
  --warning-color: #ff9800;
  --danger-color: #f44336;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: 'Roboto', sans-serif;
  --font-size-base: 14px;
  --font-size-sm: 12px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  
  /* Layout */
  --border-radius: 4px;
  --border-radius-sm: 2px;
  --border-radius-lg: 8px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 2px 6px rgba(0,0,0,0.16);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.24);
  
  /* Header */
  --header-height: 60px;
  --header-background: #1976d2;
  --header-text-color: #ffffff;
  
  /* Sidebar */
  --sidebar-width: 250px;
  --sidebar-background: #fafafa;
  --sidebar-item-hover: #e0e0e0;
}
```

---


## OneCX Product Store - Complete Deep Dive

### Overview
The Product Store is OneCX's **application registry**. It maintains a catalog of all available products (applications), their microfrontends, microservices, and metadata.

**GitHub**: `onecx-product-store`  
**Components**: product-store-svc, product-store-bff, product-store-ui, product-store-operator  
**Database Tables**: 6 tables (PRODUCT, MICROFRONTEND, MICROSERVICE, SLOT, PRODUCT_CLASSIFICATION)  
**Key Role**: Central registry for workspace composition

---

### Architecture Purpose

**Why Product Store Exists**:
1. **Discoverability**: Workspaces query "what products are available?"
2. **Version Management**: Track product versions and updates
3. **Deployment Status**: Know which products are deployed/undeployed
4. **Microfrontend Metadata**: Remote URLs, module names, technology info
5. **Slot Registration**: Products register extension points
6. **Multi-tenancy Support**: Products can be tenant-aware or global

---

### Database Schema

```sql
-- Product: The main application/feature
CREATE TABLE PRODUCT (
    guid VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    version VARCHAR(100),
    display_name VARCHAR(255),
    description TEXT,
    base_path VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    icon_name VARCHAR(100),
    provider VARCHAR(255),
    classifications VARCHAR(500),  -- Tags/categories
    undeployed BOOLEAN DEFAULT FALSE,
    multitenancy BOOLEAN DEFAULT FALSE,  -- Supports multi-tenancy?
    operator BOOLEAN DEFAULT FALSE
);

-- Microfrontend: UI modules within a product
CREATE TABLE MICROFRONTEND (
    guid VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    mfe_id VARCHAR(255) NOT NULL,
    app_id VARCHAR(255),
    app_version VARCHAR(100),
    app_name VARCHAR(255),
    remote_base_url VARCHAR(500),  -- e.g., "http://user-profile-ui:8080"
    remote_name VARCHAR(255),       -- e.g., "userProfileUi"
    remote_entry VARCHAR(255),      -- e.g., "remoteEntry.js"
    technology VARCHAR(50),         -- "Angular", "React", "Vue"
    type VARCHAR(50),               -- "MODULE", "COMPONENT"
    exposed_module VARCHAR(255),    -- e.g., "./UserProfileModule"
    deprecated BOOLEAN DEFAULT FALSE,
    undeployed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(guid) ON DELETE CASCADE,
    CONSTRAINT mfe_product_key UNIQUE (mfe_id, product_id)
);

-- Microservice: Backend services
CREATE TABLE MICROSERVICE (
    guid VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    app_name VARCHAR(255),
    version VARCHAR(100),
    description TEXT,
    type VARCHAR(50),  -- "BFF", "SERVICE"
    undeployed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(guid) ON DELETE CASCADE
);

-- Slot: Extension points products provide
CREATE TABLE SLOT (
    guid VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deprecated BOOLEAN DEFAULT FALSE,
    undeployed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(guid) ON DELETE CASCADE,
    CONSTRAINT slot_product_key UNIQUE (name, product_id)
);

-- Product Classification: Tags/categories
CREATE TABLE PRODUCT_CLASSIFICATION (
    guid VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,  -- e.g., "CRM", "ADMIN", "REPORTING"
    FOREIGN KEY (product_id) REFERENCES PRODUCT(guid) ON DELETE CASCADE
);
```

---

### Key Patterns

#### 1. Product Registration Flow

When a new product is deployed:

```java
// Operator or deployment script calls:
POST /internal/products
{
  "name": "onecx-user-profile",
  "version": "2.1.0",
  "basePath": "/user-profile",
  "displayName": "User Management",
  "multitenancy": true,
  "microfrontends": [
    {
      "mfeId": "user-profile-ui",
      "remoteBaseUrl": "http://user-profile-ui:8080",
      "remoteName": "userProfileUi",
      "exposedModule": "./UserProfileModule",
      "technology": "Angular"
    }
  ],
  "microservices": [
    {
      "appId": "user-profile-svc",
      "type": "SERVICE"
    },
    {
      "appId": "user-profile-bff",
      "type": "BFF"
    }
  ]
}
```

**Key Logic**: Product Store validates uniqueness, stores metadata, makes product available for workspaces.

---

#### 2. Workspace Product Lookup

When user enters a workspace:

```typescript
// Shell asks: "What products are in this workspace?"
workspaceApi.getWorkspace(workspaceId).subscribe(workspace => {
  workspace.products.forEach(product => {
    // For each product, load its microfrontends
    productStoreApi.getProduct(product.name).subscribe(productDetail => {
      productDetail.microfrontends.forEach(mfe => {
        // Register with Module Federation
        registerRemoteModule(mfe.remoteName, mfe.remoteBaseUrl);
      });
    });
  });
});
```

**Flow**:
1. Workspace defines which products it includes
2. Shell queries Product Store for product details
3. Shell gets microfrontend URLs and metadata
4. Shell configures Webpack Module Federation dynamically
5. Microfrontends become available for routing

---

#### 3. Slot Discovery

Products register slots they provide:

```java
// During product registration
Slot headerSlot = new Slot();
headerSlot.setName("header-actions");
headerSlot.setDescription("Actions shown in header bar");
slotDAO.create(headerSlot);
```

Other products can then fill these slots:

```typescript
// Another microfrontend provides a component for this slot
@Component({
  selector: 'app-custom-header-actions',
  template: `<button>Custom Action</button>`
})
export class CustomHeaderActionsComponent {
  // This component will be loaded into "header-actions" slot
}
```

**Registration in Product Store**:
```json
{
  "productName": "custom-app",
  "components": [
    {
      "name": "CustomHeaderActions",
      "slot": "header-actions",
      "module": "./CustomHeaderActionsModule"
    }
  ]
}
```

---

#### 4. Version Management

**Problem**: How to handle product updates?

**Solution**: Product Store tracks versions:

```java
// Update product version
PUT /internal/products/{productId}
{
  "version": "2.2.0",
  "microfrontends": [
    {
      "mfeId": "user-profile-ui",
      "remoteBaseUrl": "http://user-profile-ui-v2:8080", // New URL
      "appVersion": "2.2.0"
    }
  ]
}
```

**Deployment Strategy**:
- Blue-Green: Keep old version running, switch URL when ready
- Rolling: Gradually update remoteBaseUrl
- Canary: Route subset of users to new version

---

### REST API Key Endpoints

#### Search Products (Public)
```http
GET /v1/products?name=user-profile

Response: Products with metadata for UI display
```

#### Get Product Details
```http
GET /v1/products/{productName}

Response: {
  "name": "onecx-user-profile",
  "version": "2.1.0",
  "microfrontends": [...],
  "microservices": [...],
  "slots": [...]
}
```

#### Register Product (Internal)
```http
POST /internal/products

Used by operators/CI to register new products
```

---

### Operator Integration

**Product Operator** watches Kubernetes CRDs:

```yaml
apiVersion: onecx.tkit.org/v1
kind: Product
metadata:
  name: onecx-user-profile
spec:
  name: onecx-user-profile
  version: 2.1.0
  basePath: /user-profile
  microfrontends:
    - mfeId: user-profile-ui
      remoteBaseUrl: http://user-profile-ui:8080
      remoteName: userProfileUi
      exposedModule: ./UserProfileModule
      technology: Angular
```

**Operator Actions**:
1. Watch for Product CRD changes
2. Call Product Store REST API
3. Register/update product
4. Handle cleanup on deletion

---

## OneCX Parameter - Complete Deep Dive

### Overview
The Parameter service provides **distributed configuration management**. It stores key-value parameters that applications can query at runtime.

**GitHub**: `onecx-parameter`  
**Components**: parameter-svc, parameter-bff, parameter-ui, parameter-operator  
**Database Tables**: 1 table (PARAMETER)  
**Key Features**: Multi-tenant, application-scoped, operator-managed

---

### Architecture Purpose

**Why Parameters Exist**:
1. **External Configuration**: Avoid hardcoding values in code
2. **Environment-Specific**: Different values per tenant/environment
3. **Runtime Changes**: Update config without redeployment
4. **Centralized Management**: One place for all app configs
5. **Audit Trail**: Track who changed what when

---

### Database Schema

```sql
CREATE TABLE PARAMETER (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    -- Scope
    product_name VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL,
    
    -- Parameter
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    value VARCHAR(5000),  -- Current value
    import_value VARCHAR(5000),  -- Value from import/operator
    
    operator BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT param_key UNIQUE (name, app_id, product_name, tenant_id),
    INDEX param_lookup (product_name, app_id, tenant_id)
);
```

**Key Design**:
- **Tenant-scoped**: Each tenant has separate parameter values
- **App-scoped**: Parameters belong to specific app in specific product
- **Hierarchical lookup**: product → app → parameter name

---

### Usage Patterns

#### 1. Application Queries Parameters at Startup

```java
@ApplicationScoped
public class AppConfigLoader {
    
    @Inject
    ParameterService parameterService;
    
    void onStart(@Observes StartupEvent event) {
        // Load all parameters for this application
        Map<String, String> config = parameterService.getParameters(
            "onecx-user-profile",  // product name
            "user-profile-svc"     // app id
        );
        
        // Use configuration
        int maxUploadSize = Integer.parseInt(
            config.getOrDefault("avatar.maxSizeMB", "5")
        );
        
        String emailProvider = config.get("email.provider");
        // Configure email service...
    }
}
```

---

#### 2. Frontend Queries Parameters

```typescript
@Injectable({ providedIn: 'root' })
export class ConfigService {
  
  private config$ = new BehaviorSubject<Map<string, string>>(new Map());
  
  constructor(private parameterApi: ParametersAPIService) {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    this.parameterApi.getParameters({
      productName: 'onecx-user-profile',
      applicationId: 'user-profile-ui'
    }).subscribe(result => {
      const configMap = new Map(
        result.parameters?.map(p => [p.name, p.value]) || []
      );
      this.config$.next(configMap);
    });
  }
  
  get(key: string, defaultValue: string = ''): string {
    return this.config$.value.get(key) || defaultValue;
  }
}

// Usage in component
export class UploadComponent {
  maxFileSizeMB = this.configService.get('avatar.maxSizeMB', '5');
}
```

---

#### 3. Admin Updates Parameter

```http
PUT /internal/parameters/{guid}
{
  "value": "10"  // Change max file size from 5 to 10 MB
}

Response: Parameter updated, applications can query new value
```

**Note**: Applications must re-query or subscribe to changes to get updated values.

---

#### 4. Operator Manages Parameters

```yaml
apiVersion: onecx.tkit.org/v1
kind: Parameter
metadata:
  name: user-profile-config
spec:
  productName: onecx-user-profile
  applicationId: user-profile-svc
  parameters:
    - name: avatar.maxSizeMB
      value: "5"
      description: Maximum avatar upload size in MB
    - name: email.provider
      value: "smtp"
      description: Email provider type
    - name: session.timeoutMinutes
      value: "30"
      description: Session timeout in minutes
```

**Operator Flow**:
1. Detects Parameter CRD
2. Calls Parameter Service API
3. Creates/updates parameters
4. Sets `operator=true` flag
5. Prevents manual deletion

---

### Import/Export Pattern

**Export** current parameters:
```http
GET /internal/parameters/export?productName=onecx-user-profile

Response: JSON file with all parameters
```

**Import** parameters (e.g., from another environment):
```http
POST /internal/parameters/import
Content-Type: application/json

{
  "parameters": [
    {
      "productName": "onecx-user-profile",
      "applicationId": "user-profile-svc",
      "name": "avatar.maxSizeMB",
      "value": "10"
    }
  ]
}
```

**Import Strategy**:
- Current value remains in `value` field
- Import value stored in `import_value` field
- Admin reviews and decides whether to apply
- This prevents accidental overwrites

---

### Key Scenarios

#### Scenario 1: Feature Flags

```java
// Parameter: features.newDashboard = "true"

if (parameterService.getBooleanParameter("features.newDashboard")) {
    return new DashboardV2();
} else {
    return new DashboardV1();
}
```

#### Scenario 2: Rate Limiting

```java
// Parameter: api.rateLimit.requestsPerMinute = "100"

int limit = parameterService.getIntParameter("api.rateLimit.requestsPerMinute", 60);
rateLimiter.setLimit(limit);
```

#### Scenario 3: External Service URLs

```typescript
// Parameter: services.paymentGateway.url = "https://payment.example.com"

const paymentUrl = configService.get('services.paymentGateway.url');
return this.http.post(paymentUrl, paymentData);
```

---

## OneCX Shell - Complete Deep Dive

### Overview

**Pattern Purpose - Microfrontend Orchestration Layer**:

**Why Shell?**
- **Single Entry Point**: One app loads all others
- **Runtime Integration**: Microfrontends loaded dynamically (no rebuild needed)
- **Shared Context**: Theme, permissions, user info available to all apps
- **Isolation**: Microfrontends can't break each other

**What Shell Does**:
- Bootstraps the OneCX platform
- Loads workspace configuration
- Dynamically imports microfrontends using Module Federation
- Provides shared services (theme, permissions, navigation)
- Renders top/side navigation and layout

**How It Works**:
```
1. User navigates to: https://portal.company.com/admin
                              ↓
2. Shell loads and reads URL: workspace = "admin"
                              ↓
3. Shell fetches workspace config from backend
   Returns: workspace has products [IAM, Workspace, Theme]
                              ↓
4. Shell loads microfrontends:
   - Workspace UI from http://workspace-ui:8080
   - IAM UI from http://iam-ui:8080
   - Theme UI from http://theme-ui:8080
                              ↓
5. User clicks "Users" menu → Shell routes to IAM microfrontend
   URL becomes: https://portal.company.com/admin/iam/users
```

**Module Federation**:
- **Without Module Federation**: Deploy new app → rebuild entire portal
- **With Module Federation**: Deploy new app → Shell loads it automatically

**When to Use**: Any application composed of independently deployed frontends.

The Shell is the **orchestrator** of the entire OneCX frontend. It's the host application that loads, manages, and composes all microfrontends at runtime.

**GitHub**: `0_onecx-shell-ui`  
**Technology**: Angular 19+, Webpack Module Federation  
**Key Responsibilities**: Authentication, routing, microfrontend loading, workspace management

---

### Architecture Role

**Shell as the Foundation**:
```
┌───────────────────────────────────────────────┐
│                  Shell                        │
│  ┌─────────────────────────────────────────┐ │
│  │ Authentication & Security               │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Workspace Context Management            │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Module Federation Configuration         │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Dynamic Routing                         │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Layout & Navigation                     │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ Slot System                             │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
         ↓ Loads & Manages ↓
    ┌────────┐  ┌────────┐  ┌────────┐
    │  MFE1  │  │  MFE2  │  │  MFE3  │
    │ User   │  │ Admin  │  │ Report │
    │Profile │  │  UI    │  │   UI   │
    └────────┘  └────────┘  └────────┘
```

---

### Bootstrap & Initialization

**Shell Startup Sequence**:

1. **App Loads** (`main.ts`):
```typescript
// Shell starts with minimal bootstrap
platformBrowserDynamic().bootstrapModule(AppModule);
```

2. **Authentication Check** (`app-initializer.ts`):
```typescript
export function initializeApp(authService: AuthService): () => Promise<void> {
  return () => authService.init()
    .then(() => authService.checkAuthentication())
    .then(isAuth => {
      if (!isAuth) {
        // Redirect to login
        authService.login();
        return Promise.reject('Not authenticated');
      }
    });
}
```

3. **Load Workspace Context**:
```typescript
workspaceService.loadCurrentWorkspace().subscribe(workspace => {
  // Store workspace in app state
  appStateService.setWorkspace(workspace);
  
  // Load theme
  themeService.loadTheme(workspace.theme, workspace.name);
  
  // Build navigation menu
  menuService.buildMenu(workspace.menuItems);
});
```

4. **Configure Module Federation**:
```typescript
workspace.products.forEach(product => {
  product.microfrontends.forEach(mfe => {
    // Add remote to Webpack Module Federation config
    const remoteEntry = `${mfe.remoteBaseUrl}/${mfe.remoteEntry}`;
    loadRemoteModule(mfe.remoteName, remoteEntry);
  });
});
```

5. **Setup Dynamic Routes**:
```typescript
workspace.products.forEach(product => {
  router.config.push({
    path: product.baseUrl,
    loadChildren: () => 
      loadRemoteModule(product.mfeName).then(m => m.RemoteModule)
  });
});
```

---

### Module Federation Deep Dive

**What Module Federation Does**:
- Allows loading JavaScript modules from remote URLs at runtime
- Each microfrontend is a separate webpack bundle
- Shell doesn't need to know microfrontends at build time

**webpack.config.js** (simplified):
```javascript
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // These are configured dynamically at runtime!
        // 'userProfileUi': 'userProfileUi@http://user-profile-ui:8080/remoteEntry.js'
      },
      shared: {
        '@angular/core': { singleton: true },
        '@angular/common': { singleton: true },
        'rxjs': { singleton: true }
      }
    })
  ]
};
```

**Dynamic Remote Loading**:
```typescript
function loadRemoteModule(remoteName: string, url: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      // Remote module now available as window[remoteName]
      const container = window[remoteName];
      container.init(__webpack_share_scopes__.default);
      resolve(container);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

---

### Slot System Architecture

**Purpose**: Allow microfrontends to inject components into shell's layout.

**Slot Host** (in Shell):
```typescript
@Component({
  selector: 'ocx-slot',
  template: `
    <ng-container #container></ng-container>
  `
})
export class SlotComponent implements OnInit {
  @Input() name!: string;  // e.g., "header-actions"
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  
  ngOnInit(): void {
    // Query which component should fill this slot
    this.slotService.getComponentForSlot(this.name).subscribe(componentRef => {
      if (componentRef) {
        // Dynamically create component
        this.container.createComponent(componentRef);
      }
    });
  }
}
```

**Usage in Shell Layout**:
```html
<header>
  <div class="logo">...</div>
  <ocx-slot name="header-actions"></ocx-slot>  <!-- Extension point -->
</header>
```

**Microfrontend Fills Slot**:
```typescript
// In remote microfrontend
@Component({
  selector: 'app-custom-actions',
  template: `<button>Custom Action</button>`
})
export class CustomActionsComponent {}

// Register with slot system
@NgModule({
  declarations: [CustomActionsComponent],
  // Export for dynamic loading
})
export class CustomActionsModule {
  // Slot registration happens via Product Store metadata
}
```

---

### Routing Strategy

**Problem**: How to route between microfrontends that aren't known at build time?

**Solution**: Dynamic route configuration:

```typescript
@Injectable()
export class DynamicRoutingService {
  
  configureRoutes(workspace: Workspace): void {
    const routes: Routes = [
      { path: '', redirectTo: workspace.homePage, pathMatch: 'full' },
      { path: 'error', component: ErrorComponent }
    ];
    
    // Add route for each product
    workspace.products.forEach(product => {
      routes.push({
        path: product.baseUrl.substring(1), // Remove leading /
        loadChildren: () => this.loadMicrofront(product.name)
      });
    });
    
    // Reset router configuration
    this.router.resetConfig(routes);
  }
  
  private loadMicrofront(productName: string): Promise<any> {
    return this.productStore.getMicrofrontend(productName)
      .then(mfe => loadRemoteModule(mfe.remoteName, mfe.exposedModule))
      .then(module => module.RemoteEntryModule);
  }
}
```

**Route Guard for Permissions**:
```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredPermission = route.data['permission'];
    
    return this.permissionService.hasPermission(requiredPermission).pipe(
      tap(hasPermission => {
        if (!hasPermission) {
          this.router.navigate(['/error'], {
            queryParams: { message: 'ACCESS_DENIED' }
          });
        }
      })
    );
  }
}
```

---

### State Management

**AppStateService** maintains global state:

```typescript
@Injectable({ providedIn: 'root' })
export class AppStateService {
  
  // Current workspace
  private workspaceSubject = new BehaviorSubject<Workspace | null>(null);
  public currentWorkspace$ = this.workspaceSubject.asObservable();
  
  // Current user
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.userSubject.asObservable();
  
  // Permissions
  private permissionsSubject = new BehaviorSubject<string[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();
  
  // Methods
  setWorkspace(workspace: Workspace): void {
    this.workspaceSubject.next(workspace);
  }
  
  setUser(user: UserProfile): void {
    this.userSubject.next(user);
  }
  
  setPermissions(permissions: string[]): void {
    this.permissionsSubject.next(permissions);
  }
}
```

**Microfrontends Access State**:
```typescript
// In any microfrontend
export class SomeComponent {
  workspace$ = this.appState.currentWorkspace$;
  
  constructor(private appState: AppStateService) {}
  
  ngOnInit(): void {
    this.workspace$.subscribe(workspace => {
      console.log('Current workspace:', workspace.name);
    });
  }
}
```

---

### Communication Between Microfrontends

**Problem**: How do independent microfrontends communicate?

**Solution 1: Shared State Service** (via Shell):
```typescript
// Shell provides MessageBusService
@Injectable({ providedIn: 'root' })
export class MessageBusService {
  private messages$ = new Subject<Message>();
  
  publish(topic: string, data: any): void {
    this.messages$.next({ topic, data, timestamp: new Date() });
  }
  
  subscribe(topic: string): Observable<any> {
    return this.messages$.pipe(
      filter(msg => msg.topic === topic),
      map(msg => msg.data)
    );
  }
}

// MFE A publishes event
messageBus.publish('user-updated', { userId: 123 });

// MFE B subscribes to event
messageBus.subscribe('user-updated').subscribe(data => {
  console.log('User updated:', data.userId);
  this.refreshData();
});
```

**Solution 2: URL Parameters** (for loose coupling):
```typescript
// Navigate with state
router.navigate(['/other-mfe/detail'], {
  queryParams: { id: 123, from: 'user-profile' }
});

// Other MFE reads params
route.queryParams.subscribe(params => {
  const id = params['id'];
  const source = params['from'];
});
```

---

### Error Handling

**Global Error Handler**:
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  handleError(error: Error): void {
    console.error('Global error:', error);
    
    // Log to monitoring service
    this.monitoringService.logError(error);
    
    // Show user-friendly message
    this.messageService.error({
      summaryKey: 'ERRORS.UNEXPECTED',
      detailKey: 'ERRORS.PLEASE_TRY_AGAIN'
    });
    
    // For module loading errors, suggest refresh
    if (error.message.includes('ChunkLoadError')) {
      this.messageService.warn({
        summaryKey: 'ERRORS.MODULE_LOAD_FAILED',
        detailKey: 'ERRORS.PLEASE_REFRESH'
      });
    }
  }
}
```

---

## Cross-Cutting Concerns

### Multi-Tenancy Implementation

**How It Works Everywhere**:

1. **JWT Token Contains Tenant**:
```json
{
  "sub": "john.doe@company.com",
  "tenant": "ACME",
  "roles": ["USER", "ADMIN"]
}
```

2. **Backend Extracts Tenant** (every request):
```java
@ApplicationScoped
public class TenantFilter implements ContainerRequestFilter {
    
    @Inject
    JsonWebToken jwt;
    
    @Override
    public void filter(ContainerRequestContext context) {
        String tenant = jwt.getClaim("tenant");
        // Set in Hibernate context
        HibernateUtil.setTenantId(tenant);
    }
}
```

3. **Hibernate Filters Automatically**:
```java
// Developer writes:
em.createQuery("SELECT w FROM Workspace w WHERE w.name = :name")
  .setParameter("name", "sales")
  .getSingleResult();

// Hibernate executes:
// SELECT * FROM workspace 
// WHERE name = 'sales' 
// AND tenant_id = 'ACME'  ← Automatically added!
```

4. **Frontend Includes Tenant** (implicit):
```typescript
// Token automatically sent with every HTTP request via interceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next.handle(authReq);
  }
}
```

**Result**: Every database query, every API call is automatically tenant-filtered. Zero chance of data leakage between tenants.

---

### Audit Logging Pattern

**TraceableEntity Base Class**:
```java
@MappedSuperclass
public abstract class TraceableEntity {
    
    @Column(name = "CREATION_DATE")
    private LocalDateTime creationDate;
    
    @Column(name = "CREATION_USER")
    private String creationUser;
    
    @Column(name = "MODIFICATION_DATE")
    private LocalDateTime modificationDate;
    
    @Column(name = "MODIFICATION_USER")
    private String modificationUser;
}
```

**JPA Listener Auto-Populates**:
```java
@EntityListeners(AuditListener.class)
public class Workspace extends TraceableEntity {
    // Audit fields inherited, automatically populated
}

public class AuditListener {
    
    @PrePersist
    void onCreate(TraceableEntity entity) {
        entity.setCreationDate(LocalDateTime.now());
        entity.setCreationUser(getCurrentUser());
    }
    
    @PreUpdate
    void onUpdate(TraceableEntity entity) {
        entity.setModificationDate(LocalDateTime.now());
        entity.setModificationUser(getCurrentUser());
    }
}
```

**Result**: Every table has "who created when" and "who modified when" automatically tracked.

---

### Error Response Pattern

**Consistent Error Structure**:
```java
@Provider
public class ExceptionMapper implements ExceptionMapper<Exception> {
    
    @Override
    public Response toResponse(Exception exception) {
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(LocalDateTime.now());
        error.setMessage(exception.getMessage());
        error.setErrorCode(determineErrorCode(exception));
        error.setPath(request.getPath());
        
        // Log error
        log.error("Request failed", exception);
        
        return Response
            .status(determineStatus(exception))
            .entity(error)
            .build();
    }
}
```

**Frontend Handles Consistently**:
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message
        const message = error.error?.message || 'ERRORS.UNKNOWN';
        
        // Show to user
        this.messageService.error({
          summaryKey: `ERRORS.HTTP_${error.status}`,
          detail: message
        });
        
        // Rethrow for component handling
        return throwError(() => error);
      })
    );
  }
}
```

---

## Advanced Patterns

### Optimistic Locking (Preventing Concurrent Updates)

**Problem**: Two users edit same workspace simultaneously.

**Solution**: Version field with optimistic locking:

```java
@Entity
public class Workspace extends TraceableEntity {
    
    @Version  // JPA optimistic locking
    @Column(name = "OPERATOR_VERSION")
    private Integer operatorVersion;
}
```

**How It Works**:
```java
// User A fetches workspace (version = 5)
Workspace ws = dao.findById("123");  // version = 5

// User B fetches same workspace (version = 5)
Workspace ws2 = dao.findById("123");  // version = 5

// User A updates first
ws.setDisplayName("New Name");
dao.update(ws);  // Success! version becomes 6

// User B tries to update
ws2.setDescription("New Desc");
dao.update(ws2);  // FAILS! OptimisticLockException
// Because ws2 has version 5, but DB has version 6
```

**Frontend Handling**:
```typescript
updateWorkspace(workspace: Workspace): void {
  this.workspaceApi.updateWorkspace({ id: workspace.guid, workspace })
    .subscribe({
      next: () => this.messageService.success({ summaryKey: 'SAVED' }),
      error: (err) => {
        if (err.status === 409) { // Conflict
          this.messageService.warn({
            summaryKey: 'ERRORS.CONCURRENT_MODIFICATION',
            detail: 'Someone else modified this. Please refresh and try again.'
          });
        }
      }
    });
}
```

---

### Caching Strategy

**Backend Caching** (reduce DB load):
```java
@ApplicationScoped
public class ThemeService {
    
    @CacheResult(cacheName = "themes")  // Quarkus cache
    public Theme getTheme(String name) {
        return themeDAO.findByName(name);
    }
    
    @CacheInvalidate(cacheName = "themes")
    public void updateTheme(Theme theme) {
        themeDAO.update(theme);
        // Cache automatically cleared
    }
}
```

**Frontend Caching** (reduce API calls):
```typescript
@Injectable({ providedIn: 'root' })
export class CachedWorkspaceService {
  
  private cache = new Map<string, Workspace>();
  private cacheExpiry = new Map<string, number>();
  private TTL = 5 * 60 * 1000; // 5 minutes
  
  getWorkspace(id: string): Observable<Workspace> {
    const cached = this.cache.get(id);
    const expiry = this.cacheExpiry.get(id);
    
    if (cached && expiry && Date.now() < expiry) {
      return of(cached); // Return from cache
    }
    
    // Fetch from API
    return this.api.getWorkspace(id).pipe(
      tap(workspace => {
        this.cache.set(id, workspace);
        this.cacheExpiry.set(id, Date.now() + this.TTL);
      })
    );
  }
}
```

---

### Pagination Pattern

**Backend** (Criteria API with pagination):
```java
public PageResult<Workspace> searchWorkspaces(SearchCriteria criteria) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<Workspace> cq = cb.createQuery(Workspace.class);
    Root<Workspace> root = cq.from(Workspace.class);
    
    // Build predicates from criteria...
    
    // Execute query with pagination
    List<Workspace> results = em.createQuery(cq)
        .setFirstResult(criteria.getPageNumber() * criteria.getPageSize())
        .setMaxResults(criteria.getPageSize())
        .getResultList();
    
    // Count total
    CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
    countQuery.select(cb.count(countQuery.from(Workspace.class)));
    Long total = em.createQuery(countQuery).getSingleResult();
    
    return new PageResult<>(results, total, criteria.getPageNumber(), criteria.getPageSize());
}
```

**Frontend** (PrimeNG DataTable):
```typescript
loadData(event: LazyLoadEvent): void {
  const page = (event.first || 0) / (event.rows || 10);
  
  this.api.searchWorkspaces({
    pageNumber: page,
    pageSize: event.rows || 10,
    sortField: event.sortField,
    sortOrder: event.sortOrder
  }).subscribe(result => {
    this.workspaces = result.stream;
    this.totalRecords = result.totalElements;
  });
}
```

---

This completes the deep dive developer documentation covering all major architectural patterns and systems!


---

## OneCX Bookmark - Complete Deep Dive

### Overview
The Bookmark service allows users to save quick-access links to frequently visited pages, both internal OneCX pages and external URLs.

**GitHub**: `onecx-bookmark`  
**Components**: bookmark-svc, bookmark-bff, bookmark-ui  
**Database Tables**: 2 tables (BOOKMARK, BOOKMARK_FOLDER)  
**Key Features**: Personal bookmarks, folder organization, drag-drop reordering

---

### Database Schema

```sql
CREATE TABLE BOOKMARK_FOLDER (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    user_id VARCHAR(255) NOT NULL,  -- Owner of the folder
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER,  -- Position in list
    parent_folder_id VARCHAR(255),  -- For nested folders
    
    FOREIGN KEY (parent_folder_id) REFERENCES BOOKMARK_FOLDER(guid) ON DELETE CASCADE,
    INDEX folder_user_idx (user_id, tenant_id),
    CONSTRAINT folder_user_key UNIQUE (name, user_id, tenant_id)
);

CREATE TABLE BOOKMARK (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    user_id VARCHAR(255) NOT NULL,  -- Owner of the bookmark
    folder_id VARCHAR(255),
    
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2000) NOT NULL,
    description TEXT,
    display_order INTEGER,  -- Position within folder
    
    FOREIGN KEY (folder_id) REFERENCES BOOKMARK_FOLDER(guid) ON DELETE CASCADE,
    INDEX bookmark_user_idx (user_id, tenant_id),
    INDEX bookmark_folder_idx (folder_id)
);
```

**Key Design Decisions**:
- **User-scoped**: Each user has their own bookmarks (user_id + tenant_id)
- **Folder hierarchy**: Supports nested folders via parent_folder_id
- **Display order**: Manual ordering via display_order field
- **No sharing**: Current design is personal bookmarks only

---

### Key Patterns

#### 1. Loading User Bookmarks

```java
@ApplicationScoped
public class BookmarkService {
    
    public List<BookmarkFolder> getUserBookmarks(String userId) {
        // Load all folders with their bookmarks
        return em.createQuery(
            "SELECT f FROM BookmarkFolder f " +
            "LEFT JOIN FETCH f.bookmarks " +
            "WHERE f.userId = :userId " +
            "ORDER BY f.displayOrder", BookmarkFolder.class)
            .setParameter("userId", userId)
            .getResultList();
    }
}
```

**Entity Graph Optimization**:
```java
@Entity
@NamedEntityGraph(
    name = "BookmarkFolder.withBookmarks",
    attributeNodes = @NamedAttributeNode("bookmarks")
)
public class BookmarkFolder {
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL)
    @OrderBy("displayOrder ASC")
    private List<Bookmark> bookmarks;
}
```

**Result**: Single query loads all folders + bookmarks, avoiding N+1 problem.

---

#### 2. Creating Bookmark from Current Page

**Frontend captures context**:
```typescript
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  
  bookmarkCurrentPage(): void {
    const currentUrl = this.router.url;
    const currentTitle = document.title;
    
    // Show dialog
    this.dialogService.open(CreateBookmarkDialogComponent, {
      data: {
        name: currentTitle,
        url: currentUrl,
        folders: this.getUserFolders()
      }
    }).subscribe(result => {
      if (result) {
        this.createBookmark(result).subscribe();
      }
    });
  }
  
  private createBookmark(bookmark: Bookmark): Observable<Bookmark> {
    return this.bookmarkApi.createBookmark({ bookmark }).pipe(
      tap(() => this.loadBookmarks()), // Refresh list
      tap(() => this.messageService.success({ summaryKey: 'BOOKMARK.CREATED' }))
    );
  }
}
```

---

#### 3. Drag-and-Drop Reordering

**Challenge**: Update display_order efficiently when user drags bookmark to new position.

**Solution**: Recalculate order for affected items only:

```java
@POST
@Path("/reorder")
public Response reorderBookmarks(ReorderRequest request) {
    List<Bookmark> bookmarks = bookmarkDAO.findByIdIn(request.getBookmarkIds());
    
    // Update display_order based on new position
    for (int i = 0; i < bookmarks.size(); i++) {
        bookmarks.get(i).setDisplayOrder(request.getStartOrder() + i);
    }
    
    bookmarkDAO.update(bookmarks);
    return Response.ok().build();
}
```

**Frontend implementation**:
```typescript
// Using PrimeNG OrderList or custom drag-drop
onDrop(event: CdkDragDrop<Bookmark[]>): void {
  moveItemInArray(this.bookmarks, event.previousIndex, event.currentIndex);
  
  // Send update to backend
  const bookmarkIds = this.bookmarks.map(b => b.guid);
  this.bookmarkApi.reorderBookmarks({ bookmarkIds }).subscribe();
}
```

---

#### 4. Quick Access via Keyboard

**Shell integration**:
```typescript
@Injectable({ providedIn: 'root' })
export class QuickAccessService {
  
  private shortcuts = new Map<string, string>(); // Ctrl+1 -> bookmark URL
  
  registerBookmarkShortcuts(bookmarks: Bookmark[]): void {
    // Register first 9 bookmarks as Ctrl+1 through Ctrl+9
    bookmarks.slice(0, 9).forEach((bookmark, index) => {
      this.shortcuts.set(`Ctrl+${index + 1}`, bookmark.url);
    });
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      const key = `Ctrl+${event.key}`;
      const url = this.shortcuts.get(key);
      if (url) {
        this.router.navigateByUrl(url);
        event.preventDefault();
      }
    }
  }
}
```

---

### REST API Endpoints

```http
# Get all user bookmarks with folders
GET /v1/bookmarks
Response: {
  "folders": [
    {
      "guid": "folder-1",
      "name": "Daily Tasks",
      "bookmarks": [...]
    }
  ],
  "ungrouped": [...] // Bookmarks not in any folder
}

# Create bookmark
POST /v1/bookmarks
{
  "name": "User Dashboard",
  "url": "/user-profile/dashboard",
  "folderId": "folder-1"
}

# Create folder
POST /v1/folders
{
  "name": "Reports",
  "parentFolderId": null
}

# Reorder bookmarks
POST /v1/bookmarks/reorder
{
  "bookmarkIds": ["id1", "id2", "id3"],
  "startOrder": 0
}

# Move bookmark to different folder
PUT /v1/bookmarks/{id}/move
{
  "folderId": "new-folder-id"
}
```

---

## OneCX Help - Complete Deep Dive

### Overview
The Help service provides in-application documentation, contextual help, and user guides.

**GitHub**: `onecx-help`  
**Components**: help-svc, help-bff, help-ui  
**Database Tables**: 3 tables (HELP_ARTICLE, HELP_CATEGORY, HELP_ATTACHMENT)  
**Key Features**: Context-sensitive help, full-text search, rich content

---

### Database Schema

```sql
CREATE TABLE HELP_CATEGORY (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    parent_category_id VARCHAR(255),
    display_order INTEGER,
    
    FOREIGN KEY (parent_category_id) REFERENCES HELP_CATEGORY(guid) ON DELETE CASCADE,
    CONSTRAINT category_name_key UNIQUE (name, tenant_id)
);

CREATE TABLE HELP_ARTICLE (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    category_id VARCHAR(255),
    
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,  -- Rich HTML content
    summary VARCHAR(1000),
    
    -- Context mapping
    product_name VARCHAR(255),  -- Which product this helps with
    page_url VARCHAR(500),      -- Specific page this article relates to
    
    -- Metadata
    status VARCHAR(50) DEFAULT 'PUBLISHED',  -- DRAFT, PUBLISHED, ARCHIVED
    priority INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,  -- User feedback
    
    -- Search optimization
    search_vector TSVECTOR,  -- PostgreSQL full-text search
    
    FOREIGN KEY (category_id) REFERENCES HELP_CATEGORY(guid) ON DELETE SET NULL,
    INDEX article_search_idx USING GIN(search_vector),
    INDEX article_context_idx (product_name, page_url)
);

CREATE TABLE HELP_ATTACHMENT (
    guid VARCHAR(255) PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL,
    
    filename VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    storage_path VARCHAR(1000),  -- S3 path or file system
    
    FOREIGN KEY (article_id) REFERENCES HELP_ARTICLE(guid) ON DELETE CASCADE
);
```

---

### Key Patterns

#### 1. Context-Sensitive Help

**Problem**: Show relevant help based on what user is currently doing.

**Solution**: Context resolution service:

```java
@ApplicationScoped
public class HelpContextService {
    
    public List<HelpArticle> getContextualHelp(String pageUrl, String productName) {
        // Priority-based search:
        // 1. Exact page match
        // 2. Product match
        // 3. General articles
        
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<HelpArticle> cq = cb.createQuery(HelpArticle.class);
        Root<HelpArticle> root = cq.from(HelpArticle.class);
        
        // Build priority case statement
        Expression<Integer> priority = cb.selectCase()
            .when(cb.equal(root.get("pageUrl"), pageUrl), 3)  // Exact match
            .when(cb.equal(root.get("productName"), productName), 2)  // Product match
            .otherwise(1);  // General
        
        cq.where(
            cb.equal(root.get("status"), "PUBLISHED"),
            cb.or(
                cb.equal(root.get("pageUrl"), pageUrl),
                cb.equal(root.get("productName"), productName),
                cb.and(
                    cb.isNull(root.get("pageUrl")),
                    cb.isNull(root.get("productName"))
                )
            )
        );
        
        cq.orderBy(cb.desc(priority), cb.desc(root.get("priority")));
        
        return em.createQuery(cq).setMaxResults(5).getResultList();
    }
}
```

**Frontend integration**:
```typescript
@Component({
  selector: 'ocx-help-panel',
  template: `
    <div class="help-panel" *ngIf="articles$ | async as articles">
      <h3>Help for this page</h3>
      <div *ngFor="let article of articles" class="help-article">
        <h4>{{ article.title }}</h4>
        <p>{{ article.summary }}</p>
        <a [routerLink]="['/help', article.guid]">Read more</a>
      </div>
    </div>
  `
})
export class HelpPanelComponent implements OnInit {
  articles$: Observable<HelpArticle[]>;
  
  ngOnInit(): void {
    // Get current route and product
    const context = {
      pageUrl: this.router.url,
      productName: this.appState.currentProduct
    };
    
    this.articles$ = this.helpApi.getContextualHelp(context);
  }
}
```

---

#### 2. Full-Text Search

**PostgreSQL full-text search**:
```java
@Entity
public class HelpArticle extends TraceableEntity {
    
    @Column(name = "SEARCH_VECTOR", columnDefinition = "tsvector")
    private String searchVector;
    
    // Trigger to auto-update search vector
    @PostPersist
    @PostUpdate
    void updateSearchVector() {
        em.createNativeQuery(
            "UPDATE help_article " +
            "SET search_vector = " +
            "  setweight(to_tsvector('english', coalesce(title, '')), 'A') || " +
            "  setweight(to_tsvector('english', coalesce(summary, '')), 'B') || " +
            "  setweight(to_tsvector('english', coalesce(content, '')), 'C') " +
            "WHERE guid = :guid")
            .setParameter("guid", this.guid)
            .executeUpdate();
    }
}
```

**Search query**:
```java
public List<HelpArticle> searchArticles(String query) {
    return em.createNativeQuery(
        "SELECT * FROM help_article " +
        "WHERE status = 'PUBLISHED' " +
        "  AND search_vector @@ plainto_tsquery('english', :query) " +
        "ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC " +
        "LIMIT 20",
        HelpArticle.class)
        .setParameter("query", query)
        .getResultList();
}
```

**Result**: Fast, relevance-ranked search with stemming and stop-word filtering.

---

#### 3. User Feedback Tracking

```java
@POST
@Path("/{id}/feedback")
public Response recordFeedback(@PathParam("id") String articleId, FeedbackRequest request) {
    HelpArticle article = helpDAO.findById(articleId);
    
    if (request.isHelpful()) {
        article.setHelpfulCount(article.getHelpfulCount() + 1);
    }
    
    // Track in analytics
    analyticsService.trackEvent("help_article_feedback", Map.of(
        "articleId", articleId,
        "helpful", request.isHelpful(),
        "userId", getCurrentUserId()
    ));
    
    helpDAO.update(article);
    return Response.ok().build();
}
```

**Frontend widget**:
```typescript
<div class="help-feedback">
  <p>Was this article helpful?</p>
  <button (click)="submitFeedback(true)">👍 Yes</button>
  <button (click)="submitFeedback(false)">👎 No</button>
  <p *ngIf="feedbackSubmitted">Thank you for your feedback!</p>
</div>
```

---

#### 4. Rich Content Editor (Admin)

Help articles support rich HTML content with images, videos, code blocks:

**Content Structure**:
```html
<article class="help-content">
  <h2>How to Create a Workspace</h2>
  
  <div class="help-section">
    <h3>Step 1: Navigate to Admin Panel</h3>
    <p>Click the admin menu in the top right corner...</p>
    <img src="/help/attachments/admin-menu.png" alt="Admin Menu" />
  </div>
  
  <div class="help-section">
    <h3>Step 2: Fill Out the Form</h3>
    <p>Enter the following details:</p>
    <ul>
      <li><strong>Name</strong>: A unique identifier...</li>
      <li><strong>Display Name</strong>: User-friendly label...</li>
    </ul>
  </div>
  
  <div class="help-code">
    <pre><code class="language-json">
{
  "name": "sales-workspace",
  "displayName": "Sales Department"
}
    </code></pre>
  </div>
  
  <div class="help-video">
    <video controls src="/help/videos/create-workspace.mp4"></video>
  </div>
</article>
```

**Sanitization** (prevent XSS):
```java
@ApplicationScoped
public class ContentSanitizer {
    
    private static final Policy POLICY = new HtmlPolicyBuilder()
        .allowElements("h1", "h2", "h3", "p", "ul", "ol", "li", "strong", "em", "code", "pre", "img", "video", "a")
        .allowAttributes("src", "alt").onElements("img")
        .allowAttributes("src", "controls").onElements("video")
        .allowAttributes("href", "target").onElements("a")
        .allowAttributes("class").globally()
        .toFactory();
    
    public String sanitize(String html) {
        return POLICY.sanitize(html);
    }
}
```

---

## OneCX IAM - Complete Deep Dive

### Overview
Identity and Access Management service handling users, authentication, and Keycloak integration.

**GitHub**: `onecx-iam`  
**Components**: iam-svc, iam-bff, iam-ui, iam-kc-client-operator  
**Database Tables**: 4 tables (USER, USER_ROLE, ROLE_MAPPING, KEYCLOAK_CLIENT)  
**Key Features**: User management, role assignment, Keycloak sync, SSO integration

---

### Architecture Role

**IAM's Position in OneCX**:
```
┌─────────────────────────────────────────────┐
│  Keycloak (Identity Provider)              │
│  - Stores user credentials                  │
│  - Handles authentication                   │
│  - Issues JWT tokens                        │
└─────────────────────────────────────────────┘
              ↓ Sync ↓
┌─────────────────────────────────────────────┐
│  OneCX IAM Service                         │
│  - User profile management                  │
│  - Role assignment (OneCX-specific)        │
│  - Organization structure                   │
│  - Custom attributes                        │
└─────────────────────────────────────────────┘
              ↓ Provides ↓
┌─────────────────────────────────────────────┐
│  All OneCX Services                        │
│  - Query user profiles                      │
│  - Check role membership                    │
│  - Get organization info                    │
└─────────────────────────────────────────────┘
```

**Why Separate from Keycloak?**
- Keycloak handles authentication (who you are)
- OneCX IAM handles authorization (what you can do)
- IAM adds OneCX-specific data (department, job title, avatar)
- Enables custom workflows without modifying Keycloak

---

### Database Schema

```sql
CREATE TABLE IAM_USER (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    -- Identity
    keycloak_id VARCHAR(255) NOT NULL UNIQUE,  -- Link to Keycloak user
    username VARCHAR(255) NOT NULL,
    email VARCHAR(500),
    
    -- Profile
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url VARCHAR(1000),
    
    -- Organization
    organization VARCHAR(255),
    department VARCHAR(255),
    job_title VARCHAR(255),
    manager_id VARCHAR(255),  -- References another user
    
    -- Contact
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Preferences
    locale VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, DISABLED, LOCKED
    last_login_date TIMESTAMP,
    
    FOREIGN KEY (manager_id) REFERENCES IAM_USER(guid),
    INDEX user_keycloak_idx (keycloak_id),
    INDEX user_email_idx (email),
    CONSTRAINT user_username_key UNIQUE (username, tenant_id)
);

CREATE TABLE IAM_ROLE (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    role_type VARCHAR(50),  -- SYSTEM, WORKSPACE, CUSTOM
    
    CONSTRAINT role_name_key UNIQUE (name, tenant_id)
);

CREATE TABLE IAM_USER_ROLE (
    guid VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role_id VARCHAR(255) NOT NULL,
    workspace_id VARCHAR(255),  -- NULL = global role
    
    granted_by VARCHAR(255),
    granted_date TIMESTAMP,
    expires_date TIMESTAMP,  -- Optional expiration
    
    FOREIGN KEY (user_id) REFERENCES IAM_USER(guid) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES IAM_ROLE(guid) ON DELETE CASCADE,
    CONSTRAINT user_role_key UNIQUE (user_id, role_id, workspace_id)
);

CREATE TABLE KEYCLOAK_CLIENT (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(500),  -- Encrypted
    realm_name VARCHAR(255),
    
    -- Sync settings
    auto_sync BOOLEAN DEFAULT TRUE,
    last_sync_date TIMESTAMP,
    
    CONSTRAINT kc_client_key UNIQUE (client_id, tenant_id)
);
```

---

### Key Patterns

#### 1. Keycloak User Sync

**Challenge**: Keep OneCX user profiles in sync with Keycloak.

**Solution**: Event-driven sync using Keycloak webhooks:

```java
@ApplicationScoped
public class KeycloakSyncService {
    
    @Inject
    RestClient keycloakClient;
    
    @Inject
    UserDAO userDAO;
    
    /**
     * Full sync - run periodically or on-demand
     */
    public void syncAllUsers(String realmName) {
        List<KeycloakUser> kcUsers = keycloakClient.getUsers(realmName);
        
        for (KeycloakUser kcUser : kcUsers) {
            User existingUser = userDAO.findByKeycloakId(kcUser.getId());
            
            if (existingUser == null) {
                // Create new user
                User newUser = new User();
                newUser.setKeycloakId(kcUser.getId());
                mapKeycloakUser(kcUser, newUser);
                userDAO.create(newUser);
            } else {
                // Update existing user
                mapKeycloakUser(kcUser, existingUser);
                userDAO.update(existingUser);
            }
        }
    }
    
    /**
     * Event-driven sync - triggered by Keycloak webhook
     */
    @POST
    @Path("/webhook/user-event")
    public Response handleUserEvent(KeycloakEvent event) {
        switch (event.getType()) {
            case "USER_CREATED":
                createUserFromKeycloak(event.getUserId());
                break;
            case "USER_UPDATED":
                updateUserFromKeycloak(event.getUserId());
                break;
            case "USER_DELETED":
                deleteUserFromKeycloak(event.getUserId());
                break;
        }
        return Response.ok().build();
    }
    
    private void mapKeycloakUser(KeycloakUser kcUser, User user) {
        user.setUsername(kcUser.getUsername());
        user.setEmail(kcUser.getEmail());
        user.setFirstName(kcUser.getFirstName());
        user.setLastName(kcUser.getLastName());
        // Custom attributes from Keycloak
        user.setDepartment(kcUser.getAttribute("department"));
        user.setJobTitle(kcUser.getAttribute("jobTitle"));
    }
}
```

---

#### 2. User Search with Filters

```java
public PageResult<User> searchUsers(UserSearchCriteria criteria) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<User> cq = cb.createQuery(User.class);
    Root<User> root = cq.from(User.class);
    
    List<Predicate> predicates = new ArrayList<>();
    
    // Text search across multiple fields
    if (criteria.getSearchTerm() != null) {
        String pattern = "%" + criteria.getSearchTerm().toLowerCase() + "%";
        predicates.add(cb.or(
            cb.like(cb.lower(root.get("username")), pattern),
            cb.like(cb.lower(root.get("email")), pattern),
            cb.like(cb.lower(root.get("firstName")), pattern),
            cb.like(cb.lower(root.get("lastName")), pattern)
        ));
    }
    
    // Filter by department
    if (criteria.getDepartment() != null) {
        predicates.add(cb.equal(root.get("department"), criteria.getDepartment()));
    }
    
    // Filter by role
    if (criteria.getRoleName() != null) {
        Subquery<String> roleSubquery = cq.subquery(String.class);
        Root<UserRole> urRoot = roleSubquery.from(UserRole.class);
        roleSubquery.select(urRoot.get("user").get("guid"));
        roleSubquery.where(
            cb.equal(urRoot.get("role").get("name"), criteria.getRoleName())
        );
        predicates.add(cb.in(root.get("guid")).value(roleSubquery));
    }
    
    // Filter by status
    if (criteria.getStatus() != null) {
        predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
    }
    
    cq.where(predicates.toArray(new Predicate[0]));
    
    // Execute with pagination
    List<User> results = em.createQuery(cq)
        .setFirstResult(criteria.getPageNumber() * criteria.getPageSize())
        .setMaxResults(criteria.getPageSize())
        .getResultList();
    
    Long total = countUsers(predicates);
    
    return new PageResult<>(results, total, criteria.getPageNumber(), criteria.getPageSize());
}
```

---

#### 3. Role Assignment Workflow

```java
@POST
@Path("/users/{userId}/roles")
public Response assignRole(
    @PathParam("userId") String userId,
    RoleAssignmentRequest request
) {
    User user = userDAO.findById(userId);
    Role role = roleDAO.findById(request.getRoleId());
    
    // Check if assignment already exists
    UserRole existing = userRoleDAO.findByUserAndRole(userId, request.getRoleId(), request.getWorkspaceId());
    if (existing != null) {
        throw new ConflictException("User already has this role");
    }
    
    // Create assignment
    UserRole userRole = new UserRole();
    userRole.setUser(user);
    userRole.setRole(role);
    userRole.setWorkspaceId(request.getWorkspaceId());
    userRole.setGrantedBy(getCurrentUserId());
    userRole.setGrantedDate(LocalDateTime.now());
    userRole.setExpiresDate(request.getExpiresDate());
    
    userRoleDAO.create(userRole);
    
    // Invalidate permission cache for user
    permissionCacheService.invalidateUser(userId);
    
    // Send notification
    notificationService.sendRoleAssigned(user, role);
    
    return Response.status(Response.Status.CREATED).entity(userRole).build();
}
```

---

#### 4. Organization Hierarchy

**Get user's reporting chain**:
```java
public List<User> getReportingChain(String userId) {
    List<User> chain = new ArrayList<>();
    User current = userDAO.findById(userId);
    
    while (current != null && current.getManagerId() != null) {
        current = userDAO.findById(current.getManagerId());
        if (current != null) {
            chain.add(current);
        }
        
        // Prevent infinite loops
        if (chain.size() > 10) break;
    }
    
    return chain;
}
```

**Get user's direct reports**:
```java
public List<User> getDirectReports(String managerId) {
    return em.createQuery(
        "SELECT u FROM User u WHERE u.managerId = :managerId",
        User.class)
        .setParameter("managerId", managerId)
        .getResultList();
}
```

**Get entire org tree**:
```java
public OrgTree getOrganizationTree(String rootUserId) {
    User root = userDAO.findById(rootUserId);
    return buildTree(root);
}

private OrgTree buildTree(User user) {
    OrgTree node = new OrgTree(user);
    
    List<User> reports = getDirectReports(user.getGuid());
    for (User report : reports) {
        node.addChild(buildTree(report));  // Recursive
    }
    
    return node;
}
```

---

#### 5. Keycloak Client Operator

The operator automatically creates Keycloak clients for new tenants:

```yaml
apiVersion: onecx.tkit.org/v1
kind: KeycloakClient
metadata:
  name: acme-corp-client
spec:
  realm: onecx
  clientId: acme-corp
  tenantId: ACME
  redirectUris:
    - https://acme.onecx.example.com/*
  webOrigins:
    - https://acme.onecx.example.com
  publicClient: false
  directAccessGrantsEnabled: true
  standardFlowEnabled: true
```

**Operator reconciliation loop**:
```java
@ApplicationScoped
public class KeycloakClientOperator {
    
    public void reconcile(KeycloakClient resource) {
        // Check if client exists in Keycloak
        Optional<Client> existing = keycloakAdmin.getClient(
            resource.getSpec().getRealm(),
            resource.getSpec().getClientId()
        );
        
        if (existing.isEmpty()) {
            // Create new client
            Client client = new Client();
            client.setClientId(resource.getSpec().getClientId());
            client.setRedirectUris(resource.getSpec().getRedirectUris());
            client.setWebOrigins(resource.getSpec().getWebOrigins());
            
            String clientSecret = generateSecureSecret();
            client.setSecret(clientSecret);
            
            keycloakAdmin.createClient(resource.getSpec().getRealm(), client);
            
            // Store client secret in OneCX IAM
            storeClientCredentials(resource.getSpec().getClientId(), clientSecret);
        } else {
            // Update existing client
            updateClient(existing.get(), resource.getSpec());
        }
    }
}
```

---

## OneCX Search Config - Complete Deep Dive

### Overview
Configurable search functionality allowing users to save search criteria and customize search behavior.

**GitHub**: `onecx-search-config`  
**Components**: search-config-svc, search-config-bff, search-config-ui  
**Database Tables**: 2 tables (SEARCH_CONFIG, SEARCH_COLUMN)  
**Key Features**: Saved searches, custom columns, field-level visibility

---

### Database Schema

```sql
CREATE TABLE SEARCH_CONFIG (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    user_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,  -- Which product this search is for
    page VARCHAR(255) NOT NULL,          -- Which page (e.g., "user-list")
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,    -- User's default search
    is_advanced BOOLEAN DEFAULT FALSE,   -- Simple vs advanced mode
    
    -- Search criteria (stored as JSON)
    criteria JSONB NOT NULL,
    
    -- Display settings
    page_size INTEGER DEFAULT 20,
    sort_field VARCHAR(255),
    sort_order VARCHAR(10),  -- ASC, DESC
    
    CONSTRAINT search_config_key UNIQUE (user_id, product_name, page, name, tenant_id)
);

CREATE TABLE SEARCH_COLUMN (
    guid VARCHAR(255) PRIMARY KEY,
    search_config_id VARCHAR(255) NOT NULL,
    
    field_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER,
    width INTEGER,  -- Column width in pixels
    
    FOREIGN KEY (search_config_id) REFERENCES SEARCH_CONFIG(guid) ON DELETE CASCADE
);
```

**Example criteria JSON**:
```json
{
  "filters": [
    {
      "field": "status",
      "operator": "EQUALS",
      "value": "ACTIVE"
    },
    {
      "field": "creationDate",
      "operator": "GREATER_THAN",
      "value": "2026-01-01"
    },
    {
      "field": "department",
      "operator": "IN",
      "value": ["Sales", "Marketing"]
    }
  ],
  "advancedMode": {
    "logicalOperator": "AND",
    "groups": [
      {
        "operator": "OR",
        "filters": [...]
      }
    ]
  }
}
```

---

### Key Patterns

#### 1. Loading User's Searches

```java
public List<SearchConfig> getUserSearches(String userId, String productName, String page) {
    return em.createQuery(
        "SELECT s FROM SearchConfig s " +
        "LEFT JOIN FETCH s.columns " +
        "WHERE s.userId = :userId " +
        "  AND s.productName = :productName " +
        "  AND s.page = :page " +
        "ORDER BY s.isDefault DESC, s.name ASC",
        SearchConfig.class)
        .setParameter("userId", userId)
        .setParameter("productName", productName)
        .setParameter("page", page)
        .getResultList();
}
```

---

#### 2. Executing Search with Criteria

```java
@ApplicationScoped
public class DynamicSearchService {
    
    public <T> PageResult<T> executeSearch(SearchConfig config, Class<T> entityClass) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<T> cq = cb.createQuery(entityClass);
        Root<T> root = cq.from(entityClass);
        
        // Parse criteria JSON
        SearchCriteria criteria = objectMapper.readValue(
            config.getCriteria().toString(),
            SearchCriteria.class
        );
        
        // Build predicates from criteria
        List<Predicate> predicates = new ArrayList<>();
        for (FilterCriterion filter : criteria.getFilters()) {
            predicates.add(buildPredicate(cb, root, filter));
        }
        
        cq.where(predicates.toArray(new Predicate[0]));
        
        // Apply sorting
        if (config.getSortField() != null) {
            if ("DESC".equals(config.getSortOrder())) {
                cq.orderBy(cb.desc(root.get(config.getSortField())));
            } else {
                cq.orderBy(cb.asc(root.get(config.getSortField())));
            }
        }
        
        // Execute with pagination
        List<T> results = em.createQuery(cq)
            .setFirstResult(0)
            .setMaxResults(config.getPageSize())
            .getResultList();
        
        return new PageResult<>(results, countResults(criteria, entityClass), 0, config.getPageSize());
    }
    
    private Predicate buildPredicate(CriteriaBuilder cb, Root<?> root, FilterCriterion filter) {
        Path<?> field = root.get(filter.getField());
        
        switch (filter.getOperator()) {
            case EQUALS:
                return cb.equal(field, filter.getValue());
            case NOT_EQUALS:
                return cb.notEqual(field, filter.getValue());
            case GREATER_THAN:
                return cb.greaterThan((Path<Comparable>) field, (Comparable) filter.getValue());
            case LESS_THAN:
                return cb.lessThan((Path<Comparable>) field, (Comparable) filter.getValue());
            case LIKE:
                return cb.like(cb.lower((Path<String>) field), "%" + filter.getValue().toString().toLowerCase() + "%");
            case IN:
                return field.in((Collection<?>) filter.getValue());
            default:
                throw new IllegalArgumentException("Unsupported operator: " + filter.getOperator());
        }
    }
}
```

---

#### 3. Column Configuration

**Frontend manages column visibility**:
```typescript
@Component({
  selector: 'app-column-config',
  template: `
    <p-table [value]="columns" [reorderableColumns]="true">
      <ng-template pTemplate="header">
        <tr>
          <th>Field</th>
          <th>Visible</th>
          <th>Width</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-column>
        <tr [pReorderableRow]="column">
          <td>{{ column.displayName }}</td>
          <td>
            <p-checkbox [(ngModel)]="column.visible"></p-checkbox>
          </td>
          <td>
            <input type="number" [(ngModel)]="column.width" />
          </td>
          <td>
            <button (click)="moveUp(column)">↑</button>
            <button (click)="moveDown(column)">↓</button>
          </td>
        </tr>
      </ng-template>
    </p-table>
    <button (click)="saveConfiguration()">Save</button>
  `
})
export class ColumnConfigComponent {
  columns: SearchColumn[];
  
  saveConfiguration(): void {
    // Update display_order based on current array order
    this.columns.forEach((col, index) => {
      col.displayOrder = index;
    });
    
    this.searchConfigApi.updateColumns({ columns: this.columns }).subscribe();
  }
}
```

---

#### 4. Quick Search vs Advanced Search

**Quick Search** (simple text input):
```typescript
quickSearch(searchTerm: string): void {
  const criteria = {
    filters: [
      {
        field: '_all',  // Special: search across all text fields
        operator: 'LIKE',
        value: searchTerm
      }
    ]
  };
  
  this.executeSearch(criteria);
}
```

**Advanced Search** (form builder):
```typescript
@Component({
  template: `
    <form [formGroup]="searchForm">
      <div formArrayName="filters">
        <div *ngFor="let filter of filtersArray.controls; let i = index" [formGroupName]="i">
          <select formControlName="field">
            <option value="status">Status</option>
            <option value="creationDate">Creation Date</option>
            <option value="department">Department</option>
          </select>
          
          <select formControlName="operator">
            <option value="EQUALS">Equals</option>
            <option value="CONTAINS">Contains</option>
            <option value="GREATER_THAN">Greater Than</option>
          </select>
          
          <input formControlName="value" />
          
          <button (click)="removeFilter(i)">Remove</button>
        </div>
      </div>
      
      <button (click)="addFilter()">Add Filter</button>
      <button (click)="search()">Search</button>
      <button (click)="saveSearch()">Save Search</button>
    </form>
  `
})
export class AdvancedSearchComponent {
  searchForm: FormGroup;
  
  get filtersArray(): FormArray {
    return this.searchForm.get('filters') as FormArray;
  }
  
  addFilter(): void {
    this.filtersArray.push(this.fb.group({
      field: [''],
      operator: ['EQUALS'],
      value: ['']
    }));
  }
  
  search(): void {
    const criteria = this.searchForm.value;
    this.executeSearch(criteria);
  }
  
  saveSearch(): void {
    const name = prompt('Enter search name:');
    if (name) {
      this.searchConfigApi.createSearchConfig({
        name,
        criteria: this.searchForm.value,
        productName: this.currentProduct,
        page: this.currentPage
      }).subscribe();
    }
  }
}
```

---

## OneCX Data Orchestrator - Complete Deep Dive

### Overview
Data synchronization and orchestration service for ETL (Extract, Transform, Load) operations between OneCX and external systems.

**GitHub**: `onecx-data-orchestrator`  
**Components**: data-orchestrator-svc, data-orchestrator-bff, data-orchestrator-ui, data-orchestrator-operator  
**Database Tables**: 4 tables (DATA_SOURCE, SYNC_JOB, SYNC_EXECUTION, DATA_MAPPING)  
**Key Features**: Scheduled sync, incremental updates, conflict resolution, audit trail

---

### Database Schema

```sql
CREATE TABLE DATA_SOURCE (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- REST_API, DATABASE, FILE, KAFKA
    
    -- Connection details (encrypted)
    connection_url VARCHAR(1000),
    auth_type VARCHAR(50),      -- NONE, BASIC, OAUTH2, API_KEY
    credentials JSONB,          -- Encrypted credentials
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_connection_test TIMESTAMP,
    last_test_result VARCHAR(50),
    
    CONSTRAINT ds_name_key UNIQUE (name, tenant_id)
);

CREATE TABLE SYNC_JOB (
    guid VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    source_id VARCHAR(255) NOT NULL,
    target_entity VARCHAR(255) NOT NULL,  -- Which OneCX entity to sync to
    
    -- Scheduling
    schedule_type VARCHAR(50),  -- MANUAL, CRON, EVENT_DRIVEN
    cron_expression VARCHAR(100),
    
    -- Sync settings
    sync_type VARCHAR(50) DEFAULT 'FULL',  -- FULL, INCREMENTAL, DELTA
    conflict_resolution VARCHAR(50) DEFAULT 'SOURCE_WINS',  -- SOURCE_WINS, TARGET_WINS, MANUAL
    
    -- Mapping
    field_mapping JSONB,
    transformation_rules JSONB,
    
    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    last_execution_date TIMESTAMP,
    last_execution_status VARCHAR(50),
    
    FOREIGN KEY (source_id) REFERENCES DATA_SOURCE(guid) ON DELETE CASCADE
);

CREATE TABLE SYNC_EXECUTION (
    guid VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL,
    
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'RUNNING',  -- RUNNING, COMPLETED, FAILED, PARTIAL
    
    -- Statistics
    records_read INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    
    FOREIGN KEY (job_id) REFERENCES SYNC_JOB(guid) ON DELETE CASCADE,
    INDEX exec_job_idx (job_id, start_time DESC)
);

CREATE TABLE DATA_MAPPING (
    guid VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL,
    
    source_field VARCHAR(255) NOT NULL,
    target_field VARCHAR(255) NOT NULL,
    
    -- Transformation
    transformation_type VARCHAR(50),  -- DIRECT, LOOKUP, EXPRESSION, CUSTOM
    transformation_config JSONB,
    
    -- Validation
    required BOOLEAN DEFAULT FALSE,
    validation_rule VARCHAR(500),
    
    FOREIGN KEY (job_id) REFERENCES SYNC_JOB(guid) ON DELETE CASCADE
);
```

---

### Key Patterns

#### 1. Scheduled Job Execution

```java
@ApplicationScoped
public class SyncJobScheduler {
    
    @Inject
    SyncJobDAO jobDAO;
    
    @Inject
    SyncExecutor syncExecutor;
    
    // Check for jobs every minute
    @Scheduled(every = "60s")
    void checkScheduledJobs() {
        List<SyncJob> jobs = jobDAO.findEnabledJobs();
        
        for (SyncJob job : jobs) {
            if (shouldExecute(job)) {
                CompletableFuture.runAsync(() -> syncExecutor.execute(job));
            }
        }
    }
    
    private boolean shouldExecute(SyncJob job) {
        if (!job.isEnabled()) return false;
        
        switch (job.getScheduleType()) {
            case MANUAL:
                return false;  // Manual jobs not auto-executed
            
            case CRON:
                CronExpression cron = new CronExpression(job.getCronExpression());
                LocalDateTime next = cron.getNextValidTimeAfter(job.getLastExecutionDate());
                return LocalDateTime.now().isAfter(next);
            
            case EVENT_DRIVEN:
                // Check event queue for triggers
                return hasWaitingEvents(job);
            
            default:
                return false;
        }
    }
}
```

---

#### 2. Data Extraction

```java
@ApplicationScoped
public class DataExtractor {
    
    public List<Map<String, Object>> extract(DataSource source, SyncJob job) {
        switch (source.getType()) {
            case REST_API:
                return extractFromRestApi(source, job);
            case DATABASE:
                return extractFromDatabase(source, job);
            case FILE:
                return extractFromFile(source, job);
            case KAFKA:
                return extractFromKafka(source, job);
            default:
                throw new UnsupportedOperationException("Unknown source type: " + source.getType());
        }
    }
    
    private List<Map<String, Object>> extractFromRestApi(DataSource source, SyncJob job) {
        RestClient client = createRestClient(source);
        
        // Handle pagination
        List<Map<String, Object>> allData = new ArrayList<>();
        int page = 0;
        boolean hasMore = true;
        
        while (hasMore) {
            Response response = client.get(source.getConnectionUrl() + "?page=" + page);
            
            if (response.getStatus() == 200) {
                PaginatedResponse data = response.readEntity(PaginatedResponse.class);
                allData.addAll(data.getContent());
                hasMore = data.hasNext();
                page++;
            } else {
                throw new RuntimeException("API request failed: " + response.getStatus());
            }
        }
        
        return allData;
    }
    
    private List<Map<String, Object>> extractFromDatabase(DataSource source, SyncJob job) {
        // Connect to external database
        try (Connection conn = DriverManager.getConnection(
            source.getConnectionUrl(),
            source.getCredentials().get("username").asText(),
            source.getCredentials().get("password").asText()
        )) {
            String query = job.getTransformationRules().get("sourceQuery").asText();
            
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                
                List<Map<String, Object>> results = new ArrayList<>();
                ResultSetMetaData meta = rs.getMetaData();
                
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    for (int i = 1; i <= meta.getColumnCount(); i++) {
                        row.put(meta.getColumnName(i), rs.getObject(i));
                    }
                    results.add(row);
                }
                
                return results;
            }
        }
    }
}
```

---

#### 3. Data Transformation

```java
@ApplicationScoped
public class DataTransformer {
    
    public Map<String, Object> transform(
        Map<String, Object> sourceData,
        List<DataMapping> mappings,
        SyncJob job
    ) {
        Map<String, Object> targetData = new HashMap<>();
        
        for (DataMapping mapping : mappings) {
            Object sourceValue = sourceData.get(mapping.getSourceField());
            Object transformedValue = applyTransformation(sourceValue, mapping);
            
            // Validate
            if (mapping.isRequired() && transformedValue == null) {
                throw new ValidationException("Required field missing: " + mapping.getTargetField());
            }
            
            if (mapping.getValidationRule() != null) {
                validate(transformedValue, mapping.getValidationRule());
            }
            
            targetData.put(mapping.getTargetField(), transformedValue);
        }
        
        return targetData;
    }
    
    private Object applyTransformation(Object value, DataMapping mapping) {
        switch (mapping.getTransformationType()) {
            case DIRECT:
                return value;  // No transformation
            
            case LOOKUP:
                // Lookup value from reference table
                String lookupTable = mapping.getTransformationConfig().get("table").asText();
                return lookupValue(lookupTable, value);
            
            case EXPRESSION:
                // Evaluate expression (e.g., "price * 1.2" for 20% markup)
                String expression = mapping.getTransformationConfig().get("expression").asText();
                return evaluateExpression(expression, value);
            
            case CUSTOM:
                // Call custom transformer class
                String className = mapping.getTransformationConfig().get("class").asText();
                return invokeCustomTransformer(className, value);
            
            default:
                return value;
        }
    }
}
```

---

#### 4. Data Loading with Conflict Resolution

```java
@ApplicationScoped
public class DataLoader {
    
    @Inject
    EntityManager em;
    
    public LoadResult load(
        List<Map<String, Object>> transformedData,
        SyncJob job,
        SyncExecution execution
    ) {
        LoadResult result = new LoadResult();
        
        for (Map<String, Object> data : transformedData) {
            try {
                loadRecord(data, job, result);
            } catch (Exception e) {
                result.incrementFailed();
                logError(execution, data, e);
            }
        }
        
        return result;
    }
    
    private void loadRecord(Map<String, Object> data, SyncJob job, LoadResult result) {
        // Determine target entity class
        Class<?> entityClass = Class.forName(job.getTargetEntity());
        
        // Check if record exists (based on external ID)
        String externalId = (String) data.get("externalId");
        Object existingEntity = findByExternalId(entityClass, externalId);
        
        if (existingEntity == null) {
            // Create new record
            Object newEntity = createEntity(entityClass, data);
            em.persist(newEntity);
            result.incrementCreated();
        } else {
            // Update existing record (with conflict resolution)
            if (shouldUpdate(existingEntity, data, job)) {
                updateEntity(existingEntity, data);
                em.merge(existingEntity);
                result.incrementUpdated();
            } else {
                result.incrementSkipped();
            }
        }
    }
    
    private boolean shouldUpdate(Object existing, Map<String, Object> newData, SyncJob job) {
        switch (job.getConflictResolution()) {
            case SOURCE_WINS:
                return true;  // Always update from source
            
            case TARGET_WINS:
                return false;  // Never overwrite existing data
            
            case NEWEST_WINS:
                LocalDateTime existingModDate = getModificationDate(existing);
                LocalDateTime sourceModDate = (LocalDateTime) newData.get("modificationDate");
                return sourceModDate.isAfter(existingModDate);
            
            case MANUAL:
                // Create conflict record for manual resolution
                createConflictRecord(existing, newData);
                return false;
            
            default:
                return true;
        }
    }
}
```

---

#### 5. Incremental Sync Strategy

```java
@ApplicationScoped
public class IncrementalSyncService {
    
    public void performIncrementalSync(SyncJob job) {
        // Get last successful sync time
        Optional<SyncExecution> lastSuccess = executionDAO.findLastSuccessful(job.getGuid());
        LocalDateTime lastSyncTime = lastSuccess
            .map(SyncExecution::getStartTime)
            .orElse(LocalDateTime.MIN);
        
        // Extract only changed records
        Map<String, Object> filters = Map.of(
            "modificationDate", Map.of(
                "operator", "GREATER_THAN",
                "value", lastSyncTime
            )
        );
        
        List<Map<String, Object>> changedRecords = dataExtractor.extract(
            job.getSource(),
            job,
            filters
        );
        
        // Transform and load
        for (Map<String, Object> record : changedRecords) {
            Map<String, Object> transformed = dataTransformer.transform(record, job.getMappings(), job);
            dataLoader.load(List.of(transformed), job);
        }
    }
}
```

---

#### 6. Sync Monitoring Dashboard

**REST API for execution history**:
```http
GET /v1/sync-jobs/{jobId}/executions?limit=10

Response: {
  "executions": [
    {
      "guid": "exec-1",
      "startTime": "2026-02-19T10:00:00Z",
      "endTime": "2026-02-19T10:05:23Z",
      "status": "COMPLETED",
      "statistics": {
        "recordsRead": 1500,
        "recordsCreated": 150,
        "recordsUpdated": 1200,
        "recordsSkipped": 100,
        "recordsFailed": 50
      }
    }
  ]
}
```

**Frontend dashboard**:
```typescript
@Component({
  template: `
    <p-chart type="line" [data]="chartData"></p-chart>
    
    <p-table [value]="executions">
      <ng-template pTemplate="body" let-exec>
        <tr>
          <td>{{ exec.startTime | date:'short' }}</td>
          <td>
            <span [class]="'status-' + exec.status">
              {{ exec.status }}
            </span>
          </td>
          <td>{{ exec.statistics.recordsRead }}</td>
          <td>{{ exec.statistics.recordsCreated }}</td>
          <td>{{ exec.statistics.recordsUpdated }}</td>
          <td>{{ exec.statistics.recordsFailed }}</td>
          <td>
            <button (click)="viewDetails(exec)">Details</button>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class SyncMonitoringComponent {
  executions: SyncExecution[];
  chartData: any;
  
  ngOnInit(): void {
    this.loadExecutions();
    this.buildChart();
  }
  
  buildChart(): void {
    this.chartData = {
      labels: this.executions.map(e => new Date(e.startTime)),
      datasets: [
        {
          label: 'Records Synced',
          data: this.executions.map(e => e.statistics.recordsCreated + e.statistics.recordsUpdated)
        },
        {
          label: 'Errors',
          data: this.executions.map(e => e.statistics.recordsFailed)
        }
      ]
    };
  }
}
```

---

This completes deep dives for Bookmark, Help, IAM, Search Config, and Data Orchestrator services! Each section includes database schemas, key implementation patterns, and important code snippets focusing on architecture rather than full file dumps.


---

## CI/CD Pipelines & Build System

### Overview
OneCX uses GitHub Actions for CI/CD with reusable workflows across all repositories.

**Repository Structure**:
- `ci-angular/` - Angular app build workflows
- `ci-java-lib/` - Java library build workflows
- `ci-quarkus/` - Quarkus service build workflows  
- `ci-npm/` - NPM package workflows
- `ci-product/` - Product deployment workflows
- `ci-common/` - Shared actions and scripts

---

### GitHub Actions Workflow Structure

**Standard Quarkus Service Pipeline**:
```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
      
      - name: Build with Maven
        run: mvn clean verify -B
      
      - name: Run tests
        run: mvn test -B
      
      - name: SonarCloud analysis
        uses: sonarsource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: Build Docker image
        run: |
          docker build -f src/main/docker/Dockerfile.jvm \
            -t onecx-workspace-svc:${{ github.sha }} .
      
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USER }} --password-stdin
          docker push onecx-workspace-svc:${{ github.sha }}

  deploy-dev:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to DEV environment
        uses: ./.github/actions/deploy-helm
        with:
          environment: dev
          image-tag: ${{ github.sha }}
          values-file: helm/values-dev.yaml

  deploy-prod:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to PROD environment
        uses: ./.github/actions/deploy-helm
        with:
          environment: prod
          image-tag: ${{ github.sha }}
          values-file: helm/values-prod.yaml
```

**Angular Build Pipeline**:
```yaml
name: Build Angular UI

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test:ci
      
      - name: Build
        run: npm run build:prod
      
      - name: Build Docker image
        run: docker build -t onecx-workspace-ui:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag onecx-workspace-ui:${{ github.sha }} registry.example.com/onecx-workspace-ui:latest
          docker push registry.example.com/onecx-workspace-ui:latest
```

---

### Reusable Workflow Pattern

**Calling a reusable workflow**:
```yaml
name: Build Service

on: [push]

jobs:
  build:
    uses: onecx/ci-quarkus/.github/workflows/build-quarkus.yml@main
    with:
      java-version: '17'
      sonar-enabled: true
      docker-registry: 'ghcr.io/onecx'
    secrets:
      sonar-token: ${{ secrets.SONAR_TOKEN }}
      registry-password: ${{ secrets.GITHUB_TOKEN }}
```

**Reusable workflow definition** (`ci-quarkus/.github/workflows/build-quarkus.yml`):
```yaml
name: Build Quarkus Service

on:
  workflow_call:
    inputs:
      java-version:
        required: false
        type: string
        default: '17'
      sonar-enabled:
        required: false
        type: boolean
        default: true
      docker-registry:
        required: true
        type: string
    secrets:
      sonar-token:
        required: false
      registry-password:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: ${{ inputs.java-version }}
      
      # Shared build steps...
```

---

### Docker Image Strategy

**Multi-Stage Dockerfile (Quarkus JVM)**:
```dockerfile
# Stage 1: Build
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM registry.access.redhat.com/ubi8/openjdk-17:1.15

ENV LANGUAGE='en_US:en'

# Configure JVM
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

COPY --from=build /app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=build /app/target/quarkus-app/*.jar /deployments/
COPY --from=build /app/target/quarkus-app/app/ /deployments/app/
COPY --from=build /app/target/quarkus-app/quarkus/ /deployments/quarkus/

EXPOSE 8080
USER 185

ENTRYPOINT [ "java", "-jar", "/deployments/quarkus-run.jar" ]
```

**Dockerfile (Angular SPA)**:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Stage 2: Serve with Nginx
FROM docker-spa-base:latest

# Copy built app
COPY --from=build /app/dist/onecx-workspace-ui /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

**Base SPA Image** (`docker-spa-base`):
```dockerfile
FROM nginx:1.24-alpine

# Install envsubst for runtime environment variable replacement
RUN apk add --no-cache gettext

# Copy helper script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Default nginx config that supports Angular routing
COPY default.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

**Runtime environment variable replacement**:
```bash
#!/bin/sh
# docker-entrypoint.sh

# Replace environment variables in JavaScript files
find /usr/share/nginx/html -name '*.js' -exec sed -i \
  -e "s|__API_BASE_URL__|${API_BASE_URL}|g" \
  -e "s|__KEYCLOAK_URL__|${KEYCLOAK_URL}|g" \
  -e "s|__KEYCLOAK_REALM__|${KEYCLOAK_REALM}|g" \
  {} \;

# Start nginx
exec "$@"
```

---

### Helm Charts Structure

**Chart Directory Structure**:
```
helm-quarkus-app/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-prod.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── hpa.yaml
    └── servicemonitor.yaml
```

**Chart.yaml**:
```yaml
apiVersion: v2
name: onecx-workspace-svc
description: OneCX Workspace Service
type: application
version: 1.0.0
appVersion: "2.5.0"
keywords:
  - onecx
  - workspace
  - quarkus
maintainers:
  - name: OneCX Team
    email: team@onecx.example.com
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```

**values.yaml** (default values):
```yaml
replicaCount: 1

image:
  repository: onecx-workspace-svc
  pullPolicy: IfNotPresent
  tag: "latest"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

service:
  type: ClusterIP
  port: 8080
  targetPort: 8080

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: workspace.onecx.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: workspace-tls
      hosts:
        - workspace.onecx.example.com

resources:
  limits:
    cpu: 1000m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

env:
  - name: QUARKUS_DATASOURCE_USERNAME
    valueFrom:
      secretKeyRef:
        name: postgres-credentials
        key: username
  - name: QUARKUS_DATASOURCE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: postgres-credentials
        key: password
  - name: QUARKUS_DATASOURCE_JDBC_URL
    value: "jdbc:postgresql://postgres:5432/onecx_workspace"
  - name: QUARKUS_OIDC_AUTH_SERVER_URL
    value: "https://keycloak.onecx.example.com/realms/onecx"

livenessProbe:
  httpGet:
    path: /q/health/live
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /q/health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

postgresql:
  enabled: true
  auth:
    username: workspace
    password: changeme
    database: onecx_workspace
  primary:
    persistence:
      enabled: true
      size: 10Gi
```

**deployment.yaml** template:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "onecx-workspace-svc.fullname" . }}
  labels:
    {{- include "onecx-workspace-svc.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "onecx-workspace-svc.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
      labels:
        {{- include "onecx-workspace-svc.selectorLabels" . | nindent 8 }}
    spec:
      serviceAccountName: {{ include "onecx-workspace-svc.serviceAccountName" . }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          env:
            {{- toYaml .Values.env | nindent 12 }}
          livenessProbe:
            {{- toYaml .Values.livenessProbe | nindent 12 }}
          readinessProbe:
            {{- toYaml .Values.readinessProbe | nindent 12 }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

---

### Kubernetes Operators

**Operator Pattern Overview**:
OneCX uses operators to automate platform management tasks:
- **Permission Operator**: Syncs permissions from CRDs to database
- **Product Store Operator**: Registers products from Helm releases
- **Parameter Operator**: Manages configuration from ConfigMaps
- **IAM KC Client Operator**: Creates Keycloak clients
- **Data Orchestrator Operator**: Manages sync jobs

**Permission Operator CRD**:
```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: permissions.onecx.tkit.org
spec:
  group: onecx.tkit.org
  names:
    kind: Permission
    plural: permissions
    singular: permission
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              required:
                - appId
                - productName
                - permissions
              properties:
                appId:
                  type: string
                productName:
                  type: string
                permissions:
                  type: array
                  items:
                    type: object
                    required:
                      - resource
                      - action
                    properties:
                      resource:
                        type: string
                      action:
                        type: string
                      description:
                        type: string
                      mandatory:
                        type: boolean
```

**Using the Permission CRD**:
```yaml
apiVersion: onecx.tkit.org/v1
kind: Permission
metadata:
  name: workspace-permissions
  namespace: onecx-dev
spec:
  appId: workspace-svc
  productName: onecx-workspace
  permissions:
    - resource: WORKSPACE
      action: READ
      description: View workspaces
      mandatory: false
    - resource: WORKSPACE
      action: CREATE
      description: Create new workspaces
      mandatory: false
    - resource: WORKSPACE
      action: UPDATE
      description: Modify workspaces
      mandatory: false
    - resource: WORKSPACE
      action: DELETE
      description: Delete workspaces
      mandatory: false
```

**Operator Reconciliation Logic**:
```java
@ApplicationScoped
public class PermissionReconciler implements Reconciler<Permission> {
    
    @Inject
    PermissionService permissionService;
    
    @Override
    public UpdateControl<Permission> reconcile(Permission resource, Context context) {
        String appId = resource.getSpec().getAppId();
        String productName = resource.getSpec().getProductName();
        
        // Get existing permissions from database
        List<PermissionEntity> existing = permissionService.findByApp(appId, productName);
        
        // Get desired permissions from CRD
        List<PermissionSpec> desired = resource.getSpec().getPermissions();
        
        // Sync: create new, update existing, delete removed
        for (PermissionSpec spec : desired) {
            Optional<PermissionEntity> match = existing.stream()
                .filter(e -> e.getResource().equals(spec.getResource()) &&
                            e.getAction().equals(spec.getAction()))
                .findFirst();
            
            if (match.isEmpty()) {
                // Create new permission
                permissionService.create(appId, productName, spec);
            } else {
                // Update existing
                permissionService.update(match.get().getGuid(), spec);
            }
        }
        
        // Delete permissions not in desired state
        for (PermissionEntity entity : existing) {
            boolean stillNeeded = desired.stream()
                .anyMatch(s -> s.getResource().equals(entity.getResource()) &&
                              s.getAction().equals(entity.getAction()));
            
            if (!stillNeeded) {
                permissionService.delete(entity.getGuid());
            }
        }
        
        // Update status
        resource.setStatus(new PermissionStatus(
            "Synced",
            desired.size() + " permissions registered",
            LocalDateTime.now()
        ));
        
        return UpdateControl.updateStatus(resource);
    }
}
```

---

### Deployment Strategies

**Blue-Green Deployment**:
```yaml
# Blue deployment (current)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workspace-svc-blue
  labels:
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: workspace-svc
      version: blue
  template:
    metadata:
      labels:
        app: workspace-svc
        version: blue
    spec:
      containers:
        - name: workspace-svc
          image: onecx-workspace-svc:v2.4.0

---
# Green deployment (new)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workspace-svc-green
  labels:
    version: green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: workspace-svc
      version: green
  template:
    metadata:
      labels:
        app: workspace-svc
        version: green
    spec:
      containers:
        - name: workspace-svc
          image: onecx-workspace-svc:v2.5.0

---
# Service switches between blue and green
apiVersion: v1
kind: Service
metadata:
  name: workspace-svc
spec:
  selector:
    app: workspace-svc
    version: blue  # Change to 'green' when ready
  ports:
    - port: 8080
```

**Canary Deployment with Traffic Split**:
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: workspace-svc
spec:
  hosts:
    - workspace-svc
  http:
    - match:
        - headers:
            canary:
              exact: "true"
      route:
        - destination:
            host: workspace-svc
            subset: v2
          weight: 100
    - route:
        - destination:
            host: workspace-svc
            subset: v1
          weight: 90
        - destination:
            host: workspace-svc
            subset: v2
          weight: 10  # 10% traffic to new version

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: workspace-svc
spec:
  host: workspace-svc
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

---

### Monitoring & Observability

**Prometheus ServiceMonitor**:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: workspace-svc
  labels:
    app: workspace-svc
spec:
  selector:
    matchLabels:
      app: workspace-svc
  endpoints:
    - port: http
      path: /q/metrics
      interval: 30s
      scrapeTimeout: 10s
```

**Grafana Dashboard** (JSON):
```json
{
  "dashboard": {
    "title": "OneCX Workspace Service",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{job=\"workspace-svc\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_server_requests_seconds_bucket{job=\"workspace-svc\"})"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{job=\"workspace-svc\",status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

**Distributed Tracing with Jaeger**:
```yaml
# quarkus application.properties
quarkus.jaeger.service-name=onecx-workspace-svc
quarkus.jaeger.sampler-type=const
quarkus.jaeger.sampler-param=1
quarkus.jaeger.endpoint=http://jaeger-collector:14268/api/traces
```

**Logging with Loki**:
```yaml
# Fluentbit configuration to ship logs to Loki
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         5
        Daemon        off
        Log_Level     info

    [INPUT]
        Name              tail
        Path              /var/log/containers/*workspace-svc*.log
        Parser            docker
        Tag               kube.*

    [OUTPUT]
        Name              loki
        Match             kube.*
        Host              loki
        Port              3100
        Labels            job=fluentbit
```

---

### Testing Strategies

**Integration Test Pattern**:
```java
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
public class WorkspaceResourceIT {
    
    @Inject
    @RestClient
    WorkspaceInternalAPI workspaceApi;
    
    @Test
    @TestTransaction
    public void testCreateWorkspace() {
        // Given
        Workspace workspace = new Workspace();
        workspace.setName("test-workspace");
        workspace.setDisplayName("Test Workspace");
        
        // When
        Response response = workspaceApi.createWorkspace(workspace);
        
        // Then
        assertEquals(201, response.getStatus());
        
        Workspace created = response.readEntity(Workspace.class);
        assertNotNull(created.getGuid());
        assertEquals("test-workspace", created.getName());
    }
    
    @Test
    public void testSearchWorkspaces() {
        // Given
        WorkspaceSearchCriteria criteria = new WorkspaceSearchCriteria();
        criteria.setName("test");
        
        // When
        PageResult<Workspace> result = workspaceApi.searchWorkspaces(criteria);
        
        // Then
        assertNotNull(result);
        assertTrue(result.getTotalElements() > 0);
    }
}
```

**End-to-End Test with Testcontainers**:
```java
@QuarkusTest
@QuarkusTestResource(PostgresResource.class)
@QuarkusTestResource(KeycloakResource.class)
public class WorkspaceE2ETest {
    
    @Test
    public void testCompleteWorkspaceLifecycle() {
        // 1. Authenticate
        String token = authenticateUser("admin", "admin123");
        
        // 2. Create workspace
        Workspace workspace = createWorkspace(token, "sales-dept");
        assertNotNull(workspace.getGuid());
        
        // 3. Add products
        addProductToWorkspace(token, workspace.getGuid(), "onecx-user-profile");
        addProductToWorkspace(token, workspace.getGuid(), "onecx-admin");
        
        // 4. Configure menu
        MenuItem menu = createMenu(token, workspace.getGuid());
        assertNotNull(menu);
        
        // 5. Assign roles
        assignRole(token, workspace.getGuid(), "USER", "john.doe");
        
        // 6. Verify user can access
        String userToken = authenticateUser("john.doe", "password");
        Workspace retrieved = getWorkspace(userToken, workspace.getGuid());
        assertEquals("sales-dept", retrieved.getName());
        
        // 7. Delete workspace
        deleteWorkspace(token, workspace.getGuid());
        assertWorkspaceDeleted(workspace.getGuid());
    }
}
```

**Frontend E2E with Cypress**:
```typescript
describe('Workspace Management', () => {
  beforeEach(() => {
    cy.login('admin', 'admin123');
    cy.visit('/workspace/list');
  });
  
  it('should create a new workspace', () => {
    cy.get('[data-testid="create-workspace-btn"]').click();
    
    // Step 1: Basic Info
    cy.get('#name').type('test-workspace');
    cy.get('#displayName').type('Test Workspace');
    cy.get('#baseUrl').type('/test');
    cy.get('[data-testid="next-btn"]').click();
    
    // Step 2: Branding
    cy.get('#theme').select('default');
    cy.get('[data-testid="next-btn"]').click();
    
    // Step 3: Products
    cy.get('[data-testid="product-onecx-user-profile"]').check();
    cy.get('[data-testid="next-btn"]').click();
    
    // Step 4: Submit
    cy.get('[data-testid="submit-btn"]').click();
    
    // Verify creation
    cy.get('.p-toast-message-success').should('be.visible');
    cy.contains('test-workspace').should('exist');
  });
  
  it('should search workspaces', () => {
    cy.get('#search-input').type('test');
    cy.get('[data-testid="search-btn"]').click();
    
    cy.get('.workspace-list-item').should('have.length.greaterThan', 0);
    cy.contains('test-workspace').should('be.visible');
  });
});
```

---

### Security Best Practices

**Secret Management**:
```yaml
# Sealed Secret (encrypted in git)
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: postgres-credentials
spec:
  encryptedData:
    username: AgBghj7k...  # Encrypted value
    password: AgCdE2x...   # Encrypted value
  template:
    metadata:
      name: postgres-credentials
    type: Opaque
```

**Network Policies**:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: workspace-svc-policy
spec:
  podSelector:
    matchLabels:
      app: workspace-svc
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: workspace-bff
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: keycloak
      ports:
        - protocol: TCP
          port: 8080
```

**Pod Security Standards**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: workspace-svc
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: workspace-svc
      image: onecx-workspace-svc:latest
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

---

## OneCX User Profile - Complete Deep Dive

### Overview

**Pattern Purpose - User Profile Management System**:

**Why User Profile?**
- Every user needs personalized settings and preferences
- Avatar/profile picture management
- UI customization (theme, menu mode, locale, timezone)
- Single source of truth for user information
- Settings persist across sessions and devices

**What It Does**:
- Stores user personal information (name, email, address, phone)
- Manages account settings (menu mode, color scheme, locale, timezone)
- Handles avatar/profile pictures separately (dedicated avatar service)
- Auto-creates profile from JWT token on first login
- Synchronizes with identity provider (Keycloak)

**How It Works**:
```
User first login with JWT
         ↓
Profile service checks if profile exists
         ↓
Not found? → Extract data from JWT token
         ↓
Create new profile with defaults
         ↓
User customizes settings
         ↓
Settings applied to Shell and all microfrontends
         ↓
Settings persist in database
```

**When to Use**: Essential for every OneCX installation - users need profiles for personalized experience.

**GitHub**: `onecx-user-profile`, `onecx-user-profile-svc`, `onecx-user-profile-bff`, `onecx-user-profile-ui`, `onecx-user-profile-avatar-svc`  
**Technology**: Quarkus 3.x, Angular 19+, PostgreSQL  
**Key Features**: Profile management, avatar storage, account settings, JWT token integration

---

### Database Schema

**Pattern Purpose - User Profile Data Model**:

**Why This Structure?**
- Separates personal data from account settings
- Embedded objects reduce joins
- Unique constraint per tenant prevents duplicates
- Named entity graphs optimize lazy loading
- Settings as JSON for flexibility

**What Tables?**
- **USER_PROFILE**: Main profile table
- **Embedded UserPerson**: Name, email, phone, address
- **Embedded UserProfileAccountSettings**: Menu mode, color scheme, locale/timezone
- **SETTINGS**: Free-form JSON for custom preferences

**How They Relate**:
```
USER_PROFILE (main table)
├── TENANT_ID (discriminator for multi-tenancy)
├── USER_ID (unique per tenant)
├── IDENTITY_PROVIDER + IDENTITY_PROVIDER_ID (Keycloak sync)
├── ORGANIZATION (company/department)
├── UserPerson (embedded)
│   ├── FIRST_NAME, LAST_NAME, DISPLAY_NAME
│   ├── EMAIL
│   ├── UserPersonPhone (embedded)
│   └── UserPersonAddress (embedded)
├── UserProfileAccountSettings (embedded)
│   ├── MENU_MODE (HORIZONTAL, STATIC, OVERLAY, SLIM, SLIMPLUS)
│   ├── COLOR_SCHEME (AUTO, LIGHT, DARK)
│   ├── LOCALE (en, de, fr, etc.)
│   └── TIMEZONE (UTC, Europe/Berlin, America/New_York)
└── SETTINGS (JSON varchar(5000))
```

**When to Query**: Every user login to load profile, settings page to edit.

**JPA Entity**:
```java
@Entity
@Table(name = "USER_PROFILE", uniqueConstraints = {
        @UniqueConstraint(name = "UP_CONSTRAINTS", columnNames = { "USER_ID", "TENANT_ID" })
}, indexes = {
        @Index(columnList = "FIRST_NAME,LAST_NAME,EMAIL,TENANT_ID", name = "user_person_criteria_idx") })
@NamedEntityGraph(name = "UserProfile.loadPerson", attributeNodes = {
        @NamedAttributeNode(value = "person")
})
@Getter
@Setter
public class UserProfile extends TraceableEntity {

    public static final String ENTITY_GRAPH_LOAD_PERSON = ".loadPerson";

    @Column(name = "USER_ID")
    private String userId;

    @TenantId
    @Column(name = "TENANT_ID")
    private String tenantId;

    @Column(name = "IDENTITY_PROVIDER")
    private String identityProvider;

    @Column(name = "IDENTITY_PROVIDER_ID")
    private String identityProviderId;

    @Column(name = "ISSUER")
    private String issuer;

    @Column(name = "ORGANIZATION")
    private String organization;

    @Embedded
    private UserPerson person;

    @Embedded
    private UserProfileAccountSettings accountSettings;

    @Column(name = "SETTINGS", columnDefinition = "varchar(5000)")
    private String settings;
}

@Embeddable
@Getter
@Setter
public class UserPerson implements Serializable {

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "DISPLAY_NAME")
    private String displayName;

    @Column(name = "EMAIL")
    private String email;

    @Embedded
    private UserPersonPhone phone;

    @Embedded
    private UserPersonAddress address;
}

@Embeddable
@Getter
@Setter
public class UserProfileAccountSettings implements Serializable {

    @Column(name = "MENU_MODE")
    @Enumerated(EnumType.STRING)
    private MenuMode menuMode;

    @Column(name = "COLOR_SCHEME")
    @Enumerated(EnumType.STRING)
    private ColorScheme colorScheme;

    @Column(name = "LOCALE")
    private String locale;

    @Column(name = "TIMEZONE")
    private String timezone;

    public enum MenuMode {
        HORIZONTAL, STATIC, OVERLAY, SLIM, SLIMPLUS
    }

    public enum ColorScheme {
        AUTO, LIGHT, DARK
    }
}
```

---

### REST API Architecture

**Pattern Purpose - User Profile APIs**:

**Why Multiple API Layers?**
- **Internal API**: For BFF and internal service communication
- **External V1 API**: Public versioned API for integrations
- **Admin API**: For admin operations (search all profiles, bulk updates)

**What APIs?**
1. **Get My Profile**: Current user's profile
2. **Update My Profile**: Current user updates their info
3. **Search Profiles** (Admin): Search all users
4. **Get Profile by UserID** (Admin): View any user's profile
5. **Delete Profile** (Admin): Remove user profile

**How Security Works**:
- Normal users can only access/modify their own profile
- Admin users can search and view all profiles
- JWT token provides current user context
- Tenant filtering automatic (multi-tenancy)

**When to Call**: User login (load profile), settings page (update), admin panel (search users).

**Internal API (for BFF)**:
```java
@Path("/internal/userProfile")
@ApplicationScoped
@Transactional(value = Transactional.TxType.NOT_SUPPORTED)
@LogService
public class UserProfileRestController implements UserProfileApi {
    
    @Inject UserProfileDAO userProfileDAO;
    @Inject UserProfileService jwtService;
    @Inject UserProfileMapper userProfileMapper;
    
    @Override
    public Response getMyUserProfile() {
        var userId = ApplicationContext.get().getPrincipal();
        var userProfile = userProfileDAO.getUserProfileByUserId(userId, 
            UserProfile.ENTITY_GRAPH_LOAD_PERSON);
        
        if (userProfile == null) {
            // Auto-create profile from JWT token
            var createUserProfile = jwtService.createProfileFromToken();
            userProfile = userProfileDAO.create(createUserProfile);
        }
        
        return Response.ok(userProfileMapper.mapProfile(userProfile)).build();
    }
    
    @Override
    @Transactional
    public Response updateMyUserProfile(UpdateUserProfileRequestDTO dto) {
        var userId = ApplicationContext.get().getPrincipal();
        var userProfile = userProfileDAO.getUserProfileByUserId(userId, null);
        
        if (userProfile == null) {
            return Response.status(404).build();
        }
        
        userProfileMapper.update(dto, userProfile);
        userProfile = userProfileDAO.update(userProfile);
        
        return Response.ok(userProfileMapper.mapProfile(userProfile)).build();
    }
}
```

**Admin API**:
```java
@Path("/internal/admin/userProfile")
@ApplicationScoped
@Transactional(value = Transactional.TxType.NOT_SUPPORTED)
@LogService
public class UserProfileAdminRestController implements UserProfileAdminApi {
    
    @Inject UserProfileDAO userProfileDAO;
    @Inject UserProfileMapper userProfileMapper;
    
    @Override
    public Response searchUserProfile(UserPersonCriteriaDTO criteriaDTO) {
        var criteria = userProfileMapper.map(criteriaDTO);
        var result = userProfileDAO.findBySearchCriteria(criteria, 
            criteriaDTO.getPageNumber(), criteriaDTO.getPageSize());
        return Response.ok(userProfileMapper.mapPageResult(result)).build();
    }
    
    @Override
    public Response getUserProfile(@PathParam("id") String id) {
        var userProfile = userProfileDAO.findById(id);
        if (userProfile == null) {
            return Response.status(404).build();
        }
        return Response.ok(userProfileMapper.mapProfile(userProfile)).build();
    }
}
```

---

### DAO Pattern with Named Entity Graphs

**Pattern Purpose - Optimized Profile Loading**:

**Why Entity Graphs?**
- Prevents N+1 query problem
- Explicit fetch strategy (not relying on FetchType)
- Different graphs for different use cases
- Lazy loading with controlled eager fetching

**What Graphs?**
- `UserProfile.loadPerson`: Loads profile + person info (most common)
- `UserProfile.loadAll`: Loads everything (admin view)
- `UserProfile.loadById`: Minimal load (just profile)

**How It Works**:
```
Query without entity graph:
  SELECT * FROM USER_PROFILE WHERE user_id = ?
  (person not loaded - lazy)
  → Access person.firstName
  → SELECT * FROM USER_PROFILE WHERE id = ? (N+1 query!)

Query with entity graph:
  SELECT up.*, p.* FROM USER_PROFILE up 
  LEFT JOIN ... (person embedded)
  WHERE user_id = ?
  (person loaded in one query - optimized!)
```

**When to Use**: Specify entity graph in DAO methods to control fetching behavior.

**DAO Implementation**:
```java
@ApplicationScoped
public class UserProfileDAO extends AbstractDAO<UserProfile> {

    public UserProfile getUserProfileByUserId(String userId, String loadGraphType) {
        var cb = getEntityManager().getCriteriaBuilder();
        var cq = cb.createQuery(UserProfile.class);
        var root = cq.from(UserProfile.class);
        cq.where(cb.equal(root.get(UserProfile_.USER_ID), userId));
        
        var typedQuery = em.createQuery(cq);
        
        // Apply entity graph if specified
        if (loadGraphType != null) {
            EntityGraph<?> entityGraph = em.getEntityGraph(
                UserProfile.class.getSimpleName() + loadGraphType);
            typedQuery.setHint("jakarta.persistence.fetchgraph", entityGraph);
        }
        
        return typedQuery.getResultStream().findFirst().orElse(null);
    }

    public PageResult<UserProfile> findBySearchCriteria(
            UserPersonCriteria criteria, int pageNumber, int pageSize) {
        
        var cb = getEntityManager().getCriteriaBuilder();
        var cq = cb.createQuery(UserProfile.class);
        var root = cq.from(UserProfile.class);
        cq.select(root).distinct(true);
        
        var predicates = new ArrayList<Predicate>();
        
        // Search by userId
        if (criteria.getUserId() != null) {
            predicates.add(createSearchStringPredicate(cb, 
                root.get(UserProfile_.userId), criteria.getUserId()));
        }
        
        // Search by email (in embedded person)
        if (criteria.getEmail() != null) {
            predicates.add(createSearchStringPredicate(cb, 
                root.get(UserProfile_.person).get(UserPerson_.EMAIL), 
                criteria.getEmail()));
        }
        
        // Search by first name
        if (criteria.getFirstName() != null) {
            predicates.add(createSearchStringPredicate(cb, 
                root.get(UserProfile_.person).get(UserPerson_.FIRST_NAME),
                criteria.getFirstName()));
        }
        
        // Search by last name
        if (criteria.getLastName() != null) {
            predicates.add(createSearchStringPredicate(cb, 
                root.get(UserProfile_.person).get(UserPerson_.LAST_NAME), 
                criteria.getLastName()));
        }

        if (!predicates.isEmpty()) {
            cq.where(cb.and(predicates.toArray(new Predicate[0])));
        }
        
        cq.orderBy(cb.desc(root.get(AbstractTraceableEntity_.CREATION_DATE)));

        return createPageQuery(cq, Page.of(pageNumber, pageSize)).getPageResult();
    }
}
```

---

### JWT Token Integration

**Pattern Purpose - Auto-Create Profile from Token**:

**Why Extract from Token?**
- User logs in via Keycloak for first time
- No profile exists yet in database
- JWT contains user information (name, email, roles)
- Automatically create profile from token claims
- User gets personalized experience immediately

**What Token Contains?**
- `sub`: Subject (user ID)
- `preferred_username`: Username
- `given_name`: First name
- `family_name`: Last name
- `email`: Email address
- `organization`: Company/department
- Custom claims: Additional attributes

**How Token Parsing Works**:
```
User logs in → Keycloak issues JWT
           ↓
Shell sends JWT to User Profile BFF
           ↓
BFF calls User Profile Service with JWT
           ↓
Service checks: profile exists?
           ↓
Not found → Extract data from JWT
           ↓
Create UserProfile entity with JWT data
           ↓
Persist to database
           ↓
Return profile to user
```

**When to Use**: First-time user login, profile sync with identity provider.

**Token Profile Creation**:
```java
@RequestScoped
public class UserProfileService {
    
    @Inject UserProfileConfig config;
    
    public UserProfile createProfileFromToken() {
        var userId = ApplicationContext.get().getPrincipal();
        var token = ApplicationContext.get().getToken();
        
        var userProfile = new UserProfile();
        userProfile.setId(UUID.randomUUID().toString());
        userProfile.setUserId(userId);
        
        // Extract identity provider info
        if (token != null) {
            userProfile.setIdentityProvider(token.getIssuer());
            userProfile.setIdentityProviderId(token.getSubject());
            userProfile.setIssuer(token.getIssuer());
        }
        
        // Create person from token claims
        var person = new UserPerson();
        if (token != null && token.getClaims() != null) {
            var claims = token.getClaims();
            
            // Extract names
            person.setFirstName(claims.get("given_name") != null ? 
                claims.get("given_name").toString() : null);
            person.setLastName(claims.get("family_name") != null ? 
                claims.get("family_name").toString() : null);
            person.setDisplayName(claims.get("preferred_username") != null ? 
                claims.get("preferred_username").toString() : userId);
            person.setEmail(claims.get("email") != null ? 
                claims.get("email").toString() : null);
            
            // Extract organization
            if (claims.get("organization") != null) {
                userProfile.setOrganization(claims.get("organization").toString());
            }
        }
        
        userProfile.setPerson(person);
        
        // Set default account settings
        var accountSettings = new UserProfileAccountSettings();
        accountSettings.setMenuMode(config.getDefaultMenuMode());
        accountSettings.setColorScheme(config.getDefaultColorScheme());
        accountSettings.setLocale(config.getDefaultLocale());
        accountSettings.setTimezone(config.getDefaultTimezone());
        
        userProfile.setAccountSettings(accountSettings);
        
        return userProfile;
    }
}
```

---

### Avatar Service (Separate Microservice)

**Pattern Purpose - Avatar/Profile Picture Storage**:

**Why Separate Service?**
- Images are binary data (separate from text data)
- Different storage requirements (filesystem or S3)
- Separate scaling (avatars have different load pattern)
- Can use CDN for avatar delivery
- Security: validate image types, scan for malware

**What It Stores**:
- User avatar images (JPEG, PNG, GIF)
- Image metadata (upload date, size, mime type)
- Automatic resizing and optimization
- Thumbnail generation

**How Upload Works**:
```
User selects avatar image
         ↓
Frontend sends multipart/form-data
         ↓
Avatar Service validates:
  - File type (image only)
  - File size (< 5MB)
  - Image dimensions
         ↓
Generate thumbnail (150x150)
         ↓
Store original + thumbnail
         ↓
Return avatar URL
         ↓
Profile stores URL reference
```

**When to Use**: User uploads profile picture, admin uploads company logo.

**Avatar REST API**:
```java
@Path("/avatars")
@ApplicationScoped
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)
public class AvatarRestController {
    
    @Inject AvatarService avatarService;
    
    @POST
    @Path("/me")
    @Transactional
    public Response uploadMyAvatar(
            @MultipartForm AvatarUploadForm form) {
        
        var userId = ApplicationContext.get().getPrincipal();
        
        // Validate image
        if (!isValidImage(form.getFile())) {
            return Response.status(400).entity("Invalid image file").build();
        }
        
        // Store avatar
        var avatar = avatarService.storeAvatar(userId, form.getFile());
        
        return Response.ok(avatar).build();
    }
    
    @GET
    @Path("/me")
    public Response getMyAvatar() {
        var userId = ApplicationContext.get().getPrincipal();
        var avatar = avatarService.getAvatar(userId);
        
        if (avatar == null) {
            return Response.status(404).build();
        }
        
        return Response.ok(avatar)
            .type(avatar.getMimeType())
            .build();
    }
    
    @DELETE
    @Path("/me")
    @Transactional
    public Response deleteMyAvatar() {
        var userId = ApplicationContext.get().getPrincipal();
        avatarService.deleteAvatar(userId);
        return Response.noContent().build();
    }
}
```

---

### Frontend - User Settings Component

**Pattern Purpose - User Settings UI**:

**Why Dedicated Settings Page?**
- Centralized place for all user preferences
- Instant feedback on settings changes
- Validation before saving
- Reload page to apply new settings

**What Settings?**
- Personal info (name, email, phone, address)
- Menu mode (HORIZONTAL, STATIC, OVERLAY, SLIM, SLIMPLUS)
- Color scheme (AUTO, LIGHT, DARK)
- Locale (en, de, fr, es, it)
- Timezone (UTC, Europe/Berlin, America/New_York)
- Avatar upload

**How It Works**:
```
User opens settings page
         ↓
Load current profile from backend
         ↓
Display form with current values
         ↓
User changes color scheme to DARK
         ↓
Save button → POST to backend
         ↓
Backend updates profile
         ↓
Success → Reload page
         ↓
Shell applies new color scheme
         ↓
All microfrontends see dark theme
```

**When to Use**: Every application needs user settings page.

**Angular Component**:
```typescript
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html'
})
export class UserSettingsComponent implements OnInit {
  
  profile: UserProfile;
  profileForm: FormGroup;
  menuModes = ['HORIZONTAL', 'STATIC', 'OVERLAY', 'SLIM', 'SLIMPLUS'];
  colorSchemes = ['AUTO', 'LIGHT', 'DARK'];
  locales = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' }
  ];
  
  constructor(
    private userProfileApi: UserProfileAPIService,
    private msgService: PortalMessageService,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      displayName: [''],
      email: [''],
      organization: [''],
      menuMode: ['STATIC'],
      colorScheme: ['AUTO'],
      locale: ['en'],
      timezone: ['UTC']
    });
  }
  
  ngOnInit() {
    this.loadProfile();
  }
  
  loadProfile() {
    this.userProfileApi.getMyUserProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          firstName: profile.person?.firstName,
          lastName: profile.person?.lastName,
          displayName: profile.person?.displayName,
          email: profile.person?.email,
          organization: profile.organization,
          menuMode: profile.accountSettings?.menuMode || 'STATIC',
          colorScheme: profile.accountSettings?.colorScheme || 'AUTO',
          locale: profile.accountSettings?.locale || 'en',
          timezone: profile.accountSettings?.timezone || 'UTC'
        });
      },
      error: (err) => {
        this.msgService.error({ summaryKey: 'USER_PROFILE.LOAD_ERROR' });
      }
    });
  }
  
  onSave() {
    if (!this.profileForm.valid) {
      return;
    }
    
    const formValue = this.profileForm.value;
    const updateRequest: UpdateUserProfileRequest = {
      modificationCount: this.profile.modificationCount!,
      organization: formValue.organization,
      person: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        displayName: formValue.displayName,
        email: formValue.email
      },
      accountSettings: {
        menuMode: formValue.menuMode,
        colorScheme: formValue.colorScheme,
        locale: formValue.locale,
        timezone: formValue.timezone
      }
    };
    
    this.userProfileApi.updateMyUserProfile({ updateUserProfileRequest: updateRequest })
      .subscribe({
        next: () => {
          this.msgService.success({ summaryKey: 'USER_PROFILE.SAVE_SUCCESS' });
          // Reload to apply new settings
          setTimeout(() => this.location.historyGo(0), 1000);
        },
        error: (err) => {
          this.msgService.error({ summaryKey: 'USER_PROFILE.SAVE_ERROR' });
        }
      });
  }
  
  onAvatarUpload(event: any) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    this.userProfileApi.uploadAvatar(formData).subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'USER_PROFILE.AVATAR_UPLOAD_SUCCESS' });
        this.loadProfile(); // Reload to show new avatar
      },
      error: (err) => {
        this.msgService.error({ summaryKey: 'USER_PROFILE.AVATAR_UPLOAD_ERROR' });
      }
    });
  }
}
```

---

## OneCX Welcome - Complete Deep Dive

### Overview

**Pattern Purpose - Welcome/Landing Page Service**:

**Why Welcome Service?**
- First page users see after login
- Personalized welcome message with user's name
- Image carousel/slideshow for announcements
- Quick links to frequently used applications
- Workspace-specific welcome content

**What It Does**:
- Stores welcome images per workspace
- Manages image carousel (position, visibility, styling)
- Provides image URLs or embedded base64 data
- Controls image display options (object-fit, position, background)

**How It Works**:
```
User logs into workspace "admin"
         ↓
Shell loads workspace configuration
         ↓
Welcome microfrontend loads
         ↓
Fetches welcome images for "admin" workspace
         ↓
Displays carousel with images
         ↓
User sees personalized welcome screen
```

**When to Use**: Every workspace should have a welcome page for better user experience.

**GitHub**: `onecx-welcome`, `onecx-welcome-svc`, `onecx-welcome-bff`, `onecx-welcome-ui`  
**Technology**: Quarkus 3.x, Angular 19+, PostgreSQL  
**Key Features**: Image management, carousel display, workspace-specific content

---

### Database Schema

**Pattern Purpose - Welcome Image Storage**:

**Why This Structure?**
- Images scoped to workspace (different welcome per workspace)
- Position for carousel ordering
- Visibility toggle (enable/disable images)
- Styling options (object-fit, position, background color)
- Separate table for actual image data (ImageData)

**What Tables?**
- **IMAGE**: Metadata and configuration
- **IMAGE_DATA**: Actual binary image data (one-to-one)

**How They Relate**:
```
IMAGE (metadata)
├── TENANT_ID (multi-tenancy)
├── WORKSPACE_NAME (scope to workspace)
├── POSITION (carousel order: 1, 2, 3)
├── OBJECT_FIT (NONE, CONTAIN, COVER, FILL, SCALE_DOWN)
├── OBJECT_POSITION (top, center, bottom)
├── BACKGROUND_COLOR (#FFFFFF, transparent)
├── VISIBLE (true/false)
├── URL (external image URL, optional)
└── IMAGE_DATA (FK to IMAGE_DATA table)
    └── IMAGE_DATA
        ├── DATA (BLOB - actual image bytes)
        ├── MIME_TYPE (image/jpeg, image/png)
        └── LENGTH (file size in bytes)
```

**When to Query**: Load all visible images for workspace on welcome page.

**JPA Entities**:
```java
@Entity
@Table(name = "IMAGE")
@Getter
@Setter
public class Image extends TraceableEntity {

    @TenantId
    @Column(name = "TENANT_ID")
    private String tenantId;

    @Column(name = "WORKSPACE_NAME", nullable = false)
    private String workspaceName;

    @Column(name = "POSITION")
    private Integer position;

    @Column(name = "OBJECT_FIT")
    @Enumerated(EnumType.STRING)
    private ObjectFit objectFit;

    @Column(name = "OBJECT_POSITION")
    private String objectPosition;

    @Column(name = "BACKGROUND_COLOR")
    private String backgroundColor;

    @Column(name = "VISIBLE")
    private boolean visible;

    @Column(name = "URL")
    private String url;  // External URL (optional, instead of embedded data)

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "IMAGE_DATA")
    private ImageData imageDataId;

    public enum ObjectFit {
        NONE,      // No scaling
        CONTAIN,   // Scale to fit within container
        COVER,     // Scale to cover entire container
        FILL,      // Stretch to fill container
        SCALE_DOWN // Scale down if needed (like contain)
    }
}

@Entity
@Table(name = "IMAGE_DATA")
@Getter
@Setter
public class ImageData extends TraceableEntity {

    @Lob
    @Column(name = "DATA", length = 10485760) // 10MB max
    private byte[] data;

    @Column(name = "MIME_TYPE")
    private String mimeType;

    @Column(name = "LENGTH")
    private Long length;
}
```

---

### REST API

**Pattern Purpose - Welcome Image Management APIs**:

**Why These APIs?**
- Admin needs to upload/manage welcome images
- Frontend needs to fetch images for display
- Support both embedded data and external URLs
- Workspace-specific image sets

**What Operations?**
1. **GET /images**: List all images for workspace
2. **POST /images**: Create new welcome image  
3. **PUT /images/{id}**: Update image metadata
4. **DELETE /images/{id}**: Remove image
5. **GET /images/{id}/data**: Fetch actual image binary data

**Image Controller**:
```java
@Path("/internal/images")
@ApplicationScoped
@LogService
public class ImageRestController implements ImageInternalApi {
    
    @Inject ImageDAO imageDAO;
    @Inject ImageMapper mapper;
    
    @GET
    public Response getImagesByWorkspace(@QueryParam("workspaceName") String workspaceName) {
        var images = imageDAO.findByWorkspace(workspaceName);
        return Response.ok(mapper.mapList(images)).build();
    }
    
    @POST
    @Transactional
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response createImage(@MultipartForm ImageUploadForm form) {
        var imageData = new ImageData();
        imageData.setData(form.getImageFile());
        imageData.setMimeType(form.getMimeType());
        imageData.setLength((long) form.getImageFile().length);
        
        var image = new Image();
        image.setWorkspaceName(form.getWorkspaceName());
        image.setPosition(form.getPosition());
        image.setObjectFit(form.getObjectFit());
        image.setVisible(form.isVisible());
        image.setImageDataId(imageData);
        
        image = imageDAO.create(image);
        return Response.created(URI.create("/images/" + image.getId()))
            .entity(mapper.map(image)).build();
    }
}
```

---

## OneCX Admin Portal - Complete Deep Dive

### Overview

**Pattern Purpose - Admin Portal Workspace**:

**Why Admin Portal?**
- Centralized administrative interface
- Pre-configured workspace with all admin tools
- Role-based access (only admins see this workspace)
- Consistent navigation for admin tasks

**What It Provides**:
- Pre-configured workspace named "admin"
- Menu structure with all admin applications
- Theme configured for admin use
- Role assignments (admin role required)

**When to Use**: Every OneCX installation needs admin workspace for system administrators.

**GitHub**: `onecx-admin`, `onecx-admin-bff`, `onecx-admin-ui`  
**Technology**: Configuration-based (deployed via CRDs)  
**Key Features**: Admin workspace configuration, pre-defined menu, role restrictions

---

## Infrastructure & Development Tools

### OneCX Quarkus Extensions

**Pattern Purpose - Reusable Quarkus Extensions**:

**Why Custom Extensions?**
- Standardize common patterns across all OneCX services
- Reduce boilerplate code
- Consistent behavior (logging, security, multi-tenancy)
- Easy to update all services (update extension version)

**What Extensions?**
1. **onecx-quarkus-core**: Base classes, utilities
2. **onecx-quarkus-tenant**: Multi-tenancy support
3. **onecx-quarkus-parameters**: Parameter management
4. **onecx-quarkus-permissions**: RBAC integration
5. **onecx-quarkus-validator**: Custom validators
6. **onecx-quarkus-operator**: Kubernetes operator utilities
7. **onecx-openapi-generator**: OpenAPI code generation customizations

**GitHub**: `onecx-quarkus/extensions/*`

---

### Kubernetes Operators

**Pattern Purpose - Declarative Resource Management**:

**Why Operators?**
- Infrastructure as Code (IaC)
- Automatic reconciliation (desired vs actual state)
- No manual API calls needed
- GitOps friendly (version control CRDs)

**What Operators?**
- **Product Store Operator**: Registers microfrontends/microservices from CRDs
- **Permission Operator**: Creates permissions from CRDs
- **Parameter Operator**: Manages parameters from CRDs
- **Keycloak Client Operator**: Auto-creates Keycloak clients
- **Database Operator**: PostgreSQL database provisioning

**GitHub**: `onecx-product-store-operator`, `onecx-permission-operator`, `onecx-parameter-operator`, `onecx-iam-kc-client-operator`, `onecx-k8s-db-postgresql-operator`

---

### CI/CD Pipelines

**Pattern Purpose - Automated Build & Release**:

**Why Reusable Workflows?**
- DRY principle (Don't Repeat Yourself)
- Consistent build process across 100+ repositories
- Single place to update build logic
- Standardized versioning and releases

**What CI/CD Tools?**
- **ci-angular**: Angular app builds
- **ci-quarkus**: Quarkus service builds
- **ci-npm**: NPM library publishing
- **ci-java-lib**: Java library builds
- **ci-product**: Complete product builds (UI+BFF+SVC)

**GitHub**: `ci-angular`, `ci-quarkus`, `ci-npm`, `ci-java-lib`, `ci-product`

**Usage in Repository**:
```yaml
# .github/workflows/build.yml
name: Build

on: [push]

jobs:
  build:
    uses: onecx/ci-quarkus/.github/workflows/build.yml@main
    with:
      java-version: 17
    secrets: inherit
```

---

### Development Tools

**onecx-nx-plugins**:
- NX workspace generators for OneCX applications
- Scaffolding templates (UI, BFF, SVC)
- Consistent project structure

**onecx-webpack-plugin**:
- Custom Webpack configuration for Module Federation
- Automatic remote entry generation
- Shared dependencies optimization

**onecx-local-env**:
- Docker Compose for local development
- Includes: PostgreSQL, Keycloak, Adminer
- Pre-configured with test data

**onecx-local-env-cli**:
- CLI tool for managing local environment
- Commands: start, stop, reset, logs

**GitHub**: `onecx-nx-plugins`, `onecx-webpack-plugin`, `onecx-local-env`, `onecx-local-env-cli`

---

This completes the comprehensive OneCX Deep Dive Developer Guide covering ALL services including the critical missing ones (User Profile, Welcome, Admin Portal) plus infrastructure components, development tools, and operational patterns!

