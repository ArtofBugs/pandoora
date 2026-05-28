import { supabase } from '../supabase/client'

export async function createTaskList(userId, content) {
  try {
    await supabase.from('task_lists').insert({
      user_id: userId,
      title: content.title,
      notes: content.notes,
    })
  } catch (e) {
    console.error('Error adding task list:', e)
  }
}

export async function updateTaskList(userId, listId, content) {
  try {
    await supabase
      .from('task_lists')
      .update({
        title: content.title,
        notes: content.notes,
      })
      .eq('id', listId)
      .eq('user_id', userId)
  } catch (e) {
    console.error('Error updating task list:', e)
  }
}

export async function deleteTaskList(userId, listId) {
  try {
    await supabase
      .from('task_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId)
  } catch (e) {
    console.error('Error deleting task list:', e)
  }
}

export const NOTES_PLACEHOLDER = 'Description'
