import { z } from "zod";

const addReportTypeSchema = z.object({
  report_type: z
    .string()
    .min(1, { message: "Report Type is required" })
    .max(255, { message: "Report Type must be less than 255 characters" }),
});

export default addReportTypeSchema;
