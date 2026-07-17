using Microsoft.EntityFrameworkCore;
using Registro_de_personas_prueba.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Permite validar el token antiforgery enviado por AJAX en una cabecera HTTP.
builder.Services.AddAntiforgery(options => options.HeaderName = "RequestVerificationToken");

// Configuración de la conexión a MySQL Server mediante Entity Framework Core (Pomelo).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'DefaultConnection'.");

// Versión del servidor MySQL. Se lee de "MySql:ServerVersion" en appsettings.json
// (por ejemplo "8.0.36"). Usar una versión explícita evita depender de una
// conexión activa al generar migraciones en tiempo de diseño.
var serverVersion = new MySqlServerVersion(
    new Version(builder.Configuration["MySql:ServerVersion"] ?? "8.0.36"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));

var app = builder.Build();

// Aplica automáticamente las migraciones pendientes y crea la base de datos si no existe.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Personas}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
