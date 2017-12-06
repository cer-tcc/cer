import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase as admin.AppOptions);

export { syncUserAuthentication } from './database/syncUserAuthentication';
export { updateUser } from './request/updateUser';
