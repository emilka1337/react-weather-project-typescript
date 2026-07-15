import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import checkFile from "eslint-plugin-check-file";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

// A feature may not import from another feature. They talk through src/stores, or they are
// composed together in src/app. Adding a feature means adding a line here.
const FEATURES = ["weather", "city", "settings", "clock"];

const noCrossFeatureImports = FEATURES.map((feature) => ({
    target: `./src/features/${feature}`,
    from: "./src/features",
    except: [`./${feature}`],
    message:
        "Cross-feature import. Features are decoupled on purpose: they share state through " +
        "src/stores (geolocation is the seam - city writes coordinates, weather reacts to them), " +
        "and they are composed together in src/app. If you need this, the boundary is in the " +
        "wrong place - move the shared piece down into src/{lib,utils,types,stores}.",
}));

export default tseslint.config(
    { ignores: ["dist", "coverage", "node_modules"] },

    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
            jsxA11y.flatConfigs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {
            "import/resolver": {
                typescript: { alwaysTryTypes: true, project: "./tsconfig.app.json" },
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "check-file": checkFile,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,

            // error, not warn: this is the rule that catches a component file also exporting a
            // helper, which is how separateListByWeekdays ended up being imported out of a
            // component by a hook in another domain.
            "react-refresh/only-export-components": ["error", { allowConstantExport: true }],

            // ================================================================
            // The architecture, as an enforced invariant.
            //     app  ->  features  ->  shared
            // Nothing ever points back up an arrow.
            // ================================================================
            "import/no-restricted-paths": [
                "error",
                {
                    zones: [
                        ...noCrossFeatureImports,
                        {
                            target: "./src/features",
                            from: "./src/app",
                            message:
                                "A feature must not import from src/app. Composition flows downward: " +
                                "app knows about features, never the reverse.",
                        },
                        {
                            target: [
                                "./src/components",
                                "./src/config",
                                "./src/hooks",
                                "./src/lib",
                                "./src/stores",
                                "./src/types",
                                "./src/utils",
                            ],
                            from: ["./src/features", "./src/app"],
                            message:
                                "Shared code must not import from features or app. It sits below them. " +
                                "Move the shared piece down, or invert the dependency.",
                        },
                    ],
                },
            ],

            "import/no-cycle": ["error", { maxDepth: Infinity }],
            "import/no-self-import": "error",
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
                    pathGroups: [{ pattern: "@/**", group: "internal", position: "before" }],
                    pathGroupsExcludedImportTypes: ["builtin"],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            // typescript-eslint already covers these, and they are the slow ones in the plugin.
            "import/namespace": "off",
            "import/named": "off",
            "import/no-named-as-default-member": "off",

            // Bulletproof React's file naming, machine-enforced so it cannot drift.
            "check-file/filename-naming-convention": [
                "error",
                { "**/*.{ts,tsx}": "KEBAB_CASE" },
                { ignoreMiddleExtensions: true },
            ],
            // __tests__ is the one conventional exception; everything else is kebab-case.
            "check-file/folder-naming-convention": ["error", { "src/**/!(__tests__)/": "KEBAB_CASE" }],

            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],

            // The two rules type-aware linting is actually here for. This codebase's recurring bug
            // is the unobserved promise: a bare async call inside a useEffect, an async callback
            // handed to setTimeout whose rejection nobody can catch.
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",
        },
    },

    // src/testing is deliberately outside the zones: fixtures and MSW handlers must be able to
    // import feature types. Test code is not shipped code.
    {
        files: ["**/*.test.{ts,tsx}", "src/testing/**/*.{ts,tsx}", "__mocks__/**/*.ts"],
        rules: {
            "import/no-restricted-paths": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },

    // Config files at the repo root: node globals, and they are not kebab-case.
    {
        files: ["*.config.{js,ts}"],
        languageOptions: { globals: globals.node },
        rules: {
            "check-file/filename-naming-convention": "off",
            "import/no-unresolved": "off",
        },
    }
);
