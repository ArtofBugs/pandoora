import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

import getDb from '../firebase/initialize'

export async function createTaskList(content) {
  try {
    await addDoc(collection(getDb(), 'listsnew'), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function updateTaskList(list, content) {
  try {
    await updateDoc(doc(getDb(), 'listsnew', list), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function deleteTaskList(list) {
  try {
    await deleteDoc(doc(getDb(), 'listsnew', list))
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}

export const NOTES_PLACEHOLDER = 'Description'
