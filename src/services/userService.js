import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Génère un pseudo aléatoire ALPHANUMÉRIQUE (ex: Abter89ei6)
const generatePseudo = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pseudo = '';
  for (let i = 0; i < 10; i++) {
    pseudo += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return pseudo;
};

// ========================================
// CRÉER UN UTILISATEUR
// ========================================
export const createUser = async (uid, phoneNumber, fullName) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userData = {
      uid,
      phoneNumber,
      fullName, // Nom réel (visible par organisateur)
      pseudo: generatePseudo(), // Pseudo public (classement)
      role: 'player',
      totalPoints: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, userData);
    
    console.log('✅ Utilisateur créé:', uid);
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// RÉCUPÉRER UN UTILISATEUR (FONCTION MANQUANTE)
// ========================================
export const getUser = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      console.log('✅ Utilisateur trouvé:', uid);
      return { 
        success: true, 
        user: userSnap.data() 
      };
    } else {
      console.log('⚠️ Utilisateur non trouvé:', uid);
      return { 
        success: false, 
        error: 'Utilisateur non trouvé' 
      };
    }
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ========================================
// METTRE À JOUR LES POINTS
// ========================================
export const updateUserPoints = async (uid, points) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      totalPoints: points,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Points mis à jour:', uid, points);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur mise à jour points:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ========================================
// METTRE À JOUR LE RÔLE
// ========================================
export const updateUserRole = async (uid, role) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Rôle mis à jour:', uid, role);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur mise à jour rôle:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ========================================
// AJOUTER DES POINTS (sans écraser)
// ========================================
export const addPoints = async (uid, pointsToAdd) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }
    
    const currentPoints = userSnap.data().totalPoints || 0;
    const newTotal = currentPoints + pointsToAdd;
    
    await updateDoc(userRef, {
      totalPoints: newTotal,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Points ajoutés:', uid, `${currentPoints} + ${pointsToAdd} = ${newTotal}`);
    
    return { success: true, newTotal };
  } catch (error) {
    console.error('❌ Erreur ajout points:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};