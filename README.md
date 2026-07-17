# Registro de Personas — CRUD ASP.NET Core 10 MVC + MySQL

Aplicación web CRUD desarrollada con **ASP.NET Core 10 (MVC)** y **Entity Framework Core** conectada a **MySQL Server**. Gestiona registros de personas en una **única tabla** (`Personas`) con los campos:

- Primer Apellido
- Segundo Apellido
- Nombres
- Dirección
- Sexo

## Requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/) (ya instalado: 10.0.302)
- Un servidor **MySQL** en ejecución (MySQL 5.7 / 8.x)

## Configuración de la base de datos

Edita la cadena de conexión en [`appsettings.json`](appsettings.json) con tus credenciales de MySQL:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=RegistroPersonasDb;User=root;Password=TU_PASSWORD;TreatTinyAsBoolean=true;"
},
"MySql": {
  "ServerVersion": "8.0.36"
}
```

- **Server / Port**: host y puerto de tu MySQL.
- **Database**: nombre de la base de datos (se crea automáticamente si no existe).
- **User / Password**: credenciales de acceso.
- **MySql:ServerVersion**: versión de tu servidor MySQL (ej. `8.0.36`, `5.7.44`). Se usa para que EF Core genere el SQL adecuado sin depender de una conexión activa.

No necesitas crear la base de datos ni la tabla manualmente: al iniciar, la aplicación **aplica las migraciones automáticamente** (`db.Database.Migrate()` en [`Program.cs`](Program.cs)) y crea la base de datos y la tabla `Personas`.

## Ejecución

```bash
dotnet run
```

Luego abre la URL que muestra la consola (por ejemplo `http://localhost:5xxx`). La página de inicio es directamente el listado de personas.

## Comandos útiles de migraciones (opcional)

```bash
# Crear una nueva migración tras cambiar el modelo
dotnet ef migrations add NombreDeLaMigracion

# Aplicar migraciones manualmente a la base de datos
dotnet ef database update

# Ver el script SQL que se ejecutará
dotnet ef migrations script
```

## Notas técnicas

- El proyecto tiene como destino **net10.0** y usa **ASP.NET Core 10 MVC**.
- El acceso a datos usa **Entity Framework Core 9** con el proveedor **Pomelo.EntityFrameworkCore.MySql 9.0.0** (la versión estable más reciente con soporte para MySQL; totalmente compatible con el runtime .NET 10). Cuando Pomelo publique una versión para EF Core 10, basta con actualizar los paquetes.
