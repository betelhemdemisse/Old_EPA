// src/pages/base-data/rejection-reason/addRejectionReasonSchema.js
import { z } from "zod";

const addRejectionReasonSchema = z.object({
  reason: z
    .string()
    .min(1, "Rejection reason is required")
    .max(255, "Rejection reason must be less than 255 characters"),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export default addRejectionReasonSchema;
