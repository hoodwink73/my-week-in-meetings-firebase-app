module.exports = function getUserGoogleID(firebaseUser) {
  const [{ email }] = firebaseUser.providerData.filter(
    ({ providerId }) => providerId === "google.com"
  );

  return email;
};
