import { doc, collection, updateDoc, addDoc } from 'firebase/firestore'

import getDb from '../firebase/initialize'

export async function createLogEntry(content) {
  try {
    await addDoc(collection(getDb(), 'log'), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function updateLogEntry(id, content) {
  try {
    await updateDoc(doc(getDb(), 'log', id), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}
