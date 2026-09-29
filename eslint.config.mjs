import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".flowbite-react/**",
      "payload-types.ts",
    ],
  },
];

export default eslintConfig;
