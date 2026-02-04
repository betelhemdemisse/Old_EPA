import { z } from 'zod';

export const addRoleAndPermissionSchema = z.object({
  role: z.string().min(2, { message: 'Role Name is required' }),
  permission: z.string().min(2, { message: 'Permission is required' }),
  description: z.string().optional(),

});

export default addRoleAndPermissionSchema;
