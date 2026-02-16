import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Génère un ID unique pour la compétition
const generateCompetitionId = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '-');
  const timestamp = Date.now();
  return `${cleanName}-${timestamp}`;
};

// Crée une nouvelle compétition
export const createCompetition = async (name, organizerId) => {
  try {
    const competitionId = generateCompetitionId(name);
    const competitionRef = doc(db, 'competitions', competitionId);
    
    const competitionData = {
      id: competitionId,
      name,
      organizerId,
      collaborators: [],
      participants: [],
      createdAt: serverTimestamp(),
      isActive: true
    };
    
    await setDoc(competitionRef, competitionData);
    
    console.log('✅ Compétition créée:', competitionId);
    
    return { 
      success: true, 
      competitionId,
      competition: competitionData
    };
  } catch (error) {
    console.error('❌ Erreur création compétition:', error);
    return { success: false, error: error.message };
  }
};

// Récupère une compétition par ID
export const getCompetition = async (competitionId) => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionSnap = await getDoc(competitionRef);
    
    if (competitionSnap.exists()) {
      return { 
        success: true, 
        competition: { id: competitionSnap.id, ...competitionSnap.data() }
      };
    } else {
      return { success: false, error: 'Compétition non trouvée' };
    }
  } catch (error) {
    console.error('❌ Erreur récupération compétition:', error);
    return { success: false, error: error.message };
  }
};

// Rechercher une compétition par nom
export const searchCompetition = async (searchTerm) => {
  try {
    const competitionsRef = collection(db, 'competitions');
    const q = query(competitionsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    const results = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ id: doc.id, ...data });
      }
    });
    
    console.log('🔍 Résultats recherche:', results.length);
    
    return { success: true, competitions: results };
  } catch (error) {
    console.error('❌ Erreur recherche:', error);
    return { success: false, error: error.message };
  }
};

// Rejoindre une compétition
export const joinCompetition = async (competitionId, userId) => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    
    await updateDoc(competitionRef, {
      participants: arrayUnion(userId)
    });
    
    console.log('✅ Utilisateur rejoint la compétition');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur rejoindre:', error);
    return { success: false, error: error.message };
  }
};

// Ajouter un collaborateur
export const addCollaborator = async (competitionId, collaboratorPhone) => {
  try {
    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionSnap = await getDoc(competitionRef);
    
    if (!competitionSnap.exists()) {
      return { success: false, error: 'Compétition non trouvée' };
    }
    
    const data = competitionSnap.data();
    
    if (data.collaborators.length >= 2) {
      return { success: false, error: 'Maximum 2 collaborateurs atteint' };
    }
    
    // Chercher l'utilisateur par numéro
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', collaboratorPhone));
    const userSnap = await getDocs(q);
    
    if (userSnap.empty) {
      return { success: false, error: 'Utilisateur non trouvé avec ce numéro' };
    }
    
    const userId = userSnap.docs[0].id;
    
    await updateDoc(competitionRef, {
      collaborators: arrayUnion(userId)
    });
    
    // Mettre à jour le rôle de l'utilisateur
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'organizer' });
    
    console.log('✅ Collaborateur ajouté');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur ajout collaborateur:', error);
    return { success: false, error: error.message };
  }
};

// Créer une session de questions (journalière)
export const createQuestionSession = async (competitionId, deadline) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessionId = `${competitionId}-${today}`;
    const sessionRef = doc(db, 'questionSessions', sessionId);
    
    const sessionData = {
      id: sessionId,
      competitionId,
      date: today,
      deadline: Timestamp.fromDate(new Date(deadline)),
      questions: [],
      link: `${window.location.origin}/quiz/${sessionId}`,
      createdAt: serverTimestamp()
    };
    
    await setDoc(sessionRef, sessionData);
    
    console.log('✅ Session de questions créée');
    
    return { 
      success: true, 
      sessionId,
      link: sessionData.link
    };
  } catch (error) {
    console.error('❌ Erreur création session:', error);
    return { success: false, error: error.message };
  }
};

