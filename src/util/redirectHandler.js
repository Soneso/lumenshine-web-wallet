function makeRedirect (newRouteName, currentRouteName) {
  if (currentRouteName === null || currentRouteName !== newRouteName) {
    return { name: newRouteName };
  }
  return null;
}

export default (userStatus, currentRouteName = null) => {
  if (!userStatus) { // not logged in
    return makeRedirect('Login', currentRouteName);
  }
  if (!userStatus.tfa_confirmed) {
    return makeRedirect('ConfirmTfa', currentRouteName);
  }
  if (!userStatus.mail_confirmed) {
    return makeRedirect('ConfirmEmail', currentRouteName);
  }
  if (!userStatus.mnemonic_confirmed) {
    return makeRedirect('ShowMnemonic', currentRouteName);
  }
  if (['Login', 'MnemonicQuiz', 'ConfirmEmail', 'ConfirmTfa'].includes(currentRouteName)) {
    return makeRedirect('Dashboard', currentRouteName);
  }
  return null;
};
