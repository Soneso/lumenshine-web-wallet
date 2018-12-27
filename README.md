# Lumenshine web wallet for Stellar


A Vue.js project representing the [Lumenshine](https://lumenshine.com) web wallet by [Soneso](https://soneso.com). It is a multi-platform, user-freindly, fully-featured wallet for the decentralized Stellar network. 

The live version available [here](https://lumenshine.com)

The iOS app is available [here](https://itunes.apple.com/us/app/lumenshine/id1441524975)

You can run the project on your local machine or on a test server.

## Build Setup - for local development

1. Install Node.js version 8.x or version 10.x

2. Clone the project from this repository

3. Open project root directory in a terminal

4. Install project dependencies with `npm install` command.
This command might fail at rebuilding the ed25519 library, but it should not cause problems. 

5. Start development server with `npm run dev` command. After successful start you should see a message like this:  `DONE  Compiled successfully in 3336ms `
> * If you cannot start the development server, then a Node.js compatible C++ compiler should be installed. For Windows, there is a guide here: https://www.npmjs.com/package/windows-build-tools
After installing the compiler, go back to step 3 and reinstall the project dependencies.

> * By default `npm run dev` uses our pre-deployed test backend. If you have a [backend](https://github.com/Soneso/lumenshine-backend) running on your computer, then you can use the `npm run dev-local` command.

6. After the server is started, it should be accessible from this URL: http://localhost:8001. Every modification you make on the code should be automatically reflected.

## Deploying to a test server

1. Install Node.js version 8.x or version 10.x

2. Clone the project from this repository on your test server

3. Checkout the latest version from the repository: `git pull`

4. Install project dependencies: `npm install`

5. Make a new production build: `npm run build`. This command will generate the required files into the /dist directory.

6. Start a static HTTP server with the files from the /dist directory in the root. In order to have working URLs, the URL rewriting should be enabled. There are some examples for configuring the HTTP server here: https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations

7. After the server is started, you can verify if the latest version was deployed by checking the first few console messages in the development console of your browser. It should show the build date there.


## Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8001 (with our pre-deployed backend)
npm run dev

# serve with hot reload at localhost:8001 (with backend on localhost)
npm run dev-local

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

## About

[Lumenshine](https://lumenshine.com) is a wallet for the decentralized Stellar network. Lumenshine is developed and maintained by [Soneso GmbH](https://soneso.com), a company from Munich, Germany. The Stellar network is hosted by numerous distributed nodes world-wide who are not under the control of any single entity or groups of entities. Lumenshine does not control the Stellar network and it is not created, sponsored or endorsed by the Stellar Development Foundation.

Lumenshine is an interface that can help you to interact with the Stellar network. You can add multiple Stellar accounts, send and receive payments within the Stellar network, add different currencies from the Stellar network, view, search and filter the transaction history of your accounts, set inflation destination, add a short Stellar address (federation) and much more.

Lumenshine is currently available for web and as a native mobile app.

Lumenshine is not responsible for the Stellar network, for its accounts, currencies and transactions or any entities within the Stellar network. Lumenshine takes no responsibility any of the assets provided by different parties within the Stellar network. Lumenshine does not manually curate the lists of assets that it displays on its interface. Any asset that is created on the Stellar network may theoretically be displayed, no matter whether it would be considered a currency, commodity, security, utility token, or other type of asset under your local applicable laws and regulations. You are responsible for determining the legality of your transactions. Please make sure that you understand how the Stellar network works before using Lumenshine.

[Soneso GmbH](https://soneso.com) is a company from Munich, Germany. We are specialized on the Stellar network, offering consulting and development services related to the Stellar Ecosystem.

## License

lumenshine-iOS-wallet is licensed under an Apache-2.0 license. See the [LICENSE](https://github.com/Soneso/lumenshine-web-wallet/blob/master/LICENSE) file for details.