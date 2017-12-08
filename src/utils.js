export const getDocDataWithId = (document) => Object.assign({id: document.id}, document.data());

export const createTimelineRecord = (title, description) => {
  const datetime = new Date();
  const collection = firebase.firestore().collection('timeline');

  collection.add({title, description, datetime});
};

export const createDataProvider = (queryFactory) => (params, callback) => {
  const query = queryFactory(params);

  query.onSnapshot((snapshot) => {
    callback(snapshot.docs.map(getDocDataWithId), snapshot.size)
  });
};
