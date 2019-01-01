<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="12" sm="11" md="10" lg="9" xl="8">
      <b-card class="p-4">
        <b-row>
          <b-col cols="12" lg="4" xlg="3">
            <h1><small class="text-info">Introducing</small> <span class="font-weight-800 text-primary">Lumenshine</span></h1>
            <p class="lead">Lumenshine is a multi-platform, user-friendly, fully-featured wallet app for the decentralized Stellar network. <br><br>Lumenshine is available for web and iOS.<br></p>
            <p class="lead"><a href="https://itunes.apple.com/us/app/lumenshine/id1441524975" target="_blank" rel="noopener"><img style="width: 140px" src="/static/Download_on_the_App_Store_Badge.svg"></a></p>
          </b-col>
          <b-col>
            <a href="/login"><img src="/static/app-screenshot.png"></a>
          </b-col>
          <b-col cols="12" class="py-3 text-center">
            <hr class="divider light">
            <br>
            <div class="py-3">
              <div class="lead pb-4">Sign up and easily interact with the Stellar network!</div>
              <b-button href="/register" size="lg" variant="outline-success" class="btn-rounded text-uppercase mx-3 mb-2">sign up</b-button>
              <b-button href="/login" size="lg" variant="outline-info" class="btn-rounded text-uppercase mx-3 mb-2">log in</b-button>
            </div>
            <br>
            <hr class="divider light">
          </b-col>
          <b-col>
            <a href="/login"><img src="/static/iphone-screenshot-home.png" style="width: 90%"></a><br><br>
          </b-col>
          <b-col cols="12" lg="6" xlg="3">
            <h2 class="text-info">Fully-featured</h2>
            <ul class="has-bullets pl-3 py-3">
              <li>manage your Stellar accounts</li>
              <li>send and receive payments</li>
              <li>add and manage your assets from the Stellar network</li>
              <li>add short Stellar (federation) addresses to your accounts</li>
              <li>set the inflation destination for airdrops</li>
              <li>send own assets</li>
              <li>manage contacts</li>
              <li>use payment templates</li>
              <li>merge Stellar accounts</li>
              <li>search, filter and view your transactions</li>
              <li>receive push notifications on your mobile device</li>
            </ul>
            <div>...and much more; Lumenshine is beautiful, user-friendly and security-driven.<br><br></div>
            <h2 class="text-info">Fast and free</h2>
            <p>Transactions settle in seconds and you only need to pay the Stellar network transaction fee. No transaction fee has to be payed to Lumenshine.<br><br></p>
            <h3 class="text-info">Available for web and iOS</h3>
            <p>Lumenshine is currently available for web and iOS. We will soon release our mobile app for Android.</p>
            <p><a href="https://itunes.apple.com/us/app/lumenshine/id1441524975" target="_blank" rel="noopener"><img src="/static/Download_on_the_App_Store_Badge.svg" style="width: 140px"></a></p>
          </b-col>
          <b-col cols="12" class="py-3">
            <p><br></p>
            <hr class="divider light">
            <h3 class="text-info">Open source</h3>
            <p>Lumenshine is open source software developed by <a href="https://soneso.com" target="_blank" rel="noopener">Soneso</a>, a company from Munich, Germany. You can find the Lumenshine source code in our <a href="https://github.com/soneso" target="_blank" rel="noopener">github repository</a>. The Lumenshine source code can be reviewed and audited by anybody.</p>
          </b-col>
          <b-col cols="12" class="py-3">
            <hr class="divider light">
            <h3 class="text-info">Focused on security and usability</h3>
            <p>Lumenshine uses two factor authentication at login. And, on registration, Lumenshine generates a 24 words backup passphrase for you, that is also called "mnemonic". You must write it down to be able to finish the setup process. Your memonic is later used to create new wallets and to sign transactions for you.</p>
            <p>Lumenshine stores your encrypted mnemonic in it's backend database. Before sending it to the server, the client encrypts it by using 256-bit master key encryption and advanced encryption standard (<a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" target="_blank" rel="noopener">AES</a>). The master key is encrypted by a 256-bit <a href="https://en.wikipedia.org/wiki/PBKDF2" target="_blank" rel="noopener">PKDF2</a> encryption key derived from your password with 65.000 itterations. Your password is never sent to the server, so that only you can decrypt your mnemonic. You can read all the details about the Lumenshine wallet security in our <a href="https://github.com/Soneso/lumenshine-concepts/blob/master/Wallet/Security/white-paper/Lumenshine-Wallet-Security-WP.pdf" target="_blank" rel="noopener">Lumenshine Wallet Security Whitepaper.</a></p>
            <p>By using Lumenshine you don't have to insert long secret seeds to sign and submit transactions to the Stellar network. You must only insert your password or authenticate via biometric auth to approve your transaction.</p>
          </b-col>
          <b-col cols="12" class="py-3 text-center">
            <hr class="divider light">
            <div class="py-3">
              <div class="lead pb-4">Sign up now and set-up your new Lumenshine wallet!</div>
              <b-button href="/register" size="lg" variant="outline-success" class="btn-rounded text-uppercase mx-3 mb-2">sign up</b-button>
              <b-button href="/login" size="lg" variant="outline-info" class="btn-rounded text-uppercase mx-3 mb-2">log in</b-button>
            </div>
          </b-col>
          <b-col cols="12" class="py-3">
            <hr class="divider light">
            <h3 class="text-info">Own validator node</h3>
            <p>Lumenshine has its own Stellar validator node, running an instance of Stellar Core, open source software created by the <a href="https://www.stellar.org/" target="_blank" rel="noopener">Stellar Development Foundation</a>.</p>
            <p>By running a validator node, Lumenshine participates in consensus, adding more security to the decentralized Stellar network. Lumenshine sends transactions to the network without depending on a third party - providing you a trusted node to submit transactions to - and see the state of your Stellar accounts.</p>
            <p>Running an own node also gives Lumenshine the possibility to set-up customisations for you, that will automatically trigger actions on events that occur in the Stellar network (such as push notifications on payment received).</p>
            <p>Lumenshine can directly access the history of the network, giving you the possibility to search, filter and view your transactions.</p>
          </b-col>
          <b-col cols="12" class="py-3">
            <hr class="divider light">
            <h3 class="text-info">Stellar Network</h3>
            <p>The Stellar network is hosted by numerous distributed nodes world-wide who are not under the control of any single entity or groups of entities. Lumenshine is only an interface for the Stellar network and does not control the Stellar network. It is not created, sponsored or endorsed by the Stellar Development Foundation.</p>
          </b-col>
        </b-row>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'LandingPage'
};
</script>
