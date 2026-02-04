import { z } from "zod";

export default z.object({
  name: z.string().min(1, "Zone name is required"),
  description: z.string().optional(),
});
