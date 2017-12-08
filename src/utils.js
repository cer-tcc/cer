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

const daysByPeriodo = {
  "Últimos 7 dias": 7,
  "Últimos 30 dias": 30
};

export const filterByPeriodo = (periodo) => (documents) => {
  const days = daysByPeriodo[periodo];

  if (! days) {
    return documents;
  }

  const date = new Date();

  date.setDate(date.getDate() - days);

  return documents.filter((doc) => doc.dtCriado >= date);
};
