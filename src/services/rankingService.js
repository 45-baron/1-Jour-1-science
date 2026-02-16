import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Récupère le classement général
export const getGlobalRanking = async (limitCount = 50) => {
  try {
    const usersRef = collection(db, 'users');
    // On ne récupère que les joueurs (pas les admins) triés par points
    const q = query(
      usersRef,
      where('role', '==', 'player'),
      orderBy('totalPoints', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    const ranking = [];
    let rank = 1;
    
    querySnapshot.forEach((docSnap) => {
      const userData = docSnap.data();
      ranking.push({
        rank,
        uid: docSnap.id,
        pseudo: userData.pseudo || 'Anonyme',
        fullName: userData.fullName || 'Utilisateur',
        totalPoints: userData.totalPoints || 0,
      });
      rank++;
    });
    
    console.log('📊 Classement chargé:', ranking);
    
    return { 
      success: true, 
      ranking 
    };
  } catch (error) {
    console.error('Erreur classement:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Récupère le rang d'un utilisateur spécifique
export const getUserRank = async (userId) => {
  try {
    const result = await getGlobalRanking();
    
    if (result.success) {
      const userRanking = result.ranking.find(r => r.uid === userId);
      return {
        success: true,
        rank: userRanking ? userRanking.rank : null,
        totalPlayers: result.ranking.length
      };
    }
    
    return result;
  } catch (error) {
    console.error('Erreur:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Recalcule et met à jour les points totaux d'un utilisateur
export const recalculateUserPoints = async (userId) => {
  try {
    // Récupère toutes les soumissions de l'utilisateur
    const submissionsRef = collection(db, 'submissions');
    const querySnapshot = await getDocs(submissionsRef);
    
    let totalPoints = 0;
    
    for (const docSnap of querySnapshot.docs) {
      const submission = docSnap.data();
      
      if (submission.userId === userId) {
        // Récupère les réponses
        const answersRef = collection(db, 'submissions', docSnap.id, 'answers');
        const answersSnap = await getDocs(answersRef);
        
        answersSnap.forEach((answerDoc) => {
          const answer = answerDoc.data();
          if (answer.isCorrect === true) {
            totalPoints += answer.points || 0;
          }
        });
      }
    }
    
    // Récupère aussi les points des compétitions (nouveau système)
    const answersRef = collection(db, 'answers');
    const answersSnapshot = await getDocs(answersRef);
    
    answersSnapshot.forEach((docSnap) => {
      const answerData = docSnap.data();
      if (answerData.userId === userId && answerData.corrected) {
        totalPoints += answerData.totalPoints || 0;
      }
    });
    
    // Met à jour les points dans le profil utilisateur
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalPoints
    });
    
    console.log(`✅ Points recalculés pour ${userId}: ${totalPoints}`);
    
    return { 
      success: true, 
      totalPoints 
    };
  } catch (error) {
    console.error('Erreur recalcul points:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};