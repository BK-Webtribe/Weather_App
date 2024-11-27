import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';  // You already have auth initialized here
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import '../styles/app.css';
import googleLogo from '../images/google.svg'
import appLogo from '../images/logo.svg'
import HomePage from './homepage';

const GoogleAuth: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Handle Google sign-in
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);  // Set the user object to state
    } catch (error) {
      console.error(error);
    }
  };

  // Handle sign-out
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);  // Reset the user state
    } catch (error) {
      console.error(error);
    }
  };

  // Show user info and log out button if authenticated
  if (user) {
    return <HomePage user={user} handleLogout={handleLogout} />;
  }

  // Show login button if not authenticated
  return (
    <div className='login-page'>
        <div className='login-page-content'>
            <img src={appLogo} alt="App logo" className='logo'/>
            <h1>Sign In</h1>
            <p>Log in to access the latest weather updates and forecast details. Signing in ensures you receive personalized and accurate weather information tailored to your location.</p>
            <button onClick={handleLogin} className='google-login-button'><img src={googleLogo} alt="Google Logo" />Log In with Google</button>
        </div>
    </div>
  );
};

export default GoogleAuth;