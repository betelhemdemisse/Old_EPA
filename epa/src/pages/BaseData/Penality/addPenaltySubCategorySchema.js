import { z } from "zod";

export default z.object({
  issue_type: z
    .string()
    .min(2, "Sub-penalty name must be at least 2 characters")
    .max(100, "Sub-penalty name too long"),
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .or(z.literal("")),
});