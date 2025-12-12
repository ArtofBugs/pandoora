import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

import getDb from '../firebase/initialize'

export async function createTaskNew(list, content) {
  try {
    await addDoc(collection(getDb(), 'listsnew', list, 'tasks'), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function updateTaskNew(list, task, content) {
  try {
    await updateDoc(doc(getDb(), 'listsnew', list, 'tasks', task), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function deleteTaskNew(list, task) {
  try {
    await deleteDoc(doc(getDb(), 'listsnew', list, 'tasks', task))
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}

export const NOTES_PLACEHOLDER = 'Notes'
