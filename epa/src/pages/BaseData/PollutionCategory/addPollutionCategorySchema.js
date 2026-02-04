import { z } from "zod";

export default z.object({
  pollution_category: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  is_sound: z.boolean().optional(),
});
