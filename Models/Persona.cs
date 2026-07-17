using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Registro_de_personas_prueba.Models;

[Table("Personas")]
public class Persona
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Los nombres son obligatorios.")]
    [StringLength(150, ErrorMessage = "Los nombres no pueden superar los 100 caracteres.")]
    [Display(Name = "Nombres")]
    public string Nombres { get; set; } = string.Empty;

    [Required(ErrorMessage = "El primer apellido es obligatorio.")]
    [StringLength(100, ErrorMessage = "El primer apellido no puede superar los 100 caracteres.")]
    [Display(Name = "Primer Apellido")]
    public string PrimerApellido { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "El segundo apellido no puede superar los 100 caracteres.")]
    [Display(Name = "Segundo Apellido")]
    public string? SegundoApellido { get; set; }

    [Required(ErrorMessage = "La dirección es obligatoria.")]
    [StringLength(250, ErrorMessage = "La dirección no puede superar los 250 caracteres.")]
    [Display(Name = "Dirección")]
    public string Direccion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El sexo es obligatorio.")]
    [StringLength(20)]
    [Display(Name = "Sexo")]
    public string Sexo { get; set; } = string.Empty;
}
