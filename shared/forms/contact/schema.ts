import { z } from "zod"
import { contactSubjectKeys } from "./subjects"

const requiredString = (requiredMsg: string) =>
  z
    .string({
      // Zod v4: customize the "undefined" / invalid-type case
      error: (issue) => (issue.input === undefined ? requiredMsg : undefined),
    })
    .trim()
    .min(1, { error: requiredMsg })

export function createContactFormSchema() {
  const emailSchema = requiredString("E-mail er påkrævet.")
    .pipe(z.email({ error: "Skriv en gyldig e-mailadresse." }))

  const phoneSchema = z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => v === "" || /^\d{8}$/.test(v), { error: "Telefon skal være 8 cifre." })
    .optional()

  return z
    .object({
      name: requiredString("Navn er påkrævet.").max(30, { error: "Navn er for langt." }),
      email: emailSchema,
      phone: phoneSchema,
      subject: z.enum(contactSubjectKeys, { error: "Vælg et emne." }),
      subjectOther: z.string().trim().max(120, { error: "For langt." }).optional(),
      message: requiredString("Besked er påkrævet.").max(5000, { error: "Besked er for lang." }),
    })
    .superRefine((data, ctx) => {
      if (data.subject === "other" && (!data.subjectOther || data.subjectOther.length === 0)) {
        ctx.addIssue({
          code: "custom", // ZodIssueCode is deprecated in v4
          path: ["subjectOther"],
          message: 'Udfyld feltet når du vælger "Andet".',
        })
      }
    })
}
