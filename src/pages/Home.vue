<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="12" sm="11" md="10" lg="9" xl="8">
      <b-card class="p-4">
        <b-row>
          <b-col cols="12" lg="4" xlg="3">
            <h1><small class="text-info">Introducing</small> <span class="font-weight-800 text-primary">Lumenshine</span></h1>
            <p class="lead">Lumenshine is a multi-platform, user-friendly, fully-featured wallet app for the decentralized Stellar network.</p>
          </b-col>
          <b-col>
            <img src="/static/app-screenshot.png">
          </b-col>
          <b-col cols="12" class="py-3 text-center">
            <hr class="divider light">
            <div class="py-3">
              <div class="lead pb-4">Sign up and easily interact with the Stellar network!</div>
              <b-button href="/register" size="lg" variant="outline-success" class="btn-rounded text-uppercase mx-3 mb-2">sign up</b-button>
              <b-button href="/login" size="lg" variant="outline-info" class="btn-rounded text-uppercase mx-3 mb-2">log in</b-button>
            </div>
            <hr class="divider light">
          </b-col>
          <b-col cols="12" class="pt-3">
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
              <li>search, filter and view your transactions</li>
              <li>receive push notifications on your mobile device</li>
            </ul>
            <div>...and much more; Lumenshine is beautiful, user-friendly and security-driven.<br><br></div>
          </b-col>
          <b-col cols="12" class="py-3">
            <h3 class="text-info">Fast and free</h3>
            <p>Transactions settle in seconds and you only need to pay the Stellar network transaction fee. No transaction fee has to be payed to Lumenshine.</p>
          </b-col>
          <b-col cols="12" class="py-3">
            <h3 class="text-info">Available for web and soon for mobile</h3>
            <p>Lumenshine is currently available for web and we will soon release our mobile apps for iOS and Android.</p>
          </b-col>
          <b-col cols="12" class="py-3">
            <h3 class="text-info">Open source</h3>
            <p>Lumenshine is open source software developed by <a href="https://soneso.com" target="_blank" rel="noopener">Soneso</a>. You can find it source code in our <a href="https://github.com/soneso" target="_blank" rel="noopener">github repository</a>.</p>
          </b-col>
          <b-col cols="12" class="py-3">
            <h3 class="text-info">Own validator node</h3>
            <p>Lumenshine has its own Stellar validator node, running an instance of Stellar Core, open source software created by the <a href="https://www.stellar.org/" target="_blank" rel="noopener">Stellar Development Foundation</a>.</p>
            <p>By running a validator node, Lumenshine participates in consensus, adding more security to the decentralized Stellar network. Lumenshine sends transactions to the network without depending on a third party - providing you a trusted node to submit transactions to - and see the state of your Stellar accounts.</p>
            <p>Running an own node also gives Lumenshine the possibility to set-up customisations for you, that will automatically trigger actions on events that occur in the Stellar network (such as push notifications on payment received).</p>
            <p>Lumenshine can directly access the history of the network, giving you the possibility to search, filter and view your transactions.</p>
          </b-col>
          <b-col cols="12" class="py-3">
            <h3 class="text-info">Stellar Network</h3>
            <p>The Stellar network is hosted by numerous distributed nodes world-wide who are not under the control of any single entity or groups of entities. Lumenshine is only an interface for the Stellar network and does not control the Stellar network.</p>
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
