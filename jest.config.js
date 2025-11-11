export default {
  "transform": {
    "^.+\\.tsx?$": ["ts-jest", { "useESM": true }]
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
