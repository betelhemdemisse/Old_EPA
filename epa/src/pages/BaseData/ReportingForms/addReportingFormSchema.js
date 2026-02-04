import { z } from "zod";

const addReportingFormSchema = z.object({
  report_form: z
    .string()
    .min(2, "Form name is required"),

  input_type: z
    .string()
    .min(1, "Input type is required"),

  options: z
    .array(
      z.union([
        z.string(),
        z.object({
          label: z.string(),
          value: z.string().optional(),
        })
      ])
    )
    .optional(),

  required: z.boolean(),

  form_type_id: z
    .string()
    .min(1, "Form type is required"),

  report_type_id: z
    .string()
    .min(1, "Report type is required"),
});

export default addReportingFormSchema;
