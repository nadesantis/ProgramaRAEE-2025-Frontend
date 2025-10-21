src/
├─ app/
│  ├─ app.component.ts
│  ├─ app.component.html
│  ├─ app.component.css
│  ├─ app.routes.ts
│  ├─ app.config.ts                      # providers (router, http + interceptor)
│  │
│  ├─ core/                               # SINGLETONS
│  │  ├─ auth/
│  │  │  ├─ auth.service.ts               # login/logout, localStorage, decode JWT
│  │  │  ├─ auth.guard.ts                 # requiere autenticación
│  │  │  ├─ role.guard.ts                 # requiere rol específico (data.roles)
│  │  │  └─ auth.models.ts                # LoginRequest, AuthResponse, JwtPayload, decode helper
│  │  ├─ http/
│  │  │  └─ api.interceptor.ts            # agrega Bearer y maneja 401/403
│  │  ├─ services/
│  │  │  └─ toast.service.ts              # notificaciones (simple)
│  │  └─ utils/
│  │     └─ date-format.util.ts           # (ejemplo)
│  │
│  ├─ shared/                             # REUTILIZABLE
│  │  ├─ components/
│  │  │  ├─ table/
│  │  │  │  ├─ table.component.ts
│  │  │  │  ├─ table.component.html
│  │  │  │  └─ table.component.css
│  │  │  └─ form-field/
│  │  │     ├─ form-field.component.ts
│  │  │     ├─ form-field.component.html
│  │  │     └─ form-field.component.css
│  │  ├─ pipes/
│  │  │  └─ money.pipe.ts
│  │  └─ models/
│  │     └─ pagination.model.ts           # Page<T> si querés tipar la paginación del backend
│  │
│  ├─ features/
│  │  ├─ auth/
│  │  │  └─ login-page/
│  │  │     ├─ login-page.component.ts
│  │  │     ├─ login-page.component.html
│  │  │     └─ login-page.component.css
│  │  │
│  │  ├─ products/
│  │  │  ├─ products.routes.ts            # rutas del feature
│  │  │  ├─ data/
│  │  │  │  ├─ products.api.ts            # HttpClient (CRUD)
│  │  │  │  └─ products.models.ts         # interfaces Product, filtros
│  │  │  ├─ state/
│  │  │  │  └─ products.facade.ts         # BehaviorSubject + llamadas API
│  │  │  └─ ui/
│  │  │     ├─ products-page/
│  │  │     │  ├─ products-page.component.ts
│  │  │     │  ├─ products-page.component.html
│  │  │     │  └─ products-page.component.css
│  │  │     ├─ product-form/
│  │  │     │  ├─ product-form.component.ts
│  │  │     │  ├─ product-form.component.html
│  │  │     │  └─ product-form.component.css
│  │  │     └─ product-detail/            # opcional (si usás vista detalle)
│  │  │        ├─ product-detail.component.ts
│  │  │        ├─ product-detail.component.html
│  │  │        └─ product-detail.component.css
│  │  │
│  │  ├─ clients/
│  │  │  ├─ clients.routes.ts
│  │  │  ├─ data/
│  │  │  │  ├─ clients.api.ts
│  │  │  │  └─ clients.models.ts          # Client, Address
│  │  │  ├─ state/
│  │  │  │  └─ clients.facade.ts
│  │  │  └─ ui/
│  │  │     ├─ clients-page/
│  │  │     │  ├─ clients-page.component.ts
│  │  │     │  ├─ clients-page.component.html
│  │  │     │  └─ clients-page.component.css
│  │  │     ├─ client-form/
│  │  │     │  ├─ client-form.component.ts
│  │  │     │  ├─ client-form.component.html
│  │  │     │  └─ client-form.component.css
│  │  │     └─ client-detail/
│  │  │        ├─ client-detail.component.ts
│  │  │        ├─ client-detail.component.html
│  │  │        └─ client-detail.component.css
│  │  │
│  │  └─ orders/
│  │     ├─ orders.routes.ts
│  │     ├─ data/
│  │     │  ├─ orders.api.ts
│  │     │  └─ orders.models.ts           # Order, OrderItem, OrderStatus
│  │     ├─ state/
│  │     │  └─ orders.facade.ts
│  │     └─ ui/
│  │        ├─ orders-page/
│  │        │  ├─ orders-page.component.ts
│  │        │  ├─ orders-page.component.html
│  │        │  └─ orders-page.component.css
│  │        └─ order-create/
│  │           ├─ order-create.component.ts
│  │           ├─ order-create.component.html
│  │           └─ order-create.component.css
│  │
│  └─ layout/
│     ├─ shell/
│     │  ├─ shell.component.ts
│     │  ├─ shell.component.html
│     │  └─ shell.component.css
│     └─ navbar/
│        ├─ navbar.component.ts
│        ├─ navbar.component.html
│        └─ navbar.component.css
│
├─ assets/
│  └─ logo.svg
├─ environments/
│  ├─ environment.ts                      # { apiUrl: 'http://localhost:8080' }
│  └─ environment.prod.ts
└─ main.ts