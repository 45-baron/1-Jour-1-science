import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';

// ==========================================
// ORGANISATEURS (SMS uniquement)
// ==========================================

const AUTHORIZED_ADMINS = [
  '+22812345678', // Numéro de test Firebase (code: 123456)
  '+22890000000',
  '+22891234567'
];

export const checkOrganizerAccess = (phoneNumber) => {
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  return AUTHORIZED_ADMINS.includes(cleanPhone);
};

export const setupRecaptcha = (buttonId) => {
  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log('Nettoyage recaptcha ignoré');
      }
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: 'invisible',
      callback: () => console.log('✅ reCAPTCHA résolu'),
      'expired-callback': () => console.log('⚠️ reCAPTCHA expiré')
    });
  } catch (error) {
    console.error('Erreur reCAPTCHA:', error);
  }
};

export const sendVerificationCode = async (phoneNumber) => {
  try {
    if (!window.recaptchaVerifier) {
      return { success: false, error: 'reCAPTCHA non initialisé' };
    }

    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    
    window.confirmationResult = confirmationResult;
    console.log('✅ Code SMS envoyé');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur SMS:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/invalid-phone-number') errorMessage = 'Numéro invalide';
    if (error.code === 'auth/too-many-requests') errorMessage = 'Trop de tentatives';
    
    return { success: false, error: errorMessage };
  }
};

export const verifyCode = async (code) => {
  try {
    if (!window.confirmationResult) {
      return { success: false, error: 'Aucune demande en cours' };
    }

    const result = await window.confirmationResult.confirm(code);
    console.log('✅ Connexion SMS réussie');
    
    return { success: true, user: result.user };
  } catch (error) {
    console.error('❌ Erreur code:', error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/invalid-verification-code') errorMessage = 'Code invalide';
    
    return { success: false, error: errorMessage };
  }
};

// ==========================================
// JOUEURS (EMAIL + MOT DE PASSE)
// ==========================================

export const registerWithEmail = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Inscription email réussie:', userCredential.user.uid);
    
    return { 
      success: true, 
      user: userCredential.user,
      fullName 
    };
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    
    let errorMessage = error.message;
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cet email est déjà utilisé';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Mot de passe trop faible (min 6 caractères)';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connexion email réussie:', userCredential.user.uid);
    
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    
    let errorMessage = error.message;
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun compte avec cet email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Mot de passe incorrect';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Email ou mot de passe incorrect';
    }
    
    return { success: false, error: errorMessage };
  }
};

// ==========================================
// COMMUN
// ==========================================

export const logout = async () => {
  try {
    await signOut(auth);
    
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
    }
    
    window.confirmationResult = null;
    console.log('✅ Déconnexion réussie');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => auth.currentUser;


export const isUserLoggedIn = () => !!auth.currentUser;
import { sendPasswordResetEmail } from 'firebase/auth'; // Vérifie que c'est importé en haut

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
