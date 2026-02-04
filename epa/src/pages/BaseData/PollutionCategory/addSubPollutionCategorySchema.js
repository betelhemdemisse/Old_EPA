import { z } from "zod";

const addSubPollutionCategorySchema = z.object({
  sub_pollution_category: z
    .string()
    .min(1, "Sub-category is required"),

  investigation_days: z
    .number({
      required_error: "Investigation days is required",
      invalid_type_error: "Investigation days must be a number",
    })
    .int("Investigation days must be an integer")
    .positive("Investigation days must be greater than 0"),

  description: z.string().optional(),
});

export default addSubPollutionCategorySchema;
