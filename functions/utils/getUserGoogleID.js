module.exports = function getUserGoogleID(firebaseUser) {
  const [{ uid: googleID }] = firebaseUser.providerData.filter(
    ({ providerId }) => providerId === "google.com"
  );

  return googleID;
};
