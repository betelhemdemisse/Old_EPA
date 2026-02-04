import { z } from "zod";

export default z.object({
  region_name: z.string().min(1, "Region name is required"),
  description: z.string().optional(), 
});
