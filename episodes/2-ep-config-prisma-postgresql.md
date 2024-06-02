# Episodio 2: Configuración de Prisma y PostgreSQL

En este episodio, configuraremos Prisma y PostgreSQL para nuestro proyecto de autenticación. Aprenderemos a instalar PostgreSQL, configurar Prisma y realizar una migración inicial de la base de datos.

Prisma es un ORM de código abierto de próxima generación. Consta de las siguientes partes:

- [Prisma Client](https://www.prisma.io/docs/orm/prisma-client): auto-generated y type-safe query builder para Node.js y TypeScript.
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate): Sistema de migración.
- [Prisma Studio](https://www.prisma.io/docs/orm/tools/prisma-studio): GUI para ver y editar datos en tu base de datos.

## Prerequisitos

- Para completar con éxito esta guía, necesitas:

  - Tener [Node.js](https://nodejs.org/en/) v16.13.0 o superior instalado en tu máquina. Ver [guia de instalacion de Node](./1-ep-intro-y-config.md#prerequisitos).
  - Tener un servidor de base de datos [PostgreSQL](https://www.postgresql.org/) en ejecución.

  En caso que no tengas PostgreSQL instalado aca te explico cómo hacerlo:

  ### **Instalación de PostgreSQL**

  - **Para macOS:**
    - Usar Homebrew para instalar PostgreSQL:
      ```bash
      brew install postgresql
      ```
    - Iniciar el servicio de PostgreSQL:
      ```bash
      brew services start postgresql
      ```
  - **Para Linux (Debian/Ubuntu):**
    - Instalar PostgreSQL:
      ```bash
      sudo apt update
      sudo apt install postgresql postgresql-contrib
      ```
    - Iniciar el servicio de PostgreSQL:
      ```bash
      sudo service postgresql start
      ```
  - **Para Windows:**

    - Descargar e instalar PostgreSQL desde la página oficial: [PostgreSQL Downloads](https://www.postgresql.org/download/)
    - Durante la instalación, tomar nota de la contraseña del usuario `postgres`.
    - Asegurarse de que el directorio de binarios de PostgreSQL esté en el PATH del sistema. Por ejemplo, si PostgreSQL está instalado en `C:\Program Files\PostgreSQL\13\bin`, agregar esta ruta al PATH del sistema.

  En caso que no recuerdes la contraseña para ingresar a la terminal de postgres, sigue los siguientes pasos:

  ### **Pasos para Restablecer la Contraseña**

  1. **Chequea la version de PostgreSQL**:
     Abre la terminal y escribe:

     ```bash
     postgres --version
     ```

  2. **Editar el Archivo `pg_hba.conf`**:

     - **Para macOS y Linux**:

       Abre una terminal y edita el archivo `pg_hba.conf` con un editor de texto (por ejemplo, vim). La ubicación típica es:

       Si tienes macOS:

       ```bash
       sudo vim /usr/local/var/postgres/pg_hba.conf
       ```

       Si tienes CentOS o RedHat:

       ```bash
       sudo vim /var/lib/pgsql/data/pg_hba.conf
       ```

       Si tienes Ubuntu o Debian:

       ```bash
       sudo vim /var/lib/postgresql/<versión de postgres>/main/pg_hba.conf
       ```

     - **Para Windows**:

       Abre el Explorador de Archivos y navega hasta el directorio de datos de PostgreSQL. La ubicación típica es:

       ```plaintext
       C:\Program Files\PostgreSQL\<versión de postgres>\data\
       ```

       Busca y abre el archivo `pg_hba.conf` con un editor de texto (por ejemplo, Notepad o Notepad++).

  3. **Cambiar el Método de Autenticación a `trust`**:
     Encuentra las líneas que contienen `local` y `host` y cambia el método de autenticación a `trust`. Ejemplo:

     ```plaintext
     # TYPE  DATABASE        USER            ADDRESS                 METHOD
     local   all             all                                     trust
     host    all             all             127.0.0.1/32            trust
     host    all             all             ::1/128                 trust
     ```

     Guarda el archivo y cierra el editor de texto.

  4. **Reiniciar PostgreSQL**:

     - Para macOS:

       ```bash
       brew services restart postgresql
       ```

     - Para Linux:

       ```bash
       sudo systemctl restart postgresql
       ```

     - Para Windows:

       Abre el "Administrador de Servicios" (puedes buscar "Servicios" en el menú Inicio), encuentra el servicio de PostgreSQL, selecciónalo y haz clic en "Reiniciar" o "Restart".

  5. **Abrir el Cliente de PostgreSQL (`psql`)**:

     ```bash
     psql -U postgres
     ```

  6. **Cambiar la Contraseña del Usuario `postgres`**:
     Una vez en la consola de PostgreSQL, cambia la contraseña del usuario `postgres`:

     ```sql
     ALTER USER postgres WITH PASSWORD 'nueva_contraseña';
     ```

  7. **Salir del Cliente de PostgreSQL**:

     ```sql
     \q
     ```

  8. **Restaurar la Configuración Original:**:
     Vuelve a editar el archivo `pg_hba.conf` y restaura el método de autenticación original (normalmente `md5`, `peer` o `scram-sha-256`):

     ```plaintext
     # TYPE  DATABASE        USER            ADDRESS                 METHOD
     local   all             all                                     scram-sha-256
     host    all             all             127.0.0.1/32            scram-sha-256
     host    all             all             ::1/128                 scram-sha-256
     ```

     Guarda el archivo y cierra el editor de texto.

  9. **Reiniciar PostgreSQL nuevamente**:
     Vuelve a hacer el paso 3.

  10. **Verificación**:
      Una vez realizados estos pasos, deberías poder acceder a PostgreSQL con la nueva contraseña:

      ```bash
      psql -U postgres -W
      ```

      Te pedirá la nueva contraseña y luego te permitirá acceder a la consola de PostgreSQL.

## Pasos

1. **Configuración de la Base de Datos**

   Crear una base de datos para el proyecto. Asegúrate de que PostgreSQL está en el PATH o proporciona la ruta completa al comando `createdb`:

   ```bash
   createdb -U postgres authentication_db
   ```

   Si el comando `createdb` no está disponible directamente, asegúrate de que el PATH incluye el directorio de binarios de PostgreSQL. Lo puedes hacer de la siguiente manera

   - **Para macOS y Linux:**

     ```bash
     echo 'export PATH="/usr/local/pgsql/bin:$PATH"' >> ~/.bashrc
     source ~/.bashrc
     ```

   - **Para Windows:**
     Agregar el directorio de binarios manualmente en la configuración de variables de entorno del sistema como hicimos en el [episodio 1](./1-ep-intro-y-config.md).

   **Nota: Si no recuerdas la contraseña anda a la seccion `Prerequisitos -> Pasos para Restablecer la Contraseña`.**

   Acceder a la consola de PostgreSQL:

   ```bash
   psql -U postgres
   ```

   Dentro de la consola, crear un nuevo usuario y asignarle permisos:

   ```sql
   CREATE USER auth_user WITH ENCRYPTED PASSWORD 'password' CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE authentication_db TO auth_user;
   ```

2. **Instalación y Configuración de Prisma CLI**

   Instalar las dependencias de Prisma:

   ```bash
   npm install prisma --save-dev
   ```

   Inicializar Prisma en el proyecto:

   ```bash
   npx prisma init
   ```

   Este comando hará dos cosas:

   1. Crea un nueva carpeta llamada `prisma` que contiene un archivo llamado `schema.prisma`, el cual contiene el [Prisma schema](https://www.prisma.io/docs/orm/prisma-schema) con la variable de conexión de tu base de datos y los modelos de esquema.
   2. Crea un archivo `.env` en el directorio raíz del proyecto, que se utiliza para definir variables de entorno (como la conexión de su base de datos). Nosotros la vamos a borrar porque vamos a utilizar otros nombres.

   Si todo funciona correctamente deberías recibir el siguiente mensaje en tu terminal:
   ![captura1](./images/prisma-installed.png)

3. **Configuración de las variables de entorno**

   Actualizar el archivo `.env` con la URL de la base de datos de PostgreSQL:

   ```bash
   DATABASE_URL="postgresql://auth_user:password@localhost:5432/authentication_db?schema=public"
   ```

   Agregar `.env` al archivo `.gitignore` para prevenir commitear tus variables de entorno.
   No te olvides de agregar el placeholder en nuestro archivo `.env.temp` para llevar un trackeo en git de los cambios en nuestras variables de entorno:

   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
   ```

   Aquí hay una breve explicación de cada componente:

   - **USER**: El nombre del usuario de tu base de datos.
   - **PASSWORD**: La contraseña para el usuario de tu base de datos.
   - **HOST**: El nombre de tu host (para el entorno local, es `localhost`).
   - **PORT**: El puerto donde se ejecuta su servidor de base de datos (normalmente 5432 para PostgreSQL)
   - **DATABASE**: El nombre de la base de datos.
   - **SCHEMA**: El nombre del esquema dentro de la base de datos. Si no estas seguro, puedes omitirlo o simplemente poner `public`.

4. **Definición del Esquema de Prisma**

   Agrega lo siguiente en el archivo `prisma/schema.prisma` para definir el modelo de usuario, con esto crearas las tablas en tu base de datos:

   ```prisma
    model User {
      id        Int      @id @default(autoincrement())
      email     String   @unique
      password  String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
   ```

5. **Ejecución de la Migración Inicial**

   Crear y aplicar la migración inicial para mapear tu modelo de datos al esquema de base de datos:

   ```bash
   npx prisma migrate dev --name init
   ```

   **Nota**: Opcionalmente, puedes darle un nombre a tu migración, dependiendo de los cambios que hayas realizado. Dado que esta es la primera migración del proyecto, estás configurando el indicador `--name` en `init`.

   Si todo funciona correctamente deberías recibir el siguiente mensaje en tu terminal:

   ![captura2](./images/first-migration.png)

   Este comanda hará tres cosas:

   1. Crea la shadow database, el cual es una copia temporal de tu base de datos real que Prisma utiliza para aplicar las migraciones y verificar su consistencia sin afectar tus datos reales. Esto se hace para evitar cualquier riesgo de dañar la base de datos real durante el proceso de migración. **Solo lo hace en entornos de desarrollo**.
   2. Aplica las migraciones (creacion de tabla User y sus respectivas columnas) a la shadow database.
   3. Valida que las migraciones se aplicaron correctamente.
   4. Si no hay errores, creará una carpeta `src/prisma/migrations` en tu proyecto y le agregará un nuevo archivo de migración SQL.
   5. Ejecuta el archivo de migración SQL contra la base de datos PostgreSQL.
   6. Una vez que las migraciones se aplican correctamente a la base de datos real, la shadow database se elimina.
   7. Instalará la dependencia `@prisma/client` a tu proyecto (o si ya existe lo regenerará). Tendremos en `node_modules/@prisma/client` el Prisma Client con los types de nuestros modelos.

   **Nota sobre la generación del Prisma Client**: siempre que actualices tu Prisma schema, deberás actualizar el esquema de tu base de datos utilizando `npx prisma migrate dev`. Esto mantendrá tu esquema de la base de datos sincronizado con tu Prisma schema. Además, mantendrá tu Prisma Client fuertemente tipado tomando en cuenta las tablas, columnas y relaciones definidas en tu archivo `schema.prisma`, lo que significa que proporciona autocompletado y verificación de tipos durante el desarrollo, ayudando a evitar errores y mejorar la productividad.

   ![captura3](./images/shadow-database-cartoon.png)
   ![Ver mas](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database)

   ![captura4](./images/prisma-client.png)

6. **Uso de Prisma Client**

   Crea una carpeta `src/config`

   ```bash
   mkdir src/config
   ```

   Usar Prisma Client en el proyecto para interactuar con la base de datos. Crear un archivo `src/config/prismaClient.ts` con el siguiente contenido:

   ```typescript
   import { PrismaClient } from "@prisma/client";

   const prisma = new PrismaClient();

   export default prisma;
   ```

7. **Verificación de la Configuración con Prisma Studio**

   Utilizar Prisma Studio para visualizar tus modelos de la base de datos:

   ```bash
   npx prisma studio
   ```

8. **Estructura de Carpetas actualizada**

   ```bash
   server/
   ├── prisma/
   │   ├── migrations/
   │   │   │── 20240602173127_init/
   │   │   │     │    └── migration.sql
   │   │   └── migration_lock.toml
   │   └── schema.prisma
   ├── src/
   │   ├── config/
   │   │   └── prismaClient.ts
   │   ├── app.ts
   │   └── server.ts
   ├── .env
   ├── .env.temp
   ├── tsconfig.json
   └── .gitignore
   ```
