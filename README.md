# Generador de códigos QR (standalone)

Herramienta web estática para crear códigos QR en el navegador. No requiere backend, base de datos ni instalación de dependencias con npm.

La generación ocurre **100 % en el cliente**: el contenido introducido no se envía a ningún servidor.

## Requisitos

- Un navegador moderno con soporte de JavaScript habilitado.
- Conexión a internet **solo** para cargar Bootstrap e iconos desde CDN (la librería QR está incluida en el repositorio).

No se necesita Node.js, PHP ni compilación.

## Estructura del proyecto

```
qr-standalone/
├── index.html          # Página principal e interfaz
├── css/
│   └── styles.css      # Estilos complementarios
├── js/
│   ├── qrcode.min.js   # Librería qrcodejs v1.0.0 (local)
│   └── qrcode-tool.js  # Lógica de formulario, codificación y exportación
└── README.md
```

## Cómo ejecutarlo

### Opción 1: Abrir directamente

Abre `index.html` en el navegador (doble clic o arrastrar al navegador).

En la mayoría de navegadores actuales esto funciona sin problemas porque los scripts locales se cargan desde la misma carpeta.

### Opción 2: Servidor local (recomendado)

Sirve la carpeta con cualquier servidor estático:

```powershell
cd c:\develop\src\kp\qr-standalone
python -m http.server 8080
```

Luego abre: `http://localhost:8080`

Alternativas equivalentes:

```powershell
# PHP
php -S localhost:8080

# npx (si tienes Node.js)
npx serve .
```

## Dependencias

| Recurso | Origen | Uso |
|---------|--------|-----|
| [qrcodejs](https://github.com/davidshimjs/qrcodejs) | `js/qrcode.min.js` (local) | Renderizado del QR |
| Bootstrap 5.3.3 | CDN (jsDelivr) | Layout y componentes UI |
| Bootstrap Icons 1.11.3 | CDN (jsDelivr) | Iconografía |

Para despliegue offline, descarga Bootstrap e Icons y actualiza las rutas en `index.html`.

## Tipos de contenido y formato codificado

| Tipo | Descripción | Formato generado |
|------|-------------|------------------|
| Texto libre | Cualquier cadena de texto | Texto tal cual |
| URL / enlace | Sitio web | Si no incluye esquema, se antepone `https://` |
| WiFi | Credenciales de red | `WIFI:T:{WPA\|WEP\|nopass};S:{SSID};P:{pass};H:{true\|false};;` |
| Correo | Email con campos opcionales | `mailto:{email}?subject=...&body=...` |
| Teléfono | Número telefónico | `tel:{numero}` (espacios eliminados) |

El campo **Contenido codificado** en la interfaz muestra en tiempo real la cadena que se insertará en el QR.

### Detalle WiFi

- Los caracteres especiales en SSID y contraseña se escapan según el estándar común (`\`, `;`, `:`, `,`).
- `H:true` indica red oculta; `H:false` red visible.

## Opciones configurables

| Opción | Rango / valores | Descripción |
|--------|-----------------|-------------|
| Tamaño | 128–512 px (pasos de 32) | Dimensiones del canvas/imagen |
| Corrección de errores | L, M, Q, H | Nivel de redundancia (7%, 15%, 25%, 30%) |
| Color del código | Selector de color | Módulos oscuros del QR |
| Color de fondo | Selector de color | Fondo del QR |

La vista previa se actualiza automáticamente con un debounce de ~200 ms al cambiar cualquier campo.

## Exportación

- **Descargar PNG:** genera un archivo `qrcode-{timestamp}.png` desde el canvas.
- **Copiar imagen:** usa la Clipboard API (`navigator.clipboard` + `ClipboardItem`). Si el navegador no lo soporta, se muestra un aviso para usar la descarga.

## Compatibilidad del navegador

| Funcionalidad | Requisito |
|---------------|-----------|
| Generación QR | Canvas o SVG (qrcodejs elige según el navegador) |
| Descarga PNG | `<canvas>` + `toDataURL` |
| Copiar imagen | Clipboard API + `ClipboardItem` (HTTPS o localhost) |

Probado conceptualmente en Chrome, Edge y Firefox recientes. La copia al portapapeles puede fallar en contextos `file://` según el navegador.

## Integración en otro proyecto

Para reutilizar solo la lógica:

1. Copia `js/qrcode.min.js` y `js/qrcode-tool.js`.
2. Incluye los mismos IDs de elementos HTML que espera `qrcode-tool.js` (ver `index.html`).
3. Carga los scripts al final del `<body>`:

```html
<script src="js/qrcode.min.js"></script>
<script src="js/qrcode-tool.js"></script>
```

`qrcode-tool.js` es autocontenido: se ejecuta al cargar y enlaza los eventos del DOM. No expone API global adicional.

## Despliegue

Sube la carpeta completa a cualquier hosting estático (Nginx, Apache, S3, GitHub Pages, Netlify, etc.). No hay variables de entorno ni configuración de servidor.

Asegúrate de que existan las rutas:

- `/index.html`
- `/css/styles.css`
- `/js/qrcode.min.js`
- `/js/qrcode-tool.js`

## Origen

Basado en el módulo **Generador QR** de `admin.kope.cl`, adaptado como aplicación standalone sin framework PHP.
