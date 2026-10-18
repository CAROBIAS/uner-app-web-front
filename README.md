# CLINICA Grupo AD — Frontend

Frontend del sistema de turnos de la clínica (Trabajo Final Integrador — Desarrollo de Aplicaciones Web 2026).
Hecho con **Angular 21** (componentes standalone), **PrimeNG 21**, **ng-select** y documentado con **Compodoc**.
Se conecta al backend NestJS del repositorio `uner-app-web-back`.

## Requisitos

- Node.js 20.19 o superior (Angular 21 no funciona con versiones anteriores).
- Angular CLI 21: `npm install -g @angular/cli@21`
- Compodoc (solo para generar la documentación): `npm install -g @compodoc/compodoc`
- El backend corriendo en `http://localhost:3000` (ver su README).

## Instalación y ejecución

```bash
npm install
ng serve
```

Abrir `http://localhost:4200`. Si el backend no está levantado, el login muestra
"No se pudo conectar con el servidor".

### Usuarios de prueba (los crea el seed del backend, clave `asd123`)

| Rol           | Documento |
|---------------|-----------|
| Paciente      | 40123456  |
| Médico        | 24567890  |
| Administrador | 28456123  |
| Paciente dado de baja (para probar el error) | 34321098 |

## Conexión con el backend (proxy)

En desarrollo, todos los pedidos que empiezan con `/api` los reenvía `ng serve` al backend,
según `proxy.conf.json`:

```json
{ "/api": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true } }
```

Para apuntar a otro backend se cambia solo `target`. Por eso los servicios usan rutas relativas
(`/api/...`) y no hay URLs del backend escritas en el código.
El proxy funciona **solo en desarrollo**: en producción el que reenvía `/api` al backend es Nginx.

## Estructura

```
src/app/
├── core/                 lo que usa toda la app
│   ├── guards/           authGuard, rolGuard, invitadoGuard
│   ├── interceptors/     authInterceptor (agrega el token y maneja el 401)
│   ├── models/           interfaces que copian los DTOs del backend
│   ├── services/         AuthService, MedicosService, ReservasService
│   └── theme/            preset de PrimeNG y traducción al español
├── shared/
│   ├── components/       página "no encontrada"
│   └── utils/            obtenerMensajeDeError
├── layout/               barra superior común a los tres roles
├── features/
│   ├── auth/login/
│   ├── patient/          inicio, reservar turno, mis turnos
│   ├── doctor/           (Integrante 5)
│   └── admin/            (Integrante 5)
├── app.routes.ts         todas las rutas
└── app.config.ts         HttpClient, interceptor, PrimeNG y formato es-AR
```

## Rutas y acceso por rol

| Ruta                  | Quién entra                 | Pantalla                    |
|-----------------------|-----------------------------|-----------------------------|
| `/login`              | solo sin sesión             | Login                       |
| `/paciente`           | PACIENTE                    | Inicio del paciente         |
| `/paciente/reservar`  | PACIENTE                    | Reservar turno              |
| `/paciente/turnos`    | PACIENTE                    | Mis turnos                  |
| `/doctor`             | MEDICO                      | Provisoria (Integrante 5)   |
| `/admin`              | ADMINISTRADOR               | Provisoria (Integrante 5)   |
| `/not-found`          | todos                       | Página no encontrada        |

- `authGuard` protege todo lo que está dentro del layout. Sin sesión, te manda a `/login`.
- `rolGuard` lee `data.roles` de la ruta. Si el rol no coincide, te manda a tu pantalla de inicio.
- Las rutas hijas de un área heredan su `rolGuard`. Todas las pantallas cargan con lazy loading.
- Los guards son para la navegación. La seguridad real la valida el backend en cada pedido.

### Sesión

El token se guarda en `localStorage` (nunca la contraseña). Al recargar la página se valida con
`GET /api/auth/perfil`. Si el backend responde 401 (token vencido, dura 1 hora),
el interceptor cierra la sesión y vuelve al login.

## Portal del paciente

- **Reservar turno:** médico (ng-select con buscador) → fecha (lunes a viernes, hasta 30 días) →
  horario (08:00 a 15:00) → resumen con el valor de la consulta → confirmar.
- **Mis turnos:** fecha, profesional, estado y **valor congelado** (el precio guardado al reservar).
  Se puede cancelar un turno pendiente hasta el día anterior, como pide la consigna.
- Los errores que manda el backend (horario ocupado, fuera de término, etc.) se muestran tal cual.

**Pendiente del backend:** no existe todavía un endpoint de horarios disponibles, así que se muestran
los 8 horarios y, si el elegido está ocupado, el backend lo rechaza al confirmar.
Cuando exista, se cambia solo el método `obtenerHorarios()` de `ReservasService`.

## Identidad visual y convenciones

Los colores y medidas están como variables en `src/styles.css`. En los componentes **siempre** se
usan las variables, nunca colores sueltos:

| Variable                   | Uso                    | Valor     |
|----------------------------|------------------------|-----------|
| `--color-primario`         | botones, enlaces       | `#0866d9` |
| `--color-titulos`          | títulos                | `#142b59` |
| `--color-secundario`       | detalles               | `#159d91` |
| `--color-fondo`            | fondo de página        | `#f5f8fc` |
| `--color-superficie`       | tarjetas               | `#ffffff` |
| `--color-borde`            | bordes                 | `#dce4ed` |
| `--color-exito` / `--color-error` | mensajes        | `#159b68` / `#dc4149` |

Además están `--radio-borde`, `--sombra-tarjeta` y `--espaciado`.

- PrimeNG usa el azul de la clínica (`core/theme/clinica-preset.ts`) y está en español (`core/theme/primeng-es.ts`).
- Fechas y montos en formato argentino (`LOCALE_ID = 'es-AR'`): `| date` y `| currency: 'ARS'`.
- Los modelos usan los mismos nombres que el backend (`id_medico`, `valor_congelado`, etc.).
- Cada clase, servicio e interfaz lleva un comentario `/** */`, que es lo que lee Compodoc.

### Para agregar una pantalla (médico o admin)

1. `ng generate component features/doctor/nombre-pantalla --skip-tests`
2. Agregar la ruta dentro de `children` del área en `app.routes.ts` (hereda el guard del rol).
3. Agregar el enlace en `MENU_POR_ROL` de `layout/layout-principal/layout-principal.ts`.

## Documentación (Compodoc)

```bash
npm run compodoc         # genera la carpeta documentation/
npm run compodoc:serve   # la genera y la abre en http://127.0.0.1:8080
```

Usa `tsconfig.app.json` y no `tsconfig.json`: el segundo incluye también los tests y duplica
el componente `App` en la documentación. La carpeta `documentation/` está en el `.gitignore`
porque se genera a partir del código.

## VS Code

`.vscode/settings.json` hace que VS Code use el TypeScript del proyecto (5.9). Sin eso,
el editor puede marcar errores que en realidad no existen. La primera vez que abrís el proyecto,
VS Code pregunta si querés usar esa versión: hay que aceptar.
