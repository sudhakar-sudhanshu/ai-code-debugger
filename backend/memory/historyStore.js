let history = [];

exports.add = (entry) => {
  history.push(entry);

  if (history.length > 10) {
    history.shift();
  }
};

exports.get = () => {
  return history;
};