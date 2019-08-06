module.exports = function getUserName(firebaseUser) {
  const { displayName = "" } = firebaseUser;
  return displayName;
};
