import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore'

import getDb from '../firebase/initialize'

export async function createTaskNew(list, content) {
  let id = ''
  try {
    id = await addDoc(collection(getDb(), 'tasksnew'), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
  try {
    await updateDoc(doc(getDb(), 'listsnew', list), {
      tasks: arrayUnion(id),
    })
  } catch (e) {
    console.error('Error adding id to array:', id, ' because ', e)
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

export const TASK_FIELDS = {
  title: '',
  notes: '',
  time: {
    Estimated: '',
    Actual: '',
    Due: '',
    Finished: '',
  },
  repeats: {
    Su: false,
    M: false,
    Tu: false,
    W: false,
    Th: false,
    F: false,
    Sa: false,
  },
  earns: '',
}
