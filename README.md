# EduRepo · Diseño y prototipo de repositorio (Actividad 2)

Prototipo navegable de un **repositorio temático de Recursos Educativos Digitales** para la Especialización en Didáctica TIC — Universidad de Cartagena.

## Qué cubre (según la guía)
- Tipos de recursos: video, guía, OVA, infografía, simulador, presentación, libro digital, actividad interactiva
- Metadatos (Dublin Core adaptado): título, autor, tipo, área, nivel, descripción, licencia, formato, fecha, idioma, URL
- Roles: Administrador / Docente curador / Estudiante (switch demo en el header)
- Flujos: carga (borrador → revisión → publicado) y descarga (buscar → ficha → descargar)
- Búsqueda, filtros por tipo/área/nivel, orden y evaluación 1-5 + contador de descargas
- Teoría: repositorio vs biblioteca + tipos de repositorios (insumo para el PDF)

## Stack
Solo frontend (sin backend por decisión del equipo):
- React 19 + Vite 8, CSS puro, `localStorage` como persistencia demo

## Cómo correrlo
```bash
npm install
npm run dev
```

## Para la entrega (PDF APA v7)
1. Despliega en Vercel/Netlify y copia el enlace
2. PDF debe traer: portada, introducción/descripción, producto + enlace, citas, referencias APA v7
3. Respetar Ley 23 de 1982 y Ley 1915 de 2018 + declarar uso de IA

## Estructura
- `src/data/recursos.js` — 12 recursos seed + tipos, áreas, niveles, roles
- `src/App.jsx` — vistas: inicio, explorar, subir, roles, teoría + ficha detalle
- `src/index.css` — tema morado/amarillo Unicartagena
