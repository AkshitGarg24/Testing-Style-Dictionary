const StyleDictionary = require("style-dictionary");

StyleDictionary.registerTransformGroup({
  name: "js",
  transforms: [...StyleDictionary.transformGroup.js, "name/cti/camel"],
});

StyleDictionary.registerTransform({
  name: "transform-foo",
  matcher: (token) => true,
  transformer: (token) => {
    return token.value;
  },
});

StyleDictionary.registerFormat({
  name: `myCustomFormat`,
  formatter: function ({ dictionary }) {
    return dictionary.allTokens
      .map((token) => {
        let value = JSON.stringify(token.value);
        if (dictionary.usesReference(token.original.value)) {
          const refs = dictionary.getReferences(token.original.value);
          refs.forEach((ref) => {
            value = value.replace(ref.value, function () {
              return `${ref.name}`;
            });
          });
        }
        return `export const ${token.name} = ${value};`;
      })
      .join(`\n`);
  },
});

const sd = StyleDictionary.extend({
  fileHeader: {
    foo: (defaultMessages = []) => [
      "Ola, planet!",
      ...defaultMessages,
      "Hello, World!",
    ],
  },
  transform: {
    "transform-bar": {
      matcher: (token) => true,
      transformer: (token) => {
        return token.value;
      },
    },
  },
  source: ["tokens/**/*.json"],
  log: "error",
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      files: [
        {
          options: {
            fileHeader: "foo",
          },
          destination: "_variables.css",
          format: "css/variables",
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "build/js/",
      files: [
        {
          destination: "vars.js",
          format: "myCustomFormat",
        },
      ],
    },
  },
});

sd.buildAllPlatforms();

console.log(sd.allProperties, sd.properties);
