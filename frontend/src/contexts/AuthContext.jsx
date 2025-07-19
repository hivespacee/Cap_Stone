// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../config/firebase'; // Ensure 'db' is imported here!
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create or update a user's profile in Firestore
  const createUserProfile = async (userAuth, additionalData = {}) => {
    if (!userAuth) return;

    const userRef = doc(db, 'users', userAuth.uid); // Document ID is the user's UID
    const { displayName, email, photoURL, uid } = userAuth;

    const userProfileData = {
      uid: uid,
      email: email,
      // Prioritize displayName, then derive from email, fallback to 'Unknown User'
      name: displayName || email?.split('@')[0] || 'Unknown User',
      // Generate avatar URL if photoURL is not available
      avatar: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email?.split('@')[0] || 'Unknown User')}&background=4E6766&color=fff`,
      createdAt: new Date().toISOString(), // Use client timestamp for profile creation
      ...additionalData // Merge any additional data passed (e.g., name from signup form)
    };

    try {
      await setDoc(userRef, userProfileData, { merge: true }); // Use merge: true to avoid overwriting existing data
      console.log("User profile updated/created in Firestore:", userProfileData);
    } catch (error) {
      console.error("Error creating/updating user profile in Firestore:", error);
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        // When auth state changes and a user is logged in, ensure their profile is in Firestore
        await createUserProfile(userAuth);

        setUser({
          id: userAuth.uid,
          email: userAuth.email,
          name: userAuth.displayName || userAuth.email?.split('@')[0] || 'Unknown User',
          avatar: userAuth.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userAuth.displayName || userAuth.email?.split('@')[0] || 'Unknown User')}&background=4E6766&color=fff`,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Depend on nothing for a single run on mount/unmount

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Ensure profile exists/updates on login
      await createUserProfile(result.user);
      return result.user;
    }
    catch (error) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, {
        displayName: name,
      });
      // Ensure profile is created/updated on signup, passing the provided name
      await createUserProfile(result.user, { name });
      return result.user;
    }
    catch (error) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    }
    catch (error) {
      throw new Error('Failed to logout');
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    }
    catch (error) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Ensure profile exists/updates on Google login
      await createUserProfile(result.user);
      return result.user;
    } catch (error) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};