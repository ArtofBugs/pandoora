import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

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

export async function deleteLogEntry(id) {
  try {
    await deleteDoc(doc(getDb(), 'log', id))
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}

export const TOTAL_HOURS = 24
export const BUDGET_FIELDS = {
  Sleep: 0,
  Class: 0,
}

export const NOTES_PLACEHOLDER =
  '**Notes**\n- What are you looking forward to?\n- What distractions can be avoided?\n- Are you facing any roadblocks?'
