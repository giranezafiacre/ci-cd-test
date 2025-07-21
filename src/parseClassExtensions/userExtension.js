// const Parse = require('parse/react-native.js');
import Parse from 'parse/react-native';

class ParseUser extends Parse.User {
  constructor(attributes) {
    super('_User');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error("Can't create an invalid Parse User");
      }
    }
  }

  getfirstname() {
    return this.get('firstName');
  }

  setfirstname(value) {
    this.set('firstName', value);
  }

  getlastname() {
    return this.get('lastName');
  }

  setlastname(value) {
    this.set('lastName', value);
  }

  getemailAddress() {
    return this.get('email');
  }

  setemailAddress(value) {
    this.set('email', value);
  }

  getphoneNumber() {
    return this.get('phoneNumber');
  }

  setphoneNumber(value) {
    this.set('phoneNumber', value);
  }
}

// Register the subclass
// Parse.Object.registerSubclass('_User', ParseUser);

Parse.User = ParseUser;

export default ParseUser;