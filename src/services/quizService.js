import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Génère un lien unique pour le quiz
const generateQuizLink = (date) => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `quiz-${date}-${randomString}`;
};

// Crée un quiz pour une date donnée
export const createQuiz = async (date, deadline, createdBy) => {
  try {
    const quizId = date; // Format: YYYY-MM-DD
    const quizRef = doc(db, 'quizzes', quizId);
    
    const quizData = {
      date,
      deadline: Timestamp.fromDate(new Date(deadline)),
      link: generateQuizLink(date),
      createdBy,
      createdAt: serverTimestamp()
    };
    
    await setDoc(quizRef, quizData);
    
    return { 
      success: true, 
      quizId,
      link: quizData.link
    };
  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Ajoute une question à un quiz
export const addQuestionToQuiz = async (quizDate, questionData) => {
  try {
    const questionsRef = collection(db, 'quizzes', quizDate, 'questions');
    
    const docRef = await addDoc(questionsRef, {
      ...questionData,
      createdAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      questionId: docRef.id 
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la question:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Récupère le quiz du jour
export const getTodayQuiz = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const quizRef = doc(db, 'quizzes', today);
    const quizSnap = await getDoc(quizRef);
    
    if (!quizSnap.exists()) {
      return { 
        success: false, 
        error: 'Pas de quiz aujourd\'hui' 
      };
    }
    
    // Récupère les questions
    const questionsRef = collection(db, 'quizzes', today, 'questions');
    const questionsQuery = query(questionsRef, orderBy('order', 'asc'));
    const questionsSnap = await getDocs(questionsQuery);
    
    const questions = [];
    questionsSnap.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    
    return { 
      success: true, 
      quiz: { id: quizSnap.id, ...quizSnap.data() },
      questions 
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Vérifie si l'utilisateur a déjà soumis aujourd'hui
export const hasUserSubmittedToday = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef, 
      where('userId', '==', userId),
      where('quizDate', '==', today)
    );
    
    const querySnapshot = await getDocs(q);
    
    return { 
      success: true, 
      hasSubmitted: !querySnapshot.empty 
    };
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Soumet les réponses d'un joueur
export const submitQuizAnswers = async (userId, quizDate, answers) => {
  try {
    // Vérifie d'abord si déjà soumis
    const checkResult = await hasUserSubmittedToday(userId);
    if (checkResult.hasSubmitted) {
      return { 
        success: false, 
        error: 'Vous avez déjà soumis aujourd\'hui' 
      };
    }
    
    // Vérifie la deadline
    const quizRef = doc(db, 'quizzes', quizDate);
    const quizSnap = await getDoc(quizRef);
    
    if (!quizSnap.exists()) {
      return { 
        success: false, 
        error: 'Quiz non trouvé' 
      };
    }
    
    const deadline = quizSnap.data().deadline.toDate();
    if (new Date() > deadline) {
      return { 
        success: false, 
        error: 'La date limite est dépassée' 
      };
    }
    
    // Crée la soumission
    const submissionRef = await addDoc(collection(db, 'submissions'), {
      userId,
      quizDate,
      submittedAt: serverTimestamp(),
      status: 'pending',
      totalPoints: 0
    });
    
    // Ajoute les réponses
    const answersRef = collection(db, 'submissions', submissionRef.id, 'answers');
    
    for (const answer of answers) {
      await addDoc(answersRef, {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: null,
        points: 0
      });
    }
    
    return { 
      success: true, 
      submissionId: submissionRef.id 
    };
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Récupère toutes les soumissions d'un quiz (pour l'organisateur)
export const getQuizSubmissions = async (quizDate) => {
  try {
    const submissionsRef = collection(db, 'submissions');
    const q = query(submissionsRef, where('quizDate', '==', quizDate));
    const querySnapshot = await getDocs(q);
    
    const submissions = [];
    for (const docSnap of querySnapshot.docs) {
      const submission = { id: docSnap.id, ...docSnap.data() };
      
      // Récupère les réponses
      const answersRef = collection(db, 'submissions', docSnap.id, 'answers');
      const answersSnap = await getDocs(answersRef);
      
      submission.answers = [];
      answersSnap.forEach((answerDoc) => {
        submission.answers.push({ id: answerDoc.id, ...answerDoc.data() });
      });
      
      submissions.push(submission);
    }
    
    return { 
      success: true, 
      submissions 
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Corrige une réponse
export const correctAnswer = async (submissionId, answerId, isCorrect, points) => {
  try {
    const answerRef = doc(db, 'submissions', submissionId, 'answers', answerId);
    
    await updateDoc(answerRef, {
      isCorrect,
      points: isCorrect ? points : 0
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la correction:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
import { recalculateUserPoints } from './rankingService';

// Ajoute cette fonction à la fin du fichier, juste avant le dernier }

// Met à jour les points totaux après correction
export const updateTotalPointsAfterCorrection = async (userId) => {
  return await recalculateUserPoints(userId);
};