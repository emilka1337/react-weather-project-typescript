import z from "zod";

export const IPInfoSchema = z.object({
    as_domain: z.string(),
    as_name: z.string(),
    asn: z.string(),
    continent: z.string(),
    continent_code: z.string(),
    country: z.string(),
    country_code: z.string(),
    ip: z.string(),
})

export type IPInfo = z.infer<typeof IPInfoSchema>