// src/pages/base-data/sound-area/addSoundAreaSchema.js
import { z } from "zod";

const addSoundAreaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Sound area name is required" })
    .max(255, { message: "Name must be less than 255 characters" }),

  description: z
    .string()
    .trim()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
    .or(z.literal("")),
});

export default addSoundAreaSchema;
