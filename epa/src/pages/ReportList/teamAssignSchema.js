// teamAssignSchema.js
import { z } from "zod";

export const teamAssignSchema = z.object({
  department: z.string().min(1, "Department is required"),
  expert: z.array(z.string()).min(1, "At least one expert is required"),
  description: z.string().optional(),
});
