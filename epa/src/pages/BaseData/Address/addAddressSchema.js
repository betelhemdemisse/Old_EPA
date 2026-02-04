// addAddressSchema.js
import { z } from "zod";

const addAddressSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name is too long"),

  latitude: z
    .string()
    .min(1, "Latitude is required")
    .regex(
      /^-?\d+(\.\d+)?$/,
      "Latitude must be a valid number"
    ),

  longitude: z
    .string()
    .min(1, "Longitude is required")
    .regex(
      /^-?\d+(\.\d+)?$/,
      "Longitude must be a valid number"
    ),

  phone_number: z
    .string()
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),

  description: z.string().optional().or(z.literal("")),
});

export default addAddressSchema;
