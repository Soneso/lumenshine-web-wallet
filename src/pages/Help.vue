<template>
  <b-row align-h="center" align-v="center">
    <b-col sm="10" md="7">
      <b-card class="p-4">
        <b-row>
          <b-col cols="12">
            <h3 class="form-headline text-uppercase pb-4">Help</h3>
          </b-col>

          <b-col cols="12">
            <hr class="divider light">
            <a href="mailto:support@lumenshine.com?subject=Lumenshine Support">
              <h6>
                <i class="icon-mail"/>
                <span class="pl-2">Support inbox</span>
              </h6>
            </a>

            <hr class="divider light">
            <h5 class="font-weight-600 text-info mt-4 py-3">FAQ</h5>
            <ul id="help-faq" role="tablist">
              <li>
                <hr class="divider light">
                <a v-b-toggle.q1 class="d-block font-weight-500 mt-1 text-info">How can I fund my wallet?</a>
                <b-collapse id="q1" accordion="accordion1" role="tabpanel">
                  <!--<p class="mt-3"> I start opened because <code>visible</code> is <code>true</code></p>-->
                  <p class="mb-0"><br>In order to prevent people from making a huge number of unnecessary accounts, each account in the Stellar network must have a minimum balance of 1.0 XLM (one Stellar Lumen).
                    <br><br>Press the "Fund Wallet" button of your unfunded wallet and then choose "XLM". The deposit popup will show you the Account ID of your Stellar account. It is referenced by your wallet.
                    <br><br>Copy the displayed public key (your Stellar Account ID) by pressing the copy button. Next, send XLM (Stellar Lumens) to your Stellar Account ID in order to fund your wallet.
                    <br><br>At least 1.0 XLM is needed to fund an account in the Stellar network. We recommend a minimum of 2.0 XLM.
                    <br><br>Q: I don't have Stellar Lumens. Where can I get Stellar Lumens (XLM)?
                    <br><br>A: Lumenshine uses <a href="https://changelly.com/" target="_blank" rel="noopener">Changelly</a> as a cross-chain exchange provider. Changelly converts your funds to XLM at the best rates by bidding out your order worldwide. They charge 0.5% for the conversion. You can use changelly by pressing the "Other currenecy" button in the deposit popup.
                  <br><br>Alternatively, you can pay an exchange that sells Stellar Lumens in order to fund your wallet. <a href="https://coinmarketcap.com/currencies/stellar/#markets" target="_blank" rel="noopener">CoinMarketCap</a> maintains a list of exchanges that sell Stellar Lumens (XML). After purchasing the lumens, withdraw them from the exchange to your wallet by sending them to your Stellar Account ID/Public key.<br></p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q2 class="d-block font-weight-500 mt-1 text-info">How can I setup the inflation destination to receive airdrops?</a>
                <b-collapse id="q2" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"><br>You can set the inflation destination in the details section of your wallet. Press the "Details" button and scroll to "Set inflation destination". Then press the "set" button and choose from the list of recommended inflation destinations or to provide your own data. If you provide your own data, you must insert the Account ID/Public key of the inflation destination account you want to vote for.</p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q3 class="d-block font-weight-500 mt-1 text-info">How can I receive other assets and currencies than Stellar Lumens?</a>
                <b-collapse id="q3" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"><br>You can accept other assets and currencies than Stellar Lumens in the details section of your wallet. Press the "Details" button and scroll to "Currencies". Next, press the "add currency" button and provide the Account ID/Public key of the issuer and the asset code of the currency you would like to accept. Only assets and currencies from the Stellar network can be added. This will create a trustline to the inserted issuer account and asset code, so that you can now accept that asset or currency.<br><br>After adding the trustline, go back to your wallet and press the "Receive" button. You can now select the new currency from the provided dropdown. Insert the data and send it to the person you want to obtain the assets from.<br></p>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <a v-b-toggle.q4 class="d-block font-weight-500 mt-1 text-info">How can I send Stellar Lumens and other currencies?</a>
                <b-collapse id="q4" accordion="accordion1" role="tabpanel">
                  <p class="mt-3 mb-0"><br>You can send Stellar Lumens and other assets or currencies by pressing the "Send" button of your wallet. Fill the form, enter your password and submit. You can only send assets that you have in your wallet or own assets.<br><br>The recepient must also trust and be able to receive the asset (other then Stellar Lumens) you would like to send. If she did not yet accept the asset you want to send, an error message will be dispayed.<br></p>
                </b-collapse>
              </li>
            </ul>

            <hr class="divider light">
            <h5 class="font-weight-600 text-info mt-4 py-3">Topics</h5>

            <ul id="help-topics">
              <li>
                <hr class="divider light">
                <ul v-b-toggle.acc-basics id="acc-basics-button" class="py-3">
                  <li>
                    <i class="icon-bag large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Basics</h6>
                    <span>Guide to getting started with Lumenshine</span>
                  </li>
                </ul>
                <b-collapse id="acc-basics" accordion="accordion2" role="tabpanel" @show="() => moveScrollPos('acc-basics-button')">
                  <span class="pt-3 text-gray-600 pb-2 d-block">Lumenshine is a wallet for Stellar. Stellar is a decentralized blockchain network developed by the <a href="https://www.stellar.org/" target="_blank" rel="noopener">Stellar Development Foundation</a>.
                    <br><br>To be able to use Lumenshine, you need to sign-up first and complete the setup process.
                    <br><br>After completing the setup process or on login, Lumenshine displays your home view. The home view shows the wallets that you want to have there, charts, promos and more.
                    <br><br>In the menu on the left side you can switch between different views: home, wallets, transaction, contacts, settings, etc.
                    <br><br>The wallets view shows all wallets that you added to Lumenshine. You can add new wallets here by pressing the "Add Wallet" button in the upper right corner. Every wallet represents a Stellar account in the Stellar network.
                    <br><br>Unlike physical wallets where the asset or cash is stored inside the wallet, Stellar wallets don't store your assets. Instead your assets are associated with your Stellar account in the global Stellar ledger. Lumenshine gives you a way to view your accounts, the assets and data associated with them. It also helps you to compose transactions (such as payments), to sign them and to submit them to the Stellar network.
                    <br><br>Each Stellar account must be funded before it exists in the Stellar network. To fund your wallet (Stellar account), you have to send at least 1.0 Stellar Lumen (XLM) to your unfunded wallet. Press the "Fund Wallet" button, and then choose "XLM". The popup will show you the address of Stellar account referenced by that wallet. Copy the displayed public key (Stellar Account ID) by pressing the copy button right to it and send XLM to it the to fund your wallet.
                    <br><br>After funding your wallet, you can send payments, view and edit the details of your wallet.
                    <br><br>To better understand how Stellar accounts and transactions work please watch this video by Lumenauts:
                    <br><br><iframe width="100%" height="315" src="https://www.youtube.com/embed/g5FHjOKV1-E" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen/>
                  </span>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <ul v-b-toggle.acc-wallets id="acc-wallets-button" class="py-3">
                  <li>
                    <i class="icon-wallet large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Wallets</h6>
                    <span>Learn how to master all Wallet features</span>
                  </li>
                </ul>
                <b-collapse id="acc-wallets" accordion="accordion2" role="tabpanel" @show="() => moveScrollPos('acc-wallets-button')">
                  <span class="pt-3 text-gray-600 pb-2 d-block">
                    With Lumenshine you can have multiple wallets. You can add new wallets in the wallets view. Each wallet represents a Stellar account.
                    <br><br><code>Public key and secret seed</code>
                    <br><br>Access to a Stellar account is controlled by public-, private key cryptography. Each Stellar account has a public key and a secret seed. The public key is also called Account ID and always starts with "G" and the secret seed always starts with "S". You can see the public key and secret seed of your Stellar account in the details view of your wallet. To be able to see the secret seed, you have to insert your password so that the app can decrypt your mnemonic, extract the secret seed of your wallet and display it to you.
                    <br><br><code>Adding a Stellar address</code>
                    <br><br>To make sending and receiving easier, the Stellar federation protocol resolves short Stellar addresses such as <code>name*lumenshine.com</code> into Stellar public keys like: GCCVPYFOHY7ZB7557JKENAX62LUAPLMGIWNZJAFV2MITK6T32V37KEJU
                    <br><br>Stellar addresses are email-like, human readable addresses, that are much easier to type out and share than the public key. They have two parts, username + domain, split by an asterix. When someone else sends assets to your account instead of typing in long, error prone string of random characters as a public key, the assets can be sent to your Stellar address.
                    <br><br>Lumenshine runs a federation server to implement the Stellar federation protocol. You can request a Stellar address like "mike*lumenshine.com" in the details view of your wallet. Your Stellar address will be stored in the Lumenshine database and mapped to the public key of your wallet/account.
                    <br><br><code>Adding Stellar assets</code>
                    <br><br>Each Stellar account can have different kinds of assets associated with it. There are lumens, the native currency of the Stellar network, non anchored and anchored assets.
                    <br><br>Each funded account has lumens by default. To associate another asset with your account, you must issue a trustline from your account to the issuer account of that specific asset. You can do this in the details view of your wallet by pressing "Add currency".
                    <br><br><code>Set the inflation destination</code>
                    <br><br>The Stellar distributed network has a built-in, fixed, nominal inflation mechanism. New lumens are added to the network at the rate of 1% each year. Each week, the protocol distributes these lumens to any account that gets over .05% of the “votes” from other accounts in the network.
                    <br><br>To vote for another account you can set the inflation destination to that account in the details of your wallet. To receive "airdrops" you can vote for accounts that return the received Lumens to their voters. Such as for example the <a href="https://pool.lumenaut.net/" target="_blank" rel="noopener">Lumenaut inflation pool</a>.
                    <br><br><code>Send payments</code>
                    <br><br>To send payments press the "Send" button of your wallet. You can choose to send Stellar Lumens, other Stellar assets that you have associated with your account or own assets. If you want to send other assets than Stellar Lumens, the recipients Stellar account must also trust the issuers Stellar account of that asset.
                    <br><br><code>Receive payments</code>
                    <br><br>In the receive payment form you can type in what kind of payment you want to receive. You can send the composed data including your account data to the sender of the payment.
                    <br><br><code>View, filter, search transactions</code>
                    <br><br>You can view, filter and search for transactions of your wallets. Use the side menu of Lumenshine to open the transactions view.
                  </span>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <ul v-b-toggle.acc-security id="acc-security-button" class="py-3">
                  <li>
                    <i class="icon-security large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Security</h6>
                    <span>
                      <span>Learn how to keep your wallets safe</span>
                    </span>
                  </li>
                </ul>
                <b-collapse id="acc-security" accordion="accordion2" role="tabpanel" @show="() => moveScrollPos('acc-security-button')">
                  <span class="pt-3 text-gray-600 pb-2 d-block">
                    <br><code>Password &amp; Mnemonic</code>
                    <br><br>With Lumenshine, when you register and set-up your account, the app generates a backup secret (24 words mnemonic) for you. All the wallets that you create with Lumenshine are associated with your mnemonic.
                    <br><br>The mnemonic is private information and you must keep it safe. Please write down your mnemonic during the setup-process and do not share it with anyone. The mnemonic is like a combination for a lock. Anybody who knows the combination can open the lock. Anybody who knows your mnemonic has access to all your Stellar accounts that you created using Lumenshine.
                    <br><br>Your mnemonic is cryptographically secured by the Lumenshine app. Lumenshine uses complex cryptography to encrypt your mnemonic with a key that is derived from your password and associates the encrypted mnemonic with your email-address. The encrypted mnemonic is stored in the Lumenshine database so that it can be used by you every time you log in to the Lumenshine web wallet, iOS or android app. The Lumenshine app never sends your password to the server. Meaning: we do not have your password and therefore can not decrypt your mnemonic from the Lumenshine database. We have no access to the seeds of your Stellar accounts.
                    <br><br>When you log in, you must insert your email, password and 2FA code. The Lumenshine app request your encrypted mnemonic from the Lumenshine server by providing your email-address and inserted 2FA-code. If they match, the server returns your encrypted mnemonic to the app. The Lumenshine app then tries to decrypt your mnemonic by using a key that is derived from your password. If successfully decrypted, the Lumenshine app must prove to the Lumenshine server that you inserted the correct password without sending the password to the server. It does so by signing for you an <a href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md" target="_blank" rel="noopener">authentication challenge</a> received from the Lumenshine server. The server checks the signature and if correct, it logges you in.
                    <br><br>It is very important that you do not lose your password and mnemonic. If you lose both, we can not decrypt your mnemonic anymore and you can not access your accounts seeds with Lumenshine any more.
                    <br><br><code>Secret seed</code>
                    <br><br>Every Stellar account has a public key (Account ID) and a secret seed. The public key is safe to share. Other people need it to identify your account and to verify that you authorized a specific transaction. The secret seed however is private information. It is used to sign transactions like for example payments. On every round of consensus the validators from the Stellar network check the signature of the transactions to make sure that they were authorized with the appropriate seeds before they insert the transactions into the global ledger.
                    <br><br>The Lumenshine app uses the secret seed of your wallet/Stellar account to sign transactions for you. To receive the secret seed for a wallet, the Lumenshine app requests your password. When inserted, the app requests your encrypted mnemonic from the server and decrypts it. If the decryption was successful, the app loads the needed secret seed from the mnemonic and signs the transaction for you. The Lumenshine app and the Lumenshine server never store the secret seeds of your accounts. The seeds are never transmitted to the Lumenshine server. The app just uses them to sign transactions for you. The app can only obtain the needed seed by using your password and encrypted mnemonic.
                    <br><br>You can reveal the secret seed of your wallet in the detail section of your wallet by inserting your password. You may need to use it in apps other than Lumenshine to signs transactions that are not yet supported by Lumenshine. For example for adding orders to the decentralized Stellar exchange. Do not share the secret seed of your account with anyone. Just use it to sign transactions in apps that you trust.
                    <br><br><code>2FA secret &amp; 2FA Code</code>
                    <br><br>The Lumenshine system uses 2 factor authentication to log you in. You have to insert your email-address, password and current 2FA code to be able to login.
                    <br><br>The 2FA code that you need to log-in is generated every couple of seconds and displayed to you in the 2FA authenticator app on your mobile phone. The authenticator app needs your 2FA secret to be able to generate your current 2FA code. Therefore, the authenticator app on your phone stores your 2FA secret.
                    <br><br>In the iOS and android Lumenshine app you must also insert your email-address, password and current 2FA code to login. As soon as logged in, the iOS and android app securely stores your 2FA secret until you sign out. When you close the iOS or android app, you are still logged in in the app, but not in the server. When you open the app again, it requests your password to unlock it. The app uses the stored 2fa secret and your password (which is not sent to the server) to log you into the server and unlocks your app. By this feature you must not insert the current 2FA code every time you unlock the iOS or android app.
                    <br><br><code>Fingerprint- &amp; face recognition</code>
                    <br><br>Fingerprint- or face recognition can be activated and used in the iOS or android Lumenshine app. By using this feature you can unlock the app and sign transactions by authenticating with your fingerprint or face. This is a very useful feature, but you must understand how it works and what it's risks are before using it.
                    <br><br>When activating fingerprint- or face recognition, the Lumenshine app must store your password on the device to be able to log you into the server and more important, to be able to obtain your secret seeds from your encrypted mnemonic. It stores the password until you sign out. The app stores the password in a secure location on your mobile device. For example in the keychain on iOS. The keychain is secured by your device and by the operating system of your device. Lumenshine is not responsible for protecting the data within the keychain. It is the most secure location on your device, but it still may be hacked or otherwise compromized.
                    <br><br>Do not activate fingerprint- or face recognition if you don't want the Lumenshine mobile app to store your password in the keychain of your mobile device.
                  </span>
                </b-collapse>
              </li>
              <li>
                <hr class="divider light">
                <ul v-b-toggle.acc-stellar id="acc-stellar-button" class="py-3">
                  <li>
                    <i class="icon-learn-ico large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Stellar</h6>
                    <span>Learn more about Stellar</span>
                  </li>
                </ul>
                <b-collapse id="acc-stellar" accordion="accordion2" role="tabpanel" @show="() => moveScrollPos('acc-stellar-button')">
                  <span class="pt-3 text-gray-600 pb-2 d-block">Stellar is a decentralized financial platform that is designed to be open and accessible to everyone. It aims to connect banks, payment systems, companies and people.
                    <br><br>Stellar is operated and maintained by the <a href="https://www.stellar.org/" target="_blank" rel="noopener">Stellar Development Foundation</a> which is a non-stock, non-profit organization from the U.S. Its mission is to connect people to low cost financial services to fight poverty and maximize individual potential.
                    <br><br>With Stellar, money and any kind of assets can be moved quickly, reliably and almost with no costs. Transactions on the decentralized network resolve in 2-5 seconds and cost a fraction of a fraction of a cent.
                    <br><br><code>Stellar Accounts &amp; Transactions</code>
                    <br><br>Related video by Lumenauts:
                    <br><br><iframe width="100%" height="315" src="https://www.youtube.com/embed/g5FHjOKV1-E" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen/>
                    <br><br>As a user, you interact with the Stellar network through accounts. Accounts are saved in the global ledger. Anything else in the ledger: assets, trades, trustlines, etc. are owned by a particular account.
                    <br><br>Account access is controlled by public- private key cryptography. Every Stellar account has a public key which always starts with "G" and a secret seed which always start with "S". The public key is safe to share, other people need it to identify your account and verify that you authorized a transaction. Your secret seed however is private information that proves that you own your account. It is kind like a combination to a lock, anybody who knows the combination can open the lock.
                    <br><br>Transactions are how you apply changes to your account. For an account to perform a transaction, for example a payment, the transaction must be signed by the secret seed associated with that’s account public key. During every round of consensus, nodes check the signature on the transaction to assure that they were signed with the appropriate seed before they include the transaction in the ledger.
                    <br><br><code>Stellar Wallets</code>
                    <br><br>You can access your accounts and sign transactions using apps called wallets. Unlike physical wallets where the asset or cash is stored inside the wallet, crypto currency wallets  don’t store your assets. Instead your assets are associated with your account in the global ledger. A wallet usually gives you a way to view your accounts and the assets and data associated with that account. It often also helps you to compose transactions as well as sign them and submit them to the network.
                    <br><br><code>Stellar Assets &amp; Anchors</code>
                    <br><br>Related video by Lumenauts:
                    <br><br><iframe width="100%" height="315" src="https://www.youtube.com/embed/Cf9CdFVse-w" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen/>
                    <br><br>The Stellar network can be used to hold, transfer and trade any type of asset: euros, dollars, bitcoins, stocks, gold, ico tokens and more.
                    <br><br>Using Stellar, there is no need to create a custom air prone smart contract to issue an asset. Instead, the concept of an asset is built into the open source software that powers the Stellar network. This makes the process of issuing assets on the Stellar System more secure and much easier.
                    <br><br>There are 3 types of assets in the network: first is Lumens - they are the native currency of the network and act as a spam prevention mechanism via transaction fees and as a bridge currency between different assets on the decentralized exchange. Second is non anchored assets. These are assets, that originate on the network and don’t represent any asset outside the network. They are often ICO tokens, similar to ERC20 tokens. Another term for this type of assets is non redeemable assets. Third is anchored assets. If an asset did not originate on the network, it is anchored on the network by an anchoring entity or "anchor". These assets are also called redeemable assets.
                    <br><br>Anchors act as a bridge between outside currencies and the Stellar network. An anchor can be thought up as a bank. Banks take your deposit, issue the corresponding IOU in form of a balance on your account with that bank. You can see your balance in their database on a website or an app. They honor withdraws by giving you cash. Interacting with anchors is similar. Anchors take your deposit, issue the corresponding credit to your address on the Stellar ledger, which you can see in your wallet app. They honor withdraws by receiving the credit they issued you and giving you your asset. The primary difference between assets hold in banks versus anchors is where you can access and move your assets, a centralized database versus the Stellar ledger.
                    <br><br>When you want to hold assets with a bank in the real word, you must open an account with that bank. In the Stellar network, when you want to hold assets with an anchor, you must issue a trustline from your Stellar account to that anchors Stellar account. Trustlines also protect you from having random, unsolicited assets sent to you.
                    <br><br>Anchored Assets can be any asset: there are fiat assets of government issued currencies like us dollar or euro, crypto-currency assets that originate from other networks like Bitcoin or Ethereum, stocks that originate from a company as a unit of ownership in that company, bonds that also originate from entities and represent dept, commodities that originate in the physical world like gold and real estate or ownership stake in physical world property.
                    <br><br><code>Stellar Nodes, network and the Ledger</code>
                    <br><br>Related video by Lumenauts:
                    <br><br><iframe width="100%" height="315" src="https://www.youtube.com/embed/sTQuGoBeKto" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen/>
                    <br><br>In the Stellar Ecosystem nodes store the global ledger and together make up the Stellar network. A node is basically a computer, it doesn't have to be special like the complex and expensive mining rags of bitcoin, it can be a simple laptop connected to the internet, which opens access to the network for the unbanked and for developing world business.
                    <br><br>Each node runs an instance of Stellar Core – open source software created by the Stellar Development Foundation.
                    <br><br>There are two basic kinds of nodes: watcher nodes monitor the network, submit transactions and store the current version of the ledger. Like a regular bitcoin node, they do not participate in consensus. If a node is set up to participate in consensus, it is called a validator. Validators serve a purpose somewhat similar to bitcoin miners, they agree on sets of transactions every several seconds via consensus and update the global ledger. The more validator nodes in the network, the better.
                    <br><br>Each node contains a complete copy of the global ledger. The ledger records every transaction on the system, contains the list of all the accounts and balances and holds all the orders in the decentralized exchange.
                    <br><br>During each run of consensus, the network of validators agrees on which transactions to apply to the global ledger. When a new set of transactions is applied a new last closed ledger is created. Each ledger is cryptographically linked to a unique previous ledger, creating a historical ledger chain that goes back to the genesis ledger. Watcher and validator nodes also have the option of storing an historical archive of the network and past ledgers, helping other nodes catch up and join the network.
                    <br><br><code>Stellar Consensus Protocol</code>
                    <br><br>Related video by Lumenauts:
                    <br><br><iframe width="100%" height="315" src="https://www.youtube.com/embed/X3Gj2nQZCNM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen/>
                  </span>
                </b-collapse>
              </li>
            </ul>
          </b-col>
        </b-row>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import raf from 'raf';
export default {
  name: 'Help',
  data () {
    return {
      text: `
        Help placeholder.
      `
    };
  },
  methods: {
    animationFrameCallback (timestamp) {
      if (!this.scrollStart) this.scrollStart = timestamp;
      const progress = timestamp - this.scrollStart;
      if (this.scrolledElement.getBoundingClientRect().top < 0) {
        this.scrolledElement.scrollIntoView();
      }
      if (progress < 1000) {
        raf(this.animationFrameCallback);
      } else {
        this.scrollStart = null;
      }
    },
    moveScrollPos (elementId) {
      this.scrolledElement = document.getElementById(elementId);
      raf(this.animationFrameCallback);
    }
  }
};
</script>
