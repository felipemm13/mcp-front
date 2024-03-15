import { useContext } from "react";
import { auth } from "./firebaseConfig";
import { Context } from "./Context";

class AuthService {
  constructor() {
  }
  async registerUser(email, password) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      // handle userCredential
    } catch (error) {
      // handle error
    }
  }

  async loginUser(email, password, setUser) {
    try {
      
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      setUser(userCredential);

    } catch (error) {
      setUser(null);
    }
  }

  async logoutUser() {
    try {
      await auth.signOut();
    } catch (error) {
      // handle error
    }
  }

  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      // handle success
    } catch (error) {
      // handle error
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();
