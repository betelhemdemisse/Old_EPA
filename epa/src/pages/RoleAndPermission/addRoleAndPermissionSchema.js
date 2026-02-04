import { z } from 'zod';

export const addRoleAndPermissionSchema = z.object({
  role: z.string().min(2, { message: 'Role Name is required' }),
  permission: z.array(z.string().uuid()).min(1, { message: 'Permission is required' }),
  description: z.string().optional(),
});

export default addRoleAndPermissionSchema;
