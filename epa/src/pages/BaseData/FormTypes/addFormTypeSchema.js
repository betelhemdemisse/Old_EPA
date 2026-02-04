import { z } from "zod";

export default z.object({
  form_type: z.string().min(2, "Form Type is required"),
  description: z.string().optional(),
});
