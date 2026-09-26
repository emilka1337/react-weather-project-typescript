import { describe, expect, it } from "vitest";

// oxlint checks file names (unicorn/filename-case) but has no rule for folder names, so the
// Bulletproof React kebab-case convention for folders is enforced here. The glob is only used for
// its keys - the file paths under src/ - so nothing is actually imported.
const files = Object.keys(import.meta.glob("/src/**/*"));

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// The one conventional exception: co-located integration tests.
const ALLOWED = new Set(["__tests__"]);

const folders = new Set(
    files.flatMap((file) => file.split("/").slice(2, -1)), // drop "", "src" and the file name
);

describe("architecture", () => {
    it("sees the source tree", () => {
        expect(folders).toContain("features");
        expect(folders).toContain("__tests__");
    });

    it("names every folder under src/ in kebab-case", () => {
        const offenders = [...folders].filter((name) => !ALLOWED.has(name) && !KEBAB_CASE.test(name));

        expect(offenders).toEqual([]);
    });
});
