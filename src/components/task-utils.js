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
    await addDoc(collection(getDb(), 'lists'), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function updateTaskList(list, content) {
  try {
    await updateDoc(doc(getDb(), 'lists', list), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function deleteTaskList(list) {
  try {
    await deleteDoc(doc(getDb(), 'lists', list))
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}

export async function createTask(list, content) {
  try {
    await addDoc(collection(getDb(), 'lists', list, 'tasks'), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function setTask(list, task, content) {
  try {
    await setDoc(doc(getDb(), 'lists', list, 'tasks', task), content)
  } catch (e) {
    console.error('Error adding document:', e)
  }
}

export async function deleteTask(list, task) {
  try {
    await deleteDoc(doc(getDb(), 'lists', list, 'tasks', task))
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}
