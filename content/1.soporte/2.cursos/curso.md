---
title: 'Curso - Cursos - Soporte - Intranet'
---
# Curso
* * *

🔗 Los cursos son configurables desde [/admin/cursos](/admin/cursos)

Primero hay que entender que los cursos como tal, no van a ser los que finalmente se reflejen
como los cursos visibles y asignables, para esto último están las secciones. Las cuales forman
parte de un curso, y que `curso + sección`, se convierte en un curso visible.


📌 Ejemplo: Si se crea el curso **_Primero medio_**, este no va a ser visible ni asignable a nada,
pero si luego se crea la sección **_A_**, entonces un curso visible sería **_Primero medio A_** 🚀

## Ciclos

Previo a comenzar a crear cursos, se necesitará primero inicializar algunos ciclos. Los ciclos son una forma de encapsular cierta porción de cursos de la manera que usted convenga.

📌 Ejemplo: Crear el **_Primer ciclo_**, el cual comprende desde **_Primero básico_** hasta
**_Cuarto básico_**

## Creación de cursos

Para crear un curso en **➕ Crear curso** se requerirá:

- Nombre del curso
- Ciclo
- Nivel

El `nivel` sirve para tener una segmentación lógica de qué curso va antes o después que otro.

📌 Ejemplo: Si se creó **_Primero básico_** y se le asigna `nivel 1`. Y quiero que prosiga
**_Segundo básico_**, entonces a este último le asigno `nivel 2`.

❗ No existen niveles negativos, por ende, siempre el primer `nivel` será el 1.

## Advertencias de cursos
Existen 3 advertencias a la hora de crear cursos.

- No existe el primer grado
- No son consecutivos los niveles/grados
- No existe final de nivel/grado

Donde:

`No existe el primer grado` es para advertir que no hay un curso base, o curso con `nivel 1.`

`No son consecutivos los niveles/grados` es para advertir que existe un salto de más de un nivel
entre curso y curso.

📌 Ejemplo: Existen 3 cursos. **_Primer básico_** con `nivel 1`, **_Segundo básico_** con `nivel 2`
y **_Cuarto básico_** con `nivel 4`. Por ende hay un salto de 2 niveles en alguno de estos cursos.

`No existe final de nivel/grado`. Al momento de crear los cursos, se podrá dar cuenta que existe una celda que indica
si un curso es final o no, esto porque no se infiere quién es el último curso, usted debe explicitamente
decir quién va a ser su último curso, con el cuál se 🎓 egresará del colegio/institución.

❗ De no obedecer las advertencias pueden ocurrir ciertos errores a la hora de manejar el aula virtual.

## Secciones

Cursos - Secciones 👉 [/soporte/cursos/secciones](/soporte/cursos/secciones)
