using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Registro_de_personas_prueba.Data;
using Registro_de_personas_prueba.Models;

namespace Registro_de_personas_prueba.Controllers;

public class PersonasController : Controller
{
    private readonly ApplicationDbContext _context;

    public PersonasController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /Personas
    // Página principal: contiene la tabla y los modales de Crear/Editar/Eliminar.
    public IActionResult Index()
    {
        return View();
    }

    // GET: /Personas/List
    // Devuelve el listado completo en JSON para refrescar la tabla vía AJAX.
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var personas = await _context.Personas
            .OrderBy(p => p.PrimerApellido)
            .ThenBy(p => p.SegundoApellido)
            .ThenBy(p => p.Nombres)
            .ToListAsync();

        return Json(personas);
    }

    // GET: /Personas/Get/<id>
    // Devuelve una persona en JSON para precargar el modal de edición.
    [HttpGet]
    public async Task<IActionResult> Get(int id)
    {
        var persona = await _context.Personas.FindAsync(id);
        if (persona == null)
        {
            return NotFound(new { success = false, message = "No se encontró la persona solicitada." });
        }

        return Json(persona);
    }

    // POST: /Personas/Save
    // Registra (Id == 0) o actualiza (Id > 0) una persona. Responde en JSON.
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Save(
        [Bind("Id,Nombres,PrimerApellido,SegundoApellido,Direccion,Sexo")] Persona persona)
    {
        if (!ModelState.IsValid)
        {
            var errores = ModelState
                .Where(kvp => kvp.Value != null && kvp.Value.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(new { success = false, errors = errores });
        }

        if (persona.Id == 0)
        {
            _context.Personas.Add(persona);
            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "La persona se registró correctamente." });
        }

        var existente = await _context.Personas.FindAsync(persona.Id);
        if (existente == null)
        {
            return NotFound(new { success = false, message = "No se encontró la persona a actualizar." });
        }

        existente.PrimerApellido = persona.PrimerApellido;
        existente.SegundoApellido = persona.SegundoApellido;
        existente.Nombres = persona.Nombres;
        existente.Direccion = persona.Direccion;
        existente.Sexo = persona.Sexo;

        await _context.SaveChangesAsync();
        return Json(new { success = true, message = "Los datos se actualizaron correctamente." });
    }

    // DELETE: /Personas/Delete/<id>
    // Elimina una persona. Responde en JSON.
    [HttpDelete]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var persona = await _context.Personas.FindAsync(id);
        if (persona == null)
        {
            return NotFound(new { success = false, message = "No se encontró la persona a eliminar." });
        }

        _context.Personas.Remove(persona);
        await _context.SaveChangesAsync();
        return Json(new { success = true, message = "La persona se eliminó correctamente." });
    }
}
