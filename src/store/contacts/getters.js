export default {
  contacts: state => ({ err: state.contactsErrors, loading: state.contactsLoading, res: state.contactsResult }),
  addContactStatus: state => ({ err: state.addContactErrors, loading: state.addContactLoading }),
  editContactStatus: state => ({ err: state.editContactErrors, loading: state.editContactLoading }),
  removeContactStatus: state => ({ err: state.removeContactErrors, loading: state.removeContactLoading }),
};
