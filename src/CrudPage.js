import { createTimelineRecord, getDocDataWithId } from './utils.js';

export const CrudPage = (superClass) => class extends superClass {
  static get properties() {
    return {
      documents: { type: Array, value: () => [] },
      pesquisa: String,
      periodo: { type: Number, value: 0 },
      filters: { type: Array, value: () => [
        { label: 'Últimos 7 dias', value: 7 },
        { label: 'Últimos 30 dias', value: 30 },
        { label: 'Desde o começo', value: 0 },
      ]},
    }
  }

  ready() {
    super.ready();

    this.fuse = new Fuse([], {
      keys: this.searchKeys,
      threshold: 0.1,
      tokenize: true,
    });

    // Listen for Firestore collection snapshots
    this.collection.orderBy('dtCriado', 'desc').onSnapshot((snapshot) => {
      // Update internal documents list
      this.documents = snapshot.docs.map(getDocDataWithId);
    });

    // Open dialog when a document is selected
    this.$.grid.addEventListener('active-item-changed', (e) => {
      if (! e.detail.value) return;

      this.$.grid.activeItem = null;

      this._openDialog(e.detail.value);
    });

    // Open empty dialog when clicking on FAB (if it exists)
    if (this.$.fab) {
    this.$.fab.addEventListener('tap', (e) => this._openDialog({}));
    }

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
      data.dtCriado = new Date();

      this.collection.add(data);

      this.dispatchEvent(new CustomEvent('document-added', { detail: { data } }));
    }

    this._closeDialog();
  }

  _pesquisar(documents, pesquisa, periodo) {
    let results = documents.slice();

    if (periodo) {
      const date = new Date();

      date.setDate(date.getDate() - periodo);

      results = results.filter((doc) => doc.dtCriado >= date);
    }

    if (pesquisa) {
      this.fuse.setCollection(results);

      results = this.fuse.search(pesquisa);
    }

    return results;
  }

  _getForm() {
    return this.$.dialog.$.overlay.$.content.querySelector('#form');
  }

  _log(text) {
    this.dispatchEvent(new CustomEvent('toast', { bubbles: true, composed: true, detail: { text } }));

    createTimelineRecord(text, 'por ' + firebase.auth().currentUser.displayName);
  }

  _formatDate(date) {
    return date.toLocaleDateString();
  }
}
