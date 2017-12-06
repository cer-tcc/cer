import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const updateUser = functions.https.onRequest(async (req, resp) => {
    const uid  = req.body.uid;
    const data = req.body;

    delete data.uid;

    await admin.auth().updateUser(uid, data);

    resp.send({message: 'ok'});
});
