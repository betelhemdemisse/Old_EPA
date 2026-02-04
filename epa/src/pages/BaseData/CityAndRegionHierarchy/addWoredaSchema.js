import { z } from "zod";

export default z.object({
  name: z.string().min(1, "Woreda name is required"),
  subcity_id: z.string().optional(),
  zone_id: z.string().optional(),
}).refine((data) => {
  const hasSubcity = data.subcity_id !== undefined;
  const hasZone = data.zone_id !== undefined;
  return (hasSubcity && !hasZone) || (!hasSubcity && hasZone);
}, {
  message: "A woreda must be associated with either a zone_id or a subcity_id, but not both.",
  path: ["subcity_id"],
});
