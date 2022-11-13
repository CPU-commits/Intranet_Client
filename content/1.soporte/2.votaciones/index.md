---
title: 'Votaciones - Soporte - Intranet'
---
# Votaciones
* * *

🔗 Las votaciones se administran desde [/admin/estudiantes/votaciones](/admin/estudiantes/votaciones)

Las votaciones son una funcionalidad opcional que permite instanciar un proceso el cual
permite votar por 📄 listas conformadas por 👨‍🎓👩‍🎓 alumnos.

Las votaciones pueden ser máximo una vez por semestre. Estas listas son creadas por
administrativos de la Intranet.

Existen cuatro estados en una votación:
- Cerradas
- Abiertas
- Subidas
- En progreso

Cuando las votaciones están en el estado de `cerradas`, es el momento de impedimento para
abrir nuevas votaciones. Esto dado a lo explicado anteriormente, es decir, solo puede haber
una votación por semestre.

`Abiertas` es cuando es posible abrir unas nuevas votaciones.

`Subidas` es el estado cuando se abren unas votaciones, mas, todavía no se abren a los
estudiantes **(más adelante se explicará esto)**.

`En progreso` es cuando el estudiante tiene acceso a ver las listas y votar por ellas.

Las votaciones se estructuan de la siguiente forma:

- Fecha de inicio
- Fecha de cierre
- Periodo
- Listas

La fecha de inicio es cuando, en qué momento, se actualiza el estado de `subidas` a `en progreso`.

La fecha de cierre da termino al estado `en progreso` y da los resultados de la votación a
través de una 📰 noticia 🤖 automátizada. A la vez, que actualiza a los estudiantes ganadores
de la votación como `estudiantes administrativos`. 

🚧 Se actualiza el estado como `cerradas`, hasta que esté vigente un nuevo semestre.

El periodo es por cuánto tiempo los alumnos ganadores serán `estudiantes administrativos`.
Esto último, se puede ver sobreescrito si se generan nuevas votaciones con nuevos ganadores,
independiente de si todavía estén en periodo de `estudiantes administrativos`.

Por último las listas son conformaciones de estudiantes por los cuales votar.
