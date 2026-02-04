import { z } from "zod";

const addSubPollutionCategorySchema = z.object({
    pollution_category_id: z.coerce.number().int().positive(),
    sub_pollution_category: z.string().min(2),
    description: z.string().optional(),
});

export default addSubPollutionCategorySchema;
