module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@/constants": "./constants",
            "@/utils": "./utils",
            "@/components": "./components",
            "@/app": "./app",
            "@/providers": "./providers",
          },
        },
      ],
    ],
  };
};
