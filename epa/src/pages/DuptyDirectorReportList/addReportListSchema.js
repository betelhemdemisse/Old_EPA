import { z } from 'zod';

export const addUserSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.string().min(1, { message: 'Role is required' }),
  institution: z.string().optional(),
  department: z.string().optional(),
  region: z.string().optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
});

export default addUserSchema;
