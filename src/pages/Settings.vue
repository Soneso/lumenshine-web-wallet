<template>
  <b-row align-h="center" align-v="center">
    <b-col cols="11" sm="9" md="7" lg="6" xl="5">
      <b-card class="p-4 single-card">
        <h4 class="form-headline text-uppercase">Settings</h4>
        <ul class="navi-links pt-4">
          <li>
            <router-link to="/change-password">Change Password</router-link>
          </li>
          <li>
            <router-link to="/change-tfa">Change 2FA Secret</router-link>
          </li>
          <li>
            <router-link to="/backup-mnemonic">Backup Secret/Mnemonic</router-link>
          </li>
        </ul>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
};
</script>
