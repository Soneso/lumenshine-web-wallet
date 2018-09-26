# lumenshine-web-wallet


A Vue.js project representing the Lumenshine Wallet by Soneso. It is a wallet for the Stellar network. 
It operates on the Stellar test net and uses our Lumenshine test server.

We constantly deploy the current versions to http://demo.lumenshine.com

Currently the project is alpha. You can run the project on your local machine or on a test server.

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
(we are constantly deploying to demo.lumenshine.com)

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
