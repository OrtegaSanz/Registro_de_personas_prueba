using Microsoft.EntityFrameworkCore;
using Registro_de_personas_prueba.Models;

namespace Registro_de_personas_prueba.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Persona> Personas => Set<Persona>();
}
