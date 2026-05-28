import { supabase } from '../supabase/client'

export async function createTaskList(userId, content) {
  try {
    await supabase.from('lists').insert({
      user_id: userId,
      title: content.title,
      notes: content.notes,
    })
  } catch (e) {
    console.error('Error adding list:', e)
  }
}

export async function updateTaskList(userId, listId, content) {
  try {
    await supabase
      .from('lists')
      .update({
        title: content.title,
        notes: content.notes,
      })
      .eq('id', listId)
      .eq('user_id', userId)
  } catch (e) {
    console.error('Error updating list:', e)
  }
}

export async function deleteTaskList(userId, listId) {
  try {
    await supabase.from('lists').delete().eq('id', listId).eq('user_id', userId)
  } catch (e) {
    console.error('Error deleting list:', e)
  }
}

export const NOTES_PLACEHOLDER = 'Description'
