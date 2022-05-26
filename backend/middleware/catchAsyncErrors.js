module.exports = (appTryCatch) => (req, res, next) => {
  Promise.resolve(appTryCatch(req, res, next)).catch(next);
};
