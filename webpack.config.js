const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        index: path.resolve(__dirname, './src/index.js'),
        main_menu: path.resolve(__dirname, './src/main_menu.html'), // Add main_menu.html to the entry
        info_screen: path.resolve(__dirname, './src/info_screen.html'), // Add info_screen.html to the entry
        skills_tree: path.resolve(__dirname, './src/skills_tree.html'), // Add skills_tree.html to the entry
        settings_screen: path.resolve(__dirname, './src/settings_screen.html'), // Add settings_screen.html to the entry
        profile_screen: path.resolve(__dirname, './src/profile_screen.html'), // Add settings_screen.html to the entry
        inital_game_options_screen: path.resolve(__dirname, './src/inital_game_options_screen.html'), // Add settings_screen.html to the entry
        loss_victory_screen: path.resolve(__dirname, './src/loss_victory_screen.html'), // Add settings_screen.html to the entry
        game_screen: path.resolve(__dirname, './src/gameScreen.html'), // Add settings_screen.html to the entry
    },

    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '',
                        },
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            chunks: ['index'] // Specify the chunks to include in the index.html file
        }),

        new HtmlWebpackPlugin({
            filename: 'main_menu.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/main_menu.html'),
            chunks: ['main_menu'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'info_screen.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/info_screen.html'),
            chunks: ['info_screen'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'skills_tree.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/skills_tree.html'),
            chunks: ['skills_tree'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'settings_screen.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/settings_screen.html'),
            chunks: ['settings_screen'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'profile_screen.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/profile_screen.html'),
            chunks: ['profile_screen'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'inital_game_options_screen.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/inital_game_options_screen.html'),
            chunks: ['inital_game_options_screen'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'loss_victory_screen.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/loss_victory_screen.html'),
            chunks: ['loss_victory_screen'] // Specify the chunks to include in the main_menu.html file
        }),
        new HtmlWebpackPlugin({
            filename: 'game_screen.html', // Set the filename of the new HtmlWebpackPlugin
            template: path.resolve(__dirname, './src/game_screen.html'),
            chunks: ['game_screen'] // Specify the chunks to include in the main_menu.html file
        }),
        
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css',
        }),
    ],

    devtool: 'source-map',

    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
    },

    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js',
        assetModuleFilename: 'images/[name][ext][query]',
        //clean: true,
    },
};
