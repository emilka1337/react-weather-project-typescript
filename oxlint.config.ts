import { defineConfig } from "oxlint";
import type { OxlintOverride } from "oxlint";

// A feature may not import from another feature. They talk through src/stores, or they are
// composed together in src/app. Adding a feature means adding a line here.
const FEATURES = ["weather", "city", "settings", "clock"];

const SHARED_LAYERS = ["components", "config", "hooks", "lib", "stores", "types", "utils"];

// Every cross-directory import goes through the @/ alias, and `../` is banned outright, so an import
// string alone says where it points - which is what lets the zones below be plain import patterns.
const NO_PARENT_IMPORTS = {
    regex: "^\\.\\./",
    message: "Import through the @/ alias, not ../ - relative climbs would slip past the architecture zones.",
};

const CROSS_FEATURE_MESSAGE =
    "Cross-feature import. Features are decoupled on purpose: they share state through src/stores " +
    "(geolocation is the seam - city writes coordinates, weather reacts to them), and they are " +
    "composed together in src/app. If you need this, the boundary is in the wrong place - move the " +
    "shared piece down into src/{lib,utils,types,stores}.";

// ================================================================
// The architecture, as an enforced invariant.
//     app  ->  features  ->  shared
// Nothing ever points back up an arrow.
// ================================================================
const featureZones = FEATURES.map((feature): OxlintOverride => ({
    files: [`src/features/${feature}/**`],
    rules: {
        "no-restricted-imports": [
            "error",
            {
                patterns: [
                    NO_PARENT_IMPORTS,
                    {
                        regex: `^@/features/(${FEATURES.filter((f) => f !== feature).join("|")})(/|$)`,
                        message: CROSS_FEATURE_MESSAGE,
                    },
                    {
                        regex: "^@/app(/|$)",
                        message:
                            "A feature must not import from src/app. Composition flows downward: " +
                            "app knows about features, never the reverse.",
                    },
                ],
            },
        ],
    },
}));

const sharedZone: OxlintOverride = {
    files: SHARED_LAYERS.map((layer) => `src/${layer}/**`),
    rules: {
        "no-restricted-imports": [
            "error",
            {
                patterns: [
                    NO_PARENT_IMPORTS,
                    {
                        regex: "^@/(features|app)(/|$)",
                        message:
                            "Shared code must not import from features or app. It sits below them. " +
                            "Move the shared piece down, or invert the dependency.",
                    },
                ],
            },
        ],
    },
};

