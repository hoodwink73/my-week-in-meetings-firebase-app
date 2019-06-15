const admin = require("firebase-admin");

module.exports = function onDeleteUserRequest(firebaseUID) {
  return admin
    .auth()
    .deleteUser(firebaseUID)
    .then(() => {
      console.log("Successfully deleted user");
    })
    .catch(error => {
      console.log("Error deleting user:", error);
    });
};
