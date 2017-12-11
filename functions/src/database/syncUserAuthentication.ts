import { auth, firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Usuario } from './usuario';

const builder = functions.firestore.document('/usuarios/{id}');

/**
 * Sincronizar usuários com o Firebase Authentication
 */
export const syncUserAuthentication = builder.onWrite((event) => firestore().runTransaction(async (transaction) => {
  const ref = event.data.ref;
  const doc = await transaction.get(ref);

  // Remover usuário excluído
  if (! doc.exists) {
    if (! event.data.previous.uid) {
      return;
    }

    return auth().deleteUser(event.data.previous.uid);
  }

  const usuario = doc.data() as Usuario;

  // Ignorar caso o usuário já tenha sido sincronizado
  if (usuario.sincronizado) {
    return;
  }

  const authData: auth.UpdateRequest = {
    displayName: `${usuario.nome} ${usuario.sobrenome}`,
    email: usuario.email,
  };

  // Trunca senha somente se uma nova foi fornecida
  if (usuario.password) {
    authData.password = usuario.password;
  }

  // Atualizar usuário existente
  if (usuario.uid) {
    await auth().updateUser(usuario.uid, authData);

    return transaction.update(ref, {
      password: firestore.FieldValue.delete(),
      sincronizado: true,
    });
  }

  // Criar novo usuário
  let authUser: auth.UserRecord;

  try {
    // Quando o usuário é criado pelo admin, o email é definido como verificado
    // para evitar que ao fazer login com a conta do Google, a senha seja removida.
    // Veja https://github.com/firebase/firebaseui-web/issues/122 para mais detalhes.
    authData.emailVerified = true;

    authUser = await auth().createUser(authData);
  } catch (e) {
    // Caso uma conta com o mesmo email já exista, a conta existente é atualizada
    if ('auth/email-already-exists' !== e.code) {
        throw e;
    }

    authUser = await auth().getUserByEmail(usuario.email);
    authUser = await auth().updateUser(authUser.uid, authData);
  }

  return transaction.update(ref, {
    password: firestore.FieldValue.delete(),
    sincronizado: true,
    uid: authUser.uid,
  });
}));
