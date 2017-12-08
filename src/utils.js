export const getDocDataWithId = (document) => Object.assign({id: document.id}, document.data());

export const createTimelineRecord = (date, title, description) => {
  const collection = firebase.firestore().collection('timeline');

  const datetime = new Date();

  collection.add({date, title, description, datetime});
};

export const createDataProvider = (queryFactory) => (params, callback) => {
  const query = queryFactory(params);

  query.onSnapshot((snapshot) => {
    callback(snapshot.docs.map(getDocDataWithId), snapshot.size)
  });
};
