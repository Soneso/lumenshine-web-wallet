<template>
  <b-container class="bv-example-row">

    <b-row>
      <b-col>
        <h1 class="pt-5">Kitchen Sink UI</h1>
      </b-col>
    </b-row>

    <b-row>
      <b-col>

        <hr>
        <h4 class="py-3">Form</h4>

        <div>
          <b-form v-if="show" @submit="onSubmit" @reset="onReset">
            <b-form-group id="exampleInputGroup1" label="Email address:" label-for="exampleInput1" description="We'll never share your email with anyone else.">
              <b-form-input id="exampleInput1" v-model="form.email" type="email" required placeholder="Enter email"/>
            </b-form-group>

            <b-form-group id="exampleInputGroup2" label="Your Name:" label-for="exampleInput2">
              <b-form-input
                id="exampleInput2"
                v-model="form.name"
                :state="nameState"
                type="text"
                aria-describedby="inputLiveHelp inputLiveFeedback"
                required
                placeholder="Enter name"
              />
              <b-form-invalid-feedback id="inputLiveFeedback">
                Enter at least 3 letters
              </b-form-invalid-feedback>
              <b-form-text id="inputLiveHelp">
                Your full name.
              </b-form-text>
            </b-form-group>

            <b-form-group id="exampleInputGroup3" label="Food:" label-for="exampleInput3">
              <b-form-select id="exampleInput3" v-model="form.food" :options="foods" required/>
            </b-form-group>

            <b-form-group id="exampleGroup4">
              <b-form-checkbox-group id="exampleChecks" v-model="form.checked">
                <b-form-checkbox value="me">Check me out</b-form-checkbox>
                <b-form-checkbox value="that">Check that out</b-form-checkbox>
              </b-form-checkbox-group>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
          </b-form>
        </div>

        <hr>
        <h4 class="py-3">Buttons</h4>

        <div class="row">
          <template v-for="variant in ['primary','secondary','success','outline-success','warning','danger','link']">
            <div v-for="size in ['sm','','lg']" :key="`${variant}_${size}`" class="col-md-4 pb-2">
              <b-button :size="size" :variant="variant">
                {{ variant }} {{ size }}
              </b-button>
            </div>
          </template>
        </div>

        <hr>
        <h4 class="py-3">Button group</h4>
        <div>
          <b-button-group>
            <b-button variant="success">Success</b-button>
            <b-button variant="info">Info</b-button>
            <b-button variant="warning">Warning</b-button>
            <b-button variant="primary">Primary</b-button>
            <b-button variant="danger">Danger</b-button>
            <b-button variant="link">Link</b-button>
          </b-button-group>

          <br><br>
          <div>
            <b-button-group>
              <b-button>Button 1</b-button>
              <b-button>Button 2</b-button>
              <b-dropdown right text="Menu">
                <b-dropdown-item>Item 1</b-dropdown-item>
                <b-dropdown-item>Item 2</b-dropdown-item>
                <b-dropdown-divider/>
                <b-dropdown-item>Item 3</b-dropdown-item>
              </b-dropdown>
              <b-button>Button 3</b-button>
              <b-dropdown right split text="Split Menu">
                <b-dropdown-item>Item 1</b-dropdown-item>
                <b-dropdown-item>Item 2</b-dropdown-item>
                <b-dropdown-divider/>
                <b-dropdown-item>Item 3</b-dropdown-item>
              </b-dropdown>
            </b-button-group>
          </div>
          <br><br>
          <div>
            <b-button-group vertical>
              <b-button>Top</b-button>
              <b-button>Middle</b-button>
              <b-button>Bottom</b-button>
            </b-button-group>
          </div>
        </div>

        <hr>
        <h4 class="py-3">Dropdowns</h4>

        <div>
          <b-dropdown id="ddown1" text="Dropdown Button" class="m-md-2">
            <b-dropdown-item>First Action</b-dropdown-item>
            <b-dropdown-item>Second Action</b-dropdown-item>
            <b-dropdown-item>Third Action</b-dropdown-item>
            <b-dropdown-divider/>
            <b-dropdown-item>Something else here...</b-dropdown-item>
            <b-dropdown-item disabled>Disabled action</b-dropdown-item>
          </b-dropdown>
        </div>

      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <hr>
        <h4 class="py-3">Cards</h4>

        <div>
          <b-card-group deck class="mb-3">
            <b-card bg-variant="primary" text-variant="white" header="Primary" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
            <b-card bg-variant="secondary" text-variant="white" header="Secondary" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
            <b-card bg-variant="success" text-variant="white" header="Success" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
          </b-card-group>
          <b-card-group deck class="mb-3">
            <b-card bg-variant="info" text-variant="white" header="Info" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
            <b-card bg-variant="warning" text-variant="white" header="Warning" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
            <b-card bg-variant="danger" text-variant="white" header="Danger" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
          </b-card-group>
          <b-card-group deck class="mb-3">
            <b-card bg-variant="light" header="Light" class="text-center"><p class="card-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
            <b-card bg-variant="dark" header="Dark" text-variant="white" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
            <b-card header="Default" class="text-center">
              <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </b-card>
          </b-card-group>
        </div>

      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <hr>
        <h4 class="py-3">Alerts</h4>
        <div>
          <b-alert show dismissible variant="light" class="border">Light Alert + default border</b-alert>
          <b-alert show dismissible variant="primary">Primary Alert</b-alert>
          <b-alert show dismissible variant="secondary">Secondary Alert</b-alert>
          <b-alert show dismissible variant="success">Success Alert</b-alert>
          <b-alert show dismissible variant="danger">Danger Alert</b-alert>
          <b-alert show dismissible variant="warning">Warning Alert</b-alert>
          <b-alert show dismissible variant="info">Info Alert</b-alert>
          <b-alert show dismissible variant="dark">Dark Alert</b-alert>
        </div>
        <hr>
        <h4 class="py-3">Badges</h4>

        <div>
          <h2>Example <b-badge>New</b-badge></h2>
          <h3>Example <b-badge>New</b-badge></h3>
          <h4>Example <b-badge>New</b-badge></h4>
          <h5>Example <b-badge>New</b-badge></h5>
          <h6>Example <b-badge>New</b-badge></h6>
        </div>

        <div>
          <b-badge variant="primary">Primary</b-badge>
          <b-badge variant="secondary">Secondary</b-badge>
          <b-badge variant="success">Success</b-badge>
          <b-badge variant="danger">Danger</b-badge>
          <b-badge variant="warning">Warning</b-badge>
          <b-badge variant="info">Info</b-badge>
          <b-badge variant="light">Light</b-badge>
          <b-badge variant="dark">Dark</b-badge>
        </div>

        <hr>
        <h4 class="py-3">Modals</h4>

        <div>
          <b-btn v-b-modal.modal variant="info">Launch demo modal</b-btn>
          <b-modal id="modal" centered size="lg" title="Bootstrap modals">
            <p class="my-4">Hello from modal!</p>
          </b-modal>
        </div>

        <hr>
        <h4 class="py-3">Tooltips</h4>

        <div class="text-center my-3">
          <b-btn v-b-tooltip.hover title="I'm a tooltip!">Hover Me</b-btn>
        </div>

      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <hr>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  data () {
    return {
      form: {
        email: '',
        name: '',
        food: null,
        checked: []
      },
      foods: [
        { text: 'Select One', value: null },
        'Carrots', 'Beans', 'Tomatoes', 'Corn'
      ],
      show: true
    };
  },
  computed: {
    nameState () {
      return this.form.name.length > 2;
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault();
      alert(JSON.stringify(this.form));
    },
    onReset (evt) {
      evt.preventDefault();
      this.form.email = '';
      this.form.name = '';
      this.form.food = null;
      this.form.checked = [];
      this.show = false;
      this.$nextTick(() => { this.show = true; });
    }
  }
};
</script>
