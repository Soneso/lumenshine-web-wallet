<template>
  <b-row align-h="center" align-v="center">
    <b-col sm="10" md="8">
      <b-card class="p-4 text-justify">
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
            <h5 class="font-weight-600 text-info">FAQ</h5>
            <div role="tablist">
              <b-card-header header-tag="header" class="p-1" role="tab">
                <b-btn v-b-toggle.q1 block href="#" variant="outline-info" class="font-weight-500">Q 1</b-btn>
              </b-card-header>
              <b-collapse id="q1" accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <p class="card-text">
                    I start opened because <code>visible</code> is <code>true</code>
                  </p>
                  <p class="card-text">
                    {{ text }}
                  </p>
                </b-card-body>
              </b-collapse>
              <b-card-header header-tag="header" class="p-1" role="tab">
                <b-btn v-b-toggle.q2 block href="#" variant="outline-info" class="font-weight-500">Q 2</b-btn>
              </b-card-header>
              <b-collapse id="q2" accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <p class="card-text">
                    {{ text }}
                  </p>
                </b-card-body>
              </b-collapse>
              <b-card-header header-tag="header" class="p-1" role="tab">
                <b-btn v-b-toggle.q3 block href="#" variant="outline-info" class="font-weight-500">Q 3</b-btn>
              </b-card-header>
              <b-collapse id="q3" accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <p class="card-text">
                    {{ text }}
                  </p>
                </b-card-body>
              </b-collapse>
            </div>

            <hr class="divider light">
            <h5 class="font-weight-600 text-info">Topics</h5>

            <ul>
              <li>
                <ul class="inline-list pt-4">
                  <li class="pr-3">
                    <i class="icon-bag large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Basics</h6>
                    <span>Guide to getting started with Lumenshine</span>
                  </li>
                </ul>
              </li>
              <li>
                <ul class="inline-list pt-4">
                  <li class="pr-3">
                    <i class="icon-security large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Security</h6>
                    <span>Learn how to keep your Wallets safe</span>
                  </li>
                </ul>
              </li>
              <li>
                <ul class="inline-list pt-4">
                  <li class="pr-3">
                    <i class="icon-wallet large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Wallets</h6>
                    <span>Learn how to master all Wallet features</span>
                  </li>
                </ul>
              </li>
              <li>
                <ul class="inline-list pt-4">
                  <li class="pr-3">
                    <i class="icon-learn-ico large text-info"/>
                  </li>
                  <li>
                    <h6 class="mb-0">Stellar</h6>
                    <span>Learn more about Stellar</span>
                  </li>
                </ul>
              </li>
            </ul>
          </b-col>
        </b-row>

      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'Help',
  data () {
    return {
      text: `
        Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry
        richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor
        brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon
        tempor, sunt aliqua put a bird on it squid single-origin coffee nulla
        assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore
        wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher
        vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic
        synth nesciunt you probably haven't heard of them accusamus labore VHS.
      `
    };
  }
};
</script>
