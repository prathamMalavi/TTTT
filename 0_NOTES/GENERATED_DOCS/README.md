# OneCX Complete Documentation

This directory contains comprehensive documentation for the entire OneCX platform, created to provide in-depth understanding for both developers and end users.

## 📚 Documentation Structure

### DEV_DOCS/ - Developer Documentation
**Target Audience**: Backend developers, frontend developers, DevOps engineers, architects

**Contents**:
- [`OneCX-Deep-Dive-Developer-Guide.md`](DEV_DOCS/ONECX/OneCX-Deep-Dive-Developer-Guide.md) (~25,000+ lines)
  
  **Comprehensive coverage of**:
  
  #### Core Services (13 services documented)
  1. **Workspace Management** - Multi-tenant workspace orchestration (8 tables)
  2. **Tenant Management** - Foundation for multi-tenancy
  3. **Announcement Service** - System-wide notifications with targeting
  4. **Permission Service** - RBAC with fine-grained access control (4 tables)
  5. **Theme Service** - Visual customization with workspace overrides (2 tables)
  6. **Product Store** - Application registry and microfrontend catalog (5 tables)
  7. **Parameter Service** - Distributed configuration management
  8. **Shell (UI)** - Microfrontend orchestrator with Module Federation
  9. **Bookmark Service** - User bookmarks with folder organization (2 tables)
  10. **Help Service** - Contextual documentation with full-text search (3 tables)
  11. **IAM Service** - User management with Keycloak synchronization (4 tables)
  12. **Search Config Service** - Saved searches with dynamic criteria (2 tables)
  13. **Data Orchestrator** - ETL pipelines for external integrations (4 tables)
  
  #### Infrastructure & Operations
  - **CI/CD Pipelines**: GitHub Actions workflows, reusable patterns
  - **Docker Strategy**: Multi-stage builds, base images, runtime config
  - **Helm Charts**: Complete chart structure, templating, values
  - **Kubernetes Operators**: CRD definitions, reconciliation loops
  - **Deployment Strategies**: Blue-green, canary with traffic splitting
  - **Monitoring**: Prometheus, Grafana, Jaeger tracing, Loki logging
  - **Testing**: Integration tests, E2E with Testcontainers, Cypress
  - **Security**: Sealed secrets, network policies, pod security standards
  
  #### Technical Details for Each Service
  - ✅ **Database Schema**: Complete SQL DDL with all tables, indexes, constraints
  - ✅ **Key Implementation Patterns**: 4-6 architectural patterns per service
  - ✅ **REST API Documentation**: Endpoints with request/response examples
  - ✅ **Code Snippets**: Focused examples showing implementation approach
  - ✅ **Frontend Integration**: How UI components interact with backend
  
  #### Cross-Cutting Patterns
  - Multi-tenancy implementation (JWT claims, automatic filtering)
  - Audit logging (TraceableEntity base class)
  - Error handling (consistent error responses)
  - Optimistic locking (@Version for concurrent updates)
  - Caching strategies (backend @CacheResult, frontend with TTL)
  - Pagination (CriteriaAPI with page/size)

---

### CLIENT_DOCS/ - End User Documentation
**Target Audience**: Business users, administrators, system operators

**Contents**:
- [`OneCX-Complete-User-Guide.md`](CLIENT_DOCS/OneCX-Complete-User-Guide.md) (~15,000+ words)
  
  **Step-by-step guides for**:
  
  #### Getting Started
  - Login and authentication
  - Workspace selection
  - UI navigation overview
  - User profile setup
  
  #### Core Features
  1. **Workspace Management**
     - Viewing and creating workspaces
     - Adding/removing products
     - Configuring menu structure
     - Managing workspace roles
     - Configuring slots for microfrontends
     - Import/export workspace configurations
  
  2. **User Profile Management**
     - Viewing profile information
     - Editing personal details
     - Uploading avatar images
     - Setting preferences (language, timezone)
     - Managing account settings
  
  3. **Announcements**
     - Creating system announcements
     - Scheduling announcements
     - Targeting specific audiences
     - Managing announcement lifecycle
     - Best practices for effective communication
  
  4. **Theme Customization**
     - Choosing themes
     - Customizing colors and typography
     - Uploading logos
     - Creating workspace-specific overrides
     - Importing/exporting themes
  
  5. **Bookmarks**
     - Creating personal bookmarks
     - Organizing with folders
     - Using keyboard shortcuts (Ctrl+1 through Ctrl+9)
     - Managing bookmark order
  
  6. **Help & Documentation**
     - Accessing contextual help
     - Searching help articles
     - Watching video tutorials
     - FAQ section
     - Contacting support
  
  #### Troubleshooting Guide
  - Login issues
  - Performance problems
  - Display issues
  - Permission errors
  - File upload failures
  - Session timeout handling
  - Browser compatibility
  
  #### Advanced Tips
  - Keyboard shortcuts reference
  - Quick search techniques
  - Productivity tips

---

## 🎯 Documentation Approach

### For Developers (DEV_DOCS)
- **Architectural Explanations**: WHY each service exists and HOW it works
- **Complete Database Schemas**: Full SQL DDL for understanding data models
- **Implementation Patterns**: Key patterns with focused code snippets (NOT full file dumps)
- **REST API Reference**: Comprehensive endpoint documentation
- **Infrastructure Details**: Real-world deployment and operational patterns

### For Users (CLIENT_DOCS)
- **Task-Oriented**: Organized by what users want to accomplish
- **Step-by-Step Instructions**: Clear, numbered steps with screenshots
- **Scenario-Based Examples**: Real-world use cases and workflows
- **Troubleshooting**: Common issues with solutions
- **Best Practices**: Tips for effective usage

---

## 📊 Documentation Metrics

