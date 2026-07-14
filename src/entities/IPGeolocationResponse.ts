import z from "zod";

// Shape of https://ipapi.co/json/. Only the fields we actually consume are declared —
// zod strips the rest, so extra fields upstream can never fail the parse.
export const IPGeolocationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    city: z.string().optional(),
});

export type IPGeolocation = z.infer<typeof IPGeolocationSchema>;
