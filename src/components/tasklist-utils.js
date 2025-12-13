import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

import getDb, { auth } from '../firebase/initialize'

export async function createTaskList(content) {
  try {
    await addDoc(
      collection(getDb(), 'users', auth.currentUser?.uid, 'listsnew'),
      content
    )
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function updateTaskList(list, content) {
  try {
    await updateDoc(
      doc(getDb(), 'users', auth.currentUser?.uid, 'listsnew', list),
      content
    )
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function deleteTaskList(list) {
  try {
    await deleteDoc(
      doc(getDb(), 'users', auth.currentUser?.uid, 'listsnew', list)
    )
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}

export const NOTES_PLACEHOLDER = 'Description'
