import * as path from "path";
import autoprefixer from "autoprefixer";

var config = {
    entry: "./src/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve("public"),
        library: {
            type: 'module'
        },
    },
    devServer: {
        static: ["dict", "public"],
        compress: false,
        hot: false,
        open: true,
        port: 9000,
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
          {
            test: /\.(scss)$/,
            use: [
                {
                    // Adds CSS to the DOM by injecting a `<style>` tag
                    loader: 'style-loader'
                },
                {
                    // Interprets `@import` and `url()` like `import/require()` and will resolve them
                    loader: 'css-loader'
                },
                {
                    // Loader for webpack to process CSS with PostCSS
                    loader: 'postcss-loader',
                    options: {
                    postcssOptions: {
                        plugins: [
                        autoprefixer
                        ]
                    }
                    }
                },
                {
                    // Loads a SASS/SCSS file and compiles it to CSS
                    loader: 'sass-loader'
                }
            ]
          }
        ]
    }
    
    //target: "web"
};

export default (env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
    }

    if (argv.mode === "production") {
        config.output.filename = "index.es6.min.js";
    }
    /*
    if (argv.mode === "production-es5") {
        config.output.filename = "index.es5.min.js";
        config.library.type = 'commonjs';
    }

    if (argv.mode === "production-global") {
        config.output.filename = "index..min.js";
        config.library.type = 'window';
    }*/
    return config;
};