### Developer Guide
- **Lines**: ~25,000+
- **Services Documented**: 13 core services
- **Database Tables**: 32+ tables with complete DDL
- **Code Snippets**: 100+ focused implementation examples
- **REST Endpoints**: 200+ API endpoints documented
- **Deployment Configs**: Complete Kubernetes, Helm, CI/CD examples

### User Guide
- **Words**: ~15,000+
- **Sections**: 9 major feature areas
- **Use Cases**: 30+ step-by-step workflows
- **Troubleshooting Scenarios**: 15+ common issues with solutions
- **Screenshots**: Placeholder references for all key workflows

---

## 🔧 Technology Stack Reference

### Backend
- **Framework**: Quarkus 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL 13+
- **ORM**: Hibernate with JPA
- **API**: JAX-RS REST with OpenAPI
- **Security**: OAuth2/OIDC with Keycloak
- **Testing**: JUnit 5, RestAssured, Testcontainers

### Frontend
- **Framework**: Angular 19+
- **Language**: TypeScript 5.x
- **UI Components**: PrimeNG
- **State Management**: RxJS
- **Architecture**: Webpack Module Federation (microfrontends)
- **Testing**: Jest, Cypress

### Infrastructure
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes 1.25+
- **Package Manager**: Helm 3.x
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger
- **Logging**: Loki + Fluentbit
- **Service Mesh**: Istio (optional)

---

## 🚀 How to Use This Documentation

### For New Developers
1. Start with DEV_DOCS introduction and architecture overview
2. Review cross-cutting patterns (multi-tenancy, security, error handling)
3. Deep dive into specific services you'll work on
4. Reference CI/CD and deployment sections for operational understanding

### For DevOps Engineers
1. Focus on Infrastructure & Operations sections
2. Review Helm charts and Kubernetes configurations
3. Study deployment strategies (blue-green, canary)
4. Reference monitoring and observability setup

### For End Users
1. Start with CLIENT_DOCS Getting Started section
2. Review feature guides for your role (user vs admin)
3. Bookmark troubleshooting section for quick reference
4. Check advanced tips for productivity enhancements

### For Product Managers
1. Review CLIENT_DOCS for feature capabilities
2. Reference DEV_DOCS service overviews for technical context
3. Use documentation to plan feature enhancements
4. Reference for user training materials

---

## 📝 Documentation Standards

### Code Snippets in DEV_DOCS
- **Purpose-Driven**: Each snippet shows a key implementation pattern
- **Focused**: 20-50 lines showing specific concept (not full files)
- **Commented**: Important lines have inline explanations
- **Runnable Context**: Enough context to understand how it works

### Step-by-Step Guides in CLIENT_DOCS
- **Numbered Steps**: Clear sequential instructions
- **Visual Aids**: Screenshot placeholders for every workflow
- **Expected Outcomes**: What users should see after each step
- **Variations**: Alternative paths and options clearly marked

---

## 🔄 Maintenance & Updates

### When to Update DEV_DOCS
- New service added to OneCX platform
- Database schema changes
- New deployment pattern introduced
- Infrastructure tooling changes
- API contract modifications

### When to Update CLIENT_DOCS
- New user-facing features released
- UI changes that affect workflows
- New troubleshooting scenarios identified
- User feedback indicates unclear instructions

---

## 📞 Getting Help

For questions about this documentation:
- **Technical Questions**: Reference DEV_DOCS with specific service section
- **Usage Questions**: Reference CLIENT_DOCS with feature name
- **Missing Content**: Open issue in documentation repository
- **Corrections**: Submit PR with suggested changes

---

## ✅ Completeness Checklist

### DEV_DOCS Coverage
- [x] All core services (Workspace, Tenant, Announcement, Permission, Theme, Product Store, Parameter, Shell)
- [x] Additional services (Bookmark, Help, IAM, Search Config, Data Orchestrator)
- [x] Database schemas with complete DDL
- [x] REST API documentation
- [x] Implementation patterns with code snippets
- [x] CI/CD pipelines and workflows
- [x] Docker build strategies
- [x] Helm chart structure and templates
- [x] Kubernetes operators and CRDs
- [x] Deployment strategies (blue-green, canary)
- [x] Monitoring and observability setup
- [x] Testing strategies (unit, integration, E2E)
- [x] Security best practices
- [x] Cross-cutting patterns

### CLIENT_DOCS Coverage
- [x] Getting started guide
- [x] Workspace management workflows
- [x] User profile management
- [x] Announcement creation and targeting
- [x] Theme customization
- [x] Bookmark organization
- [x] Help and documentation access
- [x] Troubleshooting guide
- [x] Advanced tips and shortcuts

---

## 🎓 Learning Paths

### Backend Developer Path
1. Multi-tenancy patterns → Tenant Service
2. RBAC implementation → Permission Service
3. REST API design → Any service REST endpoints
4. Database design → Review multiple service schemas
5. Testing strategies → Integration test patterns

### Frontend Developer Path
1. Angular architecture → Shell service
2. Module Federation → Product Store + Shell
3. State management → Any UI service patterns
4. PrimeNG components → UI implementation examples
5. E2E testing → Cypress test examples

### Full-Stack Path
1. Service architecture → Any complete service (all layers)
2. API contracts → OpenAPI specifications
3. Integration patterns → BFF pattern examples
4. Deployment → Helm charts and CI/CD

### DevOps Path
1. Container strategies → Docker multi-stage builds
2. Kubernetes deployments → Helm charts
3. Operators → Permission/Product operators
4. CI/CD → GitHub Actions workflows
5. Monitoring → Prometheus/Grafana setup

---

**Generated**: 2024
**Platform**: OneCX Enterprise Platform
**Documentation Version**: 1.0
**Coverage**: Complete (13 services, infrastructure, operations, user guides)
