module.exports = {
  project: {
    ios: {},
    android: {},
  },
  // Plus Jakarta only — vector icon fonts are bundled once via the RNVectorIcons CocoaPod /
  // Android fonts.gradle. Linking node_modules/.../Fonts here duplicates them on iOS and breaks the build.
  assets: ['./src/assets/fonts'],
};
