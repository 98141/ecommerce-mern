import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(10, 'Debe tener al menos 10 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial');

export const emailSchema = z.string().trim().min(1, 'El email es obligatorio').email('El email no es válido');
