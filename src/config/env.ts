import { z } from "zod";

// Exported so the unit test can exercise the schema without touching import.meta.env.
export const EnvSchema = z.object({
    VITE_BASE_URL: z
        .string()
        .min(1, "VITE_BASE_URL is required")
        // Every request path is appended without a leading slash, so the base must bring its own.
        .refine((value) => value.endsWith("/"), "VITE_BASE_URL must end with a trailing slash"),
    VITE_API_KEY: z.string().min(1, "VITE_API_KEY is required"),
});

export type Env = z.infer<typeof EnvSchema>;

// Named explicitly rather than passing import.meta.env wholesale: Vite statically replaces each
// `import.meta.env.VITE_X` it can see literally, so naming the keys is what makes them survive the build.
const parsed = EnvSchema.safeParse({
    VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
});

if (!parsed.success) {
    // Fail at startup with the reason, instead of a puzzling 401 from OpenWeather ten seconds later.
    throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env: Env = parsed.data;
