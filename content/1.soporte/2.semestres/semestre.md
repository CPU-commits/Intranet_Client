---
title: 'Semestre - Semestres - Soporte - Intranet'
---
# Semestre
* * *

🔗 Los semestres son configurables desde [/admin/semestres](/admin/semestres)

Para crear un semestre se requerirá:

- Año
- Semestre

Los semestres se crean con el estado por defecto `En espera`. Los estados de un semestre son:

- En espera **(Defecto)**
- Vigente
- Finalizado

Donde:

`En espera` es cuando un semestre está recientemente creado y está en espera de ser
incializado, proceso el cual los lleva al siguiente estado.

`Vigente`, siendo el segundo estado. Este se activa al estar inicializado un semestre. Solo
puede existir un semestre inicializado a la vez.

`Finalizado` es el último proceso por el que pasa un semestre, es cuando este deja de estar
vigente y pasa a a estar en un estado de conclusión. Al estar un semestre concluido,
todos los datos recopilados pasan a estar archivados en [/admin/archivado](/admin/archivado)

## Inicializar semestre

Inicializar un semestre activa ciertas acciones de manera automática. Entre estas está
activar todos los módulos de [/admin/aula_virtual](/admin/aula_virtual) disponibles a activar.
Para conocer más sobre cómo, y qué activa exactamente de `aula virtual`, documentese de esto en
[/soporte/aula_virtual](/soporte/aula_virtual)

Entre otras cosas que permite inicializar un semestre, está permitir usar el servicio de 📖 libro
de vida, ya que permite escribir anotaciones **desde el semestre inicializado hacía atras**.

📌 Ejemplo: Si inicializa el semestre **_2022 1°_**, podrá escribir anotaciones desde el año
2022 hacia atras, y solo del primer periodo.

Adicionalmente, podrá activar 👔 [/admin/estudiantes/votaciones](/admin/estudiantes/votaciones).

❗ Al inicializar un semestre este no podrá retrocer al estado `En espera`.

Semestres - Cierre de semestre 👉 [/soporte/semestres/cierre_semestre](/soporte/semestres/cierre_semestre)
