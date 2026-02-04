import { z } from 'zod';

const addUserSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.union([
    z.string().min(1, { message: 'Role is required' }),
    z.array(z.string()).min(1, { message: 'At least one role is required' })
  ]),
  organizationHierarchy: z.string().min(1, { message: 'Organization Hierarchy is required' }),
});

export default addUserSchema;