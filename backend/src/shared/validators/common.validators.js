const { z } = require('zod');
const mongoose = require('mongoose');

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'El email es obligatorio')
  .email('El email no es válido');

const passwordSchema = z
  .string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
  .regex(/[a-z]/, 'La contraseña debe tener al menos una letra minúscula')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe tener al menos un carácter especial');

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Identificador inválido',
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

module.exports = { emailSchema, passwordSchema, objectIdSchema, paginationSchema };
