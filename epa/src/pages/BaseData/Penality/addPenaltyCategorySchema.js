// src/pages/base-data/penalty/addPenaltyCategorySchema.js

import { z } from "zod";

const addPenaltyCategorySchema = z.object({
  penalty_name: z
    .string()
    .trim()
    .min(2, { message: "Penalty category name must be at least 2 characters" })
    .max(100, { message: "Penalty category name must not exceed 100 characters" })
    .regex(/^[A-Za-z0-9\s&,-.()]+$/, {
      message: "Only letters, numbers, spaces, and common symbols (& , - . ( )) are allowed",
    }),

  description: z
    .string()
    .max(500, { message: "Description must not exceed 500 characters" })
    .optional()
    .or(z.literal("")), // allows empty string
});

export default addPenaltyCategorySchema;