// Ajouter une question à la session
export const addQuestionToSession = async (sessionId, questionData) => {
  try {
    const sessionRef = doc(db, 'questionSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return { success: false, error: 'Session non trouvée' };
    }
    
    const currentQuestions = sessionSnap.data().questions || [];
    
    if (currentQuestions.length >= 20) {
      return { success: false, error: 'Maximum 20 questions atteint' };
    }
    
    const newQuestion = {
      id: `q${currentQuestions.length + 1}`,
      ...questionData,
      order: currentQuestions.length + 1
    };
    
    await updateDoc(sessionRef, {
      questions: arrayUnion(newQuestion)
    });
    
    console.log('✅ Question ajoutée');
    
    return { success: true, question: newQuestion };
  } catch (error) {
    console.error('❌ Erreur ajout question:', error);
    return { success: false, error: error.message };
  }
};

// Soumettre les réponses d'un joueur
export const submitAnswers = async (sessionId, userId, answers) => {
  try {
    const submissionId = `${sessionId}-${userId}`;
    const submissionRef = doc(db, 'answers', submissionId);
    
    const submissionData = {
      id: submissionId,
      sessionId,
      userId,
      answers,
      submittedAt: serverTimestamp(),
      corrected: false,
      totalPoints: 0
    };
    
    await setDoc(submissionRef, submissionData);
    
    console.log('✅ Réponses soumises');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur soumission:', error);
    return { success: false, error: error.message };
  }
};

// Corriger les réponses
export const correctAnswers = async (submissionId, corrections) => {
  try {
    const submissionRef = doc(db, 'answers', submissionId);
    const submissionSnap = await getDoc(submissionRef);
    
    if (!submissionSnap.exists()) {
      return { success: false, error: 'Soumission non trouvée' };
    }
    
    const data = submissionSnap.data();
    const updatedAnswers = data.answers.map((answer, index) => ({
      ...answer,
      isCorrect: corrections[index].isCorrect,
      points: corrections[index].isCorrect ? answer.points : 0
    }));
    
    const totalPoints = updatedAnswers.reduce((sum, a) => sum + a.points, 0);
    
    await updateDoc(submissionRef, {
      answers: updatedAnswers,
      corrected: true,
      totalPoints
    });
    
    // Mettre à jour les points totaux de l'utilisateur
    const userRef = doc(db, 'users', data.userId);
    const userSnap = await getDoc(userRef);
    const currentPoints = userSnap.data().totalPoints || 0;
    
    await updateDoc(userRef, {
      totalPoints: currentPoints + totalPoints
    });
    
    console.log('✅ Réponses corrigées, points attribués:', totalPoints);
    
    return { success: true, totalPoints };
  } catch (error) {
    console.error('❌ Erreur correction:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer toutes les soumissions d'une session
export const getSessionSubmissions = async (sessionId) => {
  try {
    const answersRef = collection(db, 'answers');
    const q = query(answersRef, where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);
    
    const submissions = [];
    for (const docSnap of querySnapshot.docs) {
      const submission = { id: docSnap.id, ...docSnap.data() };
      
      // Récupérer les infos utilisateur
      const userRef = doc(db, 'users', submission.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        submission.user = userSnap.data();
      }
      
      submissions.push(submission);
    }
    
    console.log('📋 Soumissions récupérées:', submissions.length);
    
    return { success: true, submissions };
  } catch (error) {
    console.error('❌ Erreur récupération soumissions:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer les compétitions d'un organisateur
export const getOrganizerCompetitions = async (organizerId) => {
  try {
    const competitionsRef = collection(db, 'competitions');
    const q = query(
      competitionsRef, 
      where('organizerId', '==', organizerId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const competitions = [];
    querySnapshot.forEach((doc) => {
      competitions.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('🏆 Compétitions récupérées:', competitions.length);
    
    return { success: true, competitions };
  } catch (error) {
    console.error('❌ Erreur récupération compétitions:', error);
    return { success: false, error: error.message };
  }
};
