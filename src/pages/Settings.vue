<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 class="page-headline text-uppercase">Settings</h4>
        <ul class="navi-links pt-4">
          <li>
            <router-link to="/change-password" class="py-1 d-block text-gray-500 font-weight-500">Change Password</router-link>
          </li>
          <li>
            <router-link to="/change-tfa" class="py-1 d-block text-gray-500 font-weight-500">Change 2FA Secret</router-link>
          </li>
          <li>
            <router-link to="/backup-mnemonic" class="py-1 d-block text-gray-500 font-weight-500">Backup Secret/Mnemonic</router-link>
          </li>
        </ul>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'Settings'
};
</script>
