import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore'

import getDb from '../firebase/initialize'

export async function createTaskNew(list, content, repeating) {
  // For model-accurate repeating tasks, I need canonical tasks with
  // lists pointing to tasks as references...
  // yes, looping single reads would be more expensive than
  // simply querying I would think,
  // and I can't think of any better way to do this.
  // What Firebase is lacking is a way for a single object to belong
  // to multiple groups. I maybe should have used a different database
  // engine. If you know of any better ones that could fit this
  // model better, send me an issue!
  // Either way, I'm instead going to scrap this idea,
  // because I like to make tasks that repeat from a template but
  // edit individual occurrences, and canonical tasks would edit all
  // instances of the task. So instead, I'm opting to make repeating
  // tasks a separate system entirely that represent "templates" for actual tasks.
  // In the actual task interface, the "Repeat" markers are just visual markers,
  // not actual links to anything else.

  // The code I had before:
  // let id = ''
  // try {
  //   id = await addDoc(collection(getDb(), 'tasksnew'), content)
  // } catch (e) {
  //   console.error('Error adding document:', e)
  // }
  // try {
  //   await updateDoc(doc(getDb(), 'listsnew', list), {
  //     tasks: arrayUnion(id),
  //   })
  // } catch (e) {
  //   console.error('Error adding id to array:', id, ' because ', e)
  // }

  if (repeating) {
    try {
      await addDoc(collection(getDb(), 'repeats'), content)
    } catch (e) {
      console.error('Error adding document:', e)
    }
  } else {
    try {
      await addDoc(collection(getDb(), 'listsnew', list, 'tasks'), content)
    } catch (e) {
      console.error('Error adding document:', e)
    }
  }
}

export async function updateTaskNew(list, task, content, repeating) {
  if (repeating) {
    try {
      await updateDoc(doc(getDb(), 'repeats', task), content)
    } catch (e) {
      console.error('Error adding document:', e)
    }
  } else {
    try {
      await updateDoc(doc(getDb(), 'listsnew', list, 'tasks', task), content)
    } catch (e) {
      console.error('Error adding document:', e)
    }
  }
}

export async function deleteTaskNew(list, task, repeating) {
  if (repeating) {
    try {
      await deleteDoc(doc(getDb(), 'repeats', task))
    } catch (e) {
      console.error('Error deleting document:', e)
    }
  } else {
    try {
      await deleteDoc(doc(getDb(), 'listsnew', list, 'tasks', task))
    } catch (e) {
      console.error('Error deleting document:', e)
    }
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
