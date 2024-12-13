import { doc, updateDoc, deleteField } from 'firebase/firestore'

import getDb from '../firebase/initialize'

// Shared by Task and TaskPopup
export async function updateTask(id, field, content, type) {
  console.log(content)
  if (
    ((type == 'date' || type == 'time') && content == '') ||
    content == 'None'
  ) {
    console.log('Edited to empty date or time')
    await updateDoc(doc(getDb(), 'tasks', id), {
      [field]: deleteField(),
    })
    return
  }
  if (type == 'date') {
    content = new Date(content + ' 00:00:00')
  } else if (type == 'time') {
    content = new Date('1970-01-01 ' + content)
  } else if (type == 'number') {
    content = Number(content)
  } else {
  }

  try {
    console.log(`Updating ${field} to ${content}`)
    await updateDoc(doc(getDb(), 'tasks', id), {
      [field]: content,
    })
  } catch (e) {
    console.error('Error updating document:', e)
  }
}