export default defineConfig({
    plugins: ["typescript", "react", "jsx-a11y", "import", "unicorn", "vitest", "oxc"],
    categories: {
        correctness: "error",
    },
    options: {
        // Type-aware rules run on tsgolint, i.e. on TypeScript 7 itself.
        typeAware: true,
    },
    env: { browser: true, es2024: true },
    ignorePatterns: ["dist/**", "coverage/**", ".vitest/**"],

    rules: {
        // ---- Types: the typescript-eslint `recommendedTypeChecked` set --------------------------
        "typescript/ban-ts-comment": "error",
        "typescript/no-duplicate-enum-values": "error",
        "typescript/no-empty-object-type": "error",
        "typescript/no-explicit-any": "error",
        "typescript/no-extra-non-null-assertion": "error",
        "typescript/no-misused-new": "error",
        "typescript/no-namespace": "error",
        "typescript/no-non-null-asserted-optional-chain": "error",
        "typescript/no-require-imports": "error",
        "typescript/no-this-alias": "error",
        "typescript/no-unnecessary-type-constraint": "error",
        "typescript/no-unsafe-declaration-merging": "error",
        "typescript/no-unsafe-function-type": "error",
        "typescript/no-wrapper-object-types": "error",
        "typescript/prefer-as-const": "error",
        "typescript/prefer-namespace-keyword": "error",
        "typescript/triple-slash-reference": "error",
        "typescript/await-thenable": "error",
        "typescript/no-array-delete": "error",
        "typescript/no-base-to-string": "error",
        "typescript/no-duplicate-type-constituents": "error",
        "typescript/no-for-in-array": "error",
        "typescript/no-implied-eval": "error",
        "typescript/no-redundant-type-constituents": "error",
        "typescript/no-unnecessary-type-assertion": "error",
        "typescript/no-unsafe-argument": "error",
        "typescript/no-unsafe-assignment": "error",
        "typescript/no-unsafe-call": "error",
        "typescript/no-unsafe-enum-comparison": "error",
        "typescript/no-unsafe-member-access": "error",
        "typescript/no-unsafe-return": "error",
        "typescript/no-unsafe-unary-minus": "error",
        "typescript/only-throw-error": "error",
        "typescript/prefer-promise-reject-errors": "error",
        "typescript/require-await": "error",
        "typescript/restrict-plus-operands": "error",
        "typescript/restrict-template-expressions": "error",
        "typescript/unbound-method": "error",
        // verbatimModuleSyntax makes tsc demand `import type`; this rule autofixes it.
        "typescript/consistent-type-imports": "error",
        "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

        // The two rules type-aware linting is actually here for. This codebase's recurring bug is
        // the unobserved promise: a bare async call inside a useEffect, an async callback handed to
        // setTimeout whose rejection nobody can catch.
        "typescript/no-floating-promises": "error",
        "typescript/no-misused-promises": "error",

        // ---- React -------------------------------------------------------------------------------
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "error",
        // error, not warn: this is the rule that catches a component file also exporting a helper,
        // which is how separateListByWeekdays ended up being imported out of a component by a hook
        // in another domain.
        "react/only-export-components": ["error", { allowConstantExport: true }],
        // React Compiler's own analysis, in lint-only mode: code the compiler would have to skip
        // (or would compile wrongly) is reported here instead of silently running unoptimised.
        "react/error-boundaries": "error",
        "react/globals": "error",
        "react/immutability": "error",
        "react/incompatible-library": "error",
        "react/preserve-manual-memoization": "error",
        "react/purity": "error",
        "react/refs": "error",
        "react/set-state-in-effect": "error",
        "react/set-state-in-render": "error",
        "react/static-components": "error",
        "react/unsupported-syntax": "error",
        "react/use-memo": "error",

        // ---- Accessibility: the eslint-plugin-jsx-a11y `recommended` set --------------------------
        "jsx-a11y/alt-text": "error",
        "jsx-a11y/anchor-ambiguous-text": "off",
        "jsx-a11y/anchor-has-content": "error",
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/aria-activedescendant-has-tabindex": "error",
        "jsx-a11y/aria-props": "error",
        "jsx-a11y/aria-proptypes": "error",
        "jsx-a11y/aria-role": "error",
        "jsx-a11y/aria-unsupported-elements": "error",
        "jsx-a11y/autocomplete-valid": "error",
        "jsx-a11y/click-events-have-key-events": "error",
        "jsx-a11y/heading-has-content": "error",
        "jsx-a11y/html-has-lang": "error",
        "jsx-a11y/iframe-has-title": "error",
        "jsx-a11y/img-redundant-alt": "error",
        "jsx-a11y/interactive-supports-focus": "error",
        "jsx-a11y/label-has-associated-control": "error",
        "jsx-a11y/media-has-caption": "error",
        "jsx-a11y/mouse-events-have-key-events": "error",
        "jsx-a11y/no-access-key": "error",
        "jsx-a11y/no-autofocus": "error",
        "jsx-a11y/no-distracting-elements": "error",
        "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
        "jsx-a11y/no-noninteractive-element-interactions": "error",
        "jsx-a11y/no-noninteractive-element-to-interactive-role": "error",
        "jsx-a11y/no-noninteractive-tabindex": "error",
        "jsx-a11y/no-redundant-roles": "error",
        "jsx-a11y/no-static-element-interactions": "error",
        "jsx-a11y/role-has-required-aria-props": "error",
        "jsx-a11y/role-supports-aria-props": "error",
        "jsx-a11y/scope": "error",
        "jsx-a11y/tabindex-no-positive": "error",

        // ---- Imports and files -------------------------------------------------------------------
        // Default depth is unlimited.
        "import/no-cycle": "error",
        "import/no-self-import": "error",
        // Bulletproof React's file naming, machine-enforced so it cannot drift. Folder names are
        // checked by src/testing/architecture.test.ts - oxlint has no folder rule.
        "unicorn/filename-case": ["error", { case: "kebabCase" }],
        "no-restricted-imports": ["error", { patterns: [NO_PARENT_IMPORTS] }],
        // `chrome` is typed everywhere (tsconfig `types`), so only a lint rule can keep it where it
        // belongs. Everything else is feature-detected behind isExtension() and runs on Pages too.
        "no-restricted-globals": [
            "error",
            {
                name: "chrome",
                message:
                    "chrome.* is only touched in src/background.ts and src/lib/extension.ts. " +
                    "Go through the helpers in @/lib/extension (isExtension, read/write state).",
            },
        ],
    },

    overrides: [
        ...featureZones,
        sharedZone,

        // src/testing is deliberately outside the zones: fixtures and MSW handlers must be able to
        // import feature types. Test code is not shipped code.
        {
            files: ["**/*.test.{ts,tsx}", "src/testing/**", "__mocks__/**"],
            rules: {
                "no-restricted-imports": ["error", { patterns: [NO_PARENT_IMPORTS] }],
                "typescript/no-explicit-any": "off",
            },
        },

        // The only two files that touch the chrome.* extension APIs.
        {
            files: ["src/background.ts", "src/lib/extension.ts"],
            env: { serviceworker: true },
            rules: { "no-restricted-globals": "off" },
        },

        // Config files at the repo root run on Node.
        {
            files: ["*.config.ts"],
            env: { node: true, browser: false },
        },
    ],
});
