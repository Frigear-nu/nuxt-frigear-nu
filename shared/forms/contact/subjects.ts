
export const contactSubjectKeys = [
  "volunteering",
  "partnership",
  "support",
  "payment",
  "governance",
  "finance",
  "complaint",
  "other",
] as const

export type ContactSubjectKey = (typeof contactSubjectKeys)[number]

export const contactSubjectLabels: Record<ContactSubjectKey, string> = {
  volunteering: "Frivillig",
  partnership: "Samarbejde",
  support: "Support",
  payment: "Betaling",
  governance: "Bestyrelse",
  finance: "Økonomi",
  complaint: "Klage",
  other: "Andet",
}

export const contactSubjectSelectItems = contactSubjectKeys.map((value) => ({
  value,
  label: contactSubjectLabels[value],
}))
