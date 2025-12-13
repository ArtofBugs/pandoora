// import {
//   doc,
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
// } from 'firebase/firestore'

// import getDb from '../firebase/initialize'

// export async function createRepeatTask(content) {
//   try {
//     await addDoc(collection(getDb(), 'repeats'), content)
//   } catch (e) {
//     console.error('Error adding document:', e)
//   }
// }

// export async function updateRepeatTask(id, content) {
//   try {
//     await updateDoc(doc(getDb(), 'repeats', id), content)
//   } catch (e) {
//     console.error('Error adding document:', e)
//   }
// }

// export async function deleteRepeatTask(id) {
//   try {
//     await deleteDoc(doc(getDb(), id))
//   } catch (e) {
//     console.error('Error deleting document:', e)
//   }
// }

export function getToday() {
  const days = {
    0: 'Su',
    1: 'M',
    2: 'Tu',
    3: 'W',
    4: 'Th',
    5: 'F',
    6: 'Sa',
  }
  const now = new Date()
  return days[now.getDay()]
}

export const NOTES_PLACEHOLDER = 'Notes'

export const DEFAULT_REPEATS = {
  Su: false,
  M: false,
  Tu: false,
  W: false,
  Th: false,
  F: false,
  Sa: false,
}
