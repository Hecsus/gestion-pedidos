# Revisión del código

Este documento resume la revisión realizada sobre el proyecto junto con
posibles redundancias encontradas y mejoras.

## Funcionalidades duplicadas o archivos innecesarios

- **Middlewares duplicados:** existían tres archivos en `middlewares/`
  (`authMiddleware.js`, `verificarAdmin.js` y `verificarSesion.js`) que
  implementaban verificaciones de sesión y rol ya disponibles en
  `middlewares/auth.js`. Ninguno de estos ficheros se utilizaba en el
  código, por lo que se han eliminado para evitar confusión.
- **Script de arranque `bin/www`:** era una variante del arranque de
  Express Generator que no se empleaba porque la aplicación utiliza
  `app.js` como punto de entrada. Se ha eliminado la carpeta `bin/`.
- **Hoja de estilos sin uso:** en `public/stylesheets/style.css` se
  mantenía la hoja de estilos generada por defecto. Ninguna plantilla la
  incluía, así que se ha eliminado.

La eliminación de estos archivos no afecta al funcionamiento de la
aplicación, ya que ninguna ruta los requería.

## Posibles mejoras en la estructura

- Centralizar la carga de cabeceras y pies mediante las plantillas de
  `views/partials` ya evita repetir código. No se observan duplicados en
  las vistas principales.
- Podría considerarse añadir más pruebas automáticas (tests) o un
  linter para asegurar la calidad del código de forma continuada.

## Código sin uso

Después de revisar los controladores y rutas no se encontraron funciones
muertas. Todo el código presente se invoca desde alguna ruta o desde el
servidor de sockets.

## Dependencias

Todas las dependencias listadas en `package.json` se utilizan en el
proyecto. No se detectaron paquetes sin uso.

