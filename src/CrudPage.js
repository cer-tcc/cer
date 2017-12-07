import { createTimelineRecord, getDocDataWithId } from './utils.js';

export const CrudPage = (superClass) => class extends superClass {
  ready() {
    super.ready();

    // Listen for Firestore collection snapshots
    this.collection.onSnapshot((snapshot) => {
      // Update internal documents list
      this.documents = snapshot.docs.map(getDocDataWithId);

      // Update fuse index
      this.fuse.setCollection(this.documents);
    });

    // Open dialog when a document is selected
    this.$.grid.addEventListener('active-item-changed', (e) => {
      if (! e.detail.value) return;

      this.$.grid.activeItem = null;

      this._openDialog(e.detail.value);
    });

    // Open dialog when clicking to add document
    this.$.fab.addEventListener('tap', (e) => this._openDialog({}));

    // Reset dialog state properly if closed by pressing esc or clicking outside
    this.$.dialog.addEventListener('opened-changed', (e) => {
      if (! e.detail.value) this._closeDialog();
    });
  }

  _openDialog(document) {
    this.document     = Object.assign({}, document);
    this.dialogOpened = true;
  }

  _closeDialog() {
    this.document     = null;
    this.dialogOpened = false;
  }

  _excluir() {
    const id   = this.document.id;
    const data = Object.assign({}, this.document);

    this.collection.doc(id).delete();

    this.dispatchEvent(new CustomEvent('document-deleted', { detail: { id, data } }));
    this._closeDialog();
  }

  _salvar() {
    const form = this._getForm();

    if (! form.validate()) {
      return;
    }

    const id   = this.document.id;
    const data = Object.assign({}, this.document);

    // Remove ID from document body
    delete data.id;

    if (id) {
      this.collection.doc(id).set(data);

      this.dispatchEvent(new CustomEvent('document-updated', { detail: { id, data } }));
    } else {
      this.collection.add(data);

      this.dispatchEvent(new CustomEvent('document-added', { detail: { data } }));
    }

    this._closeDialog();
  }

  _getForm() {
    return this.$.dialog.$.overlay.$.content.querySelector('#form');
  }

  _log(text) {
    this.dispatchEvent(new CustomEvent('toast', { bubbles: true, composed: true, detail: { text } }));

    createTimelineRecord('08 Novembro', text, 'por ' + firebase.auth().currentUser.displayName);
  }

  _pesquisar(documents, pesquisa) {
    if (! pesquisa) {
      return this.documents;
    }

    return this.fuse.search(pesquisa);
  }
}
