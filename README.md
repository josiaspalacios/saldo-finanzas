# Saldo — Finanzas personales

Aplicación de finanzas personales construida con React, TypeScript, Vite, React Router y Recharts. Cada herramienta tiene su propio módulo para que puedas revisar tu panorama financiero, gestionar el historial, planificar un presupuesto y configurar privacidad sin amontonar todo en una sola pantalla.

## Ejecutar en desarrollo

Requiere Node.js 20.19+ o 22.12+.

```sh
npm install
npm run dev
```

Abre [http://localhost:8000](http://localhost:8000).

## Secciones

- **Resumen:** balance del mes, gráficas y actividad reciente.
- **Movimientos:** historial completo, búsqueda, filtros y exportación CSV.
- **Presupuesto:** objetivo mensual, progreso y categorías de gasto.
- **Preferencias:** moneda, tema, respaldo y restauración de datos.

Cada herramienta tiene su propia pantalla, con navegación dedicada y filtros o controles en el contexto que corresponde. La navegación utiliza URLs con hash para funcionar correctamente en GitHub Pages, un alojamiento de páginas estáticas.

## Comprobaciones

```sh
npm run typecheck
npm test
npm run build
```

## Privacidad y respaldos

Los movimientos y las preferencias se guardan en `localStorage` del navegador. No se envían a un servidor ni se sincronizan automáticamente con otros dispositivos. El código fuente publicado no contiene movimientos ni respaldos personales. Usa **Preferencias → Respaldo personal** para descargar una copia JSON y restaurarla en otro navegador. **Exportar CSV** descarga la selección actual. La moneda cambia la visualización de los importes; no realiza conversión de divisas.

Los datos guardados por la versión previa en `localhost:8000` se migran automáticamente la primera vez que se abre la aplicación en el mismo navegador. Una publicación de GitHub Pages tiene un origen diferente y no puede leer el almacenamiento local de `localhost`: descarga antes el respaldo desde el preview y restáuralo en la versión publicada si quieres trasladar esos registros.

## Publicación

El flujo de GitHub Actions de `.github/workflows/deploy.yml` ejecuta el chequeo de tipos, las pruebas y la compilación y, cuando se habilita **GitHub Pages → Build and deployment → GitHub Actions** en el repositorio, publica automáticamente los cambios enviados a `main`.
