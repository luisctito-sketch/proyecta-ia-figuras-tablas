# PROYECTA-IA — Figuras, Tablas y Redacción Científica

Módulo transversal para todos los capítulos del Proyecto de Grado.

## Funciones

- Enseña el formato institucional de figuras.
- Enseña el formato institucional de tablas.
- Genera y revisa numeración por capítulo: `Fig. C.N.` y `Tabla C.N.`.
- Comprueba que la figura o tabla sea citada desde el párrafo anterior.
- Comprueba que exista interpretación después del elemento.
- Revisa fuente y nota.
- Distingue fuente propia de fuente externa/modificada.
- Incluye modelos visuales propios.
- Explica tablas continuadas en página siguiente.
- Calcula resolución efectiva de impresión a partir de píxeles y tamaño en Word.
- Aplica umbral recomendado de 300 ppp para impresión.
- Detecta primera persona singular/plural y sugiere redacción impersonal.
- Incluye enlaces a APA 6 y APA 6 en Word.
- Genera prompt para revisión visual profunda en ChatGPT.

## Formato de figuras

- Título encima.
- `Fig. C.N. Título.`
- Times New Roman 10 pt.
- Negrilla.
- Centrado.
- Punto final.
- Marco negro.
- Resolución efectiva mínima recomendada: 300 ppp.
- Fuente y Nota debajo, alineadas a la izquierda.
- Solo `Fuente:` y `Nota:` en negrilla.
- Fuente propia: `Elaboración propia (año).`
- Fuente externa: autor / institución / empresa y año.

## Formato de tablas

- `Tabla C.N. Título.`
- Título centrado, negrilla, Times New Roman 10 pt.
- Encabezados centrados y en negrilla.
- Cuerpo: Times New Roman 10, sin negrilla.
- Sin líneas horizontales internas en el cuerpo.
- Líneas verticales y estructura externa según la plantilla institucional.
- Si continúa: `(continuación).` y repetir encabezados.

## Regla transversal de redacción

Evitar primera persona:
- desarrollamos → se desarrolló
- hicimos → se realizó
- medimos → se midió / se realizaron mediciones
- implementamos → se implementó
- seleccionamos → se seleccionó
- podemos observar → se observa

## Acceso

Mantiene el acceso central:

`https://luisctito-sketch.github.io/proyecta-ia-acceso/access.js`

## Repositorio sugerido

`proyecta-ia-figuras-tablas`

URL esperada:

`https://luisctito-sketch.github.io/proyecta-ia-figuras-tablas/`

## Archivos

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

## Ejemplos de Fuente y Nota añadidos

El módulo incluye ahora cuatro ejemplos explícitos:

- figura de elaboración propia;
- figura obtenida de un sitio web;
- tabla de elaboración propia;
- tabla construida con datos obtenidos de un sitio web.

Regla institucional reforzada: el año va siempre entre paréntesis cuando existe información de año:

- `Fuente: Elaboración propia (2026).`
- `Fuente: Hornos de panificación G.PANIZ (2026).`
- `Fuente: [Autor/empresa/institución] (2026).`

La URL y la fecha de consulta se colocan en `Nota:` cuando correspondan. Si la fuente no informa fecha, no se inventa un año; debe resolverse como fuente sin fecha mediante el módulo APA.
