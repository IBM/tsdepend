module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "/(src|tests)/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["./src/integrations/jest/index.ts"],
};
