module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: false,
                decorators: true,
              },
              target: 'es2020',
              loose: false,
              externalHelpers: false,
            },
            module: {
              type: 'es6',
              strict: false,
              strictMode: true,
              lazy: false,
              noInterop: false,
            },
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      "@gradio/client": require.resolve("@gradio/client"),
    },
  },
}; 