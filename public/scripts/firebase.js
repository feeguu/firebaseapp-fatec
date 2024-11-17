import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6cWIOFfKLinLUKmd15WrXxsSbrcRaP0s",
  authDomain: "todo-27fa0.firebaseapp.com",
  projectId: "todo-27fa0",
  storageBucket: "todo-27fa0.firebasestorage.app",
  messagingSenderId: "915142190227",
  appId: "1:915142190227:web:4745308aef3ba3b2e79966",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function loginWithEmailAndPassword(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    // console.error(error);
    return false;
  }
}

export async function logout() {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    return false;
  }
}

export async function registerUser(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userId = result.user.uid;

    const token = await result.user.getIdToken();
    document.cookie = `token=${token}`;

    const docRef = doc(db, "users", userId);
    await setDoc(docRef, {
      id: userId,
      groups: [],
    });

    const user = await setDoc(docRef, {
      id: userId,
    });

    const groupsCollection = collection(db, `users/${userId}/groups`);
    const { id } = await addDoc(groupsCollection, {
      id: userId,
      name: "Personal",
    });

    const tasksCollection = collection(
      db,
      `users/${userId}/groups/${id}/tasks`
    );

    await addDoc(tasksCollection, {
      id: userId,
      name: "Sample task",
      description: "This is a sample task",
      dueDate: new Date(),
      completed: false,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userId = result.user.uid;

    const token = await result.user.getIdToken();
    document.cookie = `token=${token}`;

    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return true;
    } else {
      const user = await setDoc(docRef, {
        id: userId,
      });

      const groupsCollection = collection(db, `users/${userId}/groups`);
      const { id } = await addDoc(groupsCollection, {
        id: userId,
        name: "Personal",
      });

      const tasksCollection = collection(
        db,
        `users/${userId}/groups/${id}/tasks`
      );

      await addDoc(tasksCollection, {
        id: userId,
        name: "Sample task",
        description: "This is a sample task",
        dueDate: new Date(),
        completed: false,
      });
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function deleteTask(groupId, taskId) {
  const userId = auth.currentUser.uid;
  const task = doc(db, `users/${userId}/groups/${groupId}/tasks`, taskId);
  await deleteDoc(task);
}

export async function addTask(groupId, name, description) {
  const userId = auth.currentUser.uid;
  const tasksCollection = collection(
    db,
    `users/${userId}/groups/${groupId}/tasks`
  );
  const { id } = await addDoc(tasksCollection, {
    name,
    description,
    created: new Date(),
    completed: false,
  });
  return id;
}

export async function updateTask(groupId, taskId, data) {
  const userId = auth.currentUser.uid;
  const task = doc(db, `users/${userId}/groups/${groupId}/tasks`, taskId);
  await updateDoc(task, data);
}

export async function updateGroup(groupId, data) {
  const userId = auth.currentUser.uid;
  const group = doc(db, `users/${userId}/groups`, groupId);
  await updateDoc(group, data);
}

export async function deleteGroup(groupId) {
  const userId = auth.currentUser.uid;
  const group = doc(db, `users/${userId}/groups`, groupId);
  await deleteDoc(group);
}

export async function addGroup(name) {
  const userId = auth.currentUser.uid;
  const groupsCollection = collection(db, `users/${userId}/groups`);
  const { id } = await addDoc(groupsCollection, {
    name,
  });
  return id;
}
