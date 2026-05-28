import { supabase } from '../supabase/client'

export async function createTaskNew(userId, list, content, repeating) {
  if (repeating) {
    try {
      await supabase.from('repeats').insert({
        user_id: userId,
        ...content,
      })
    } catch (e) {
      console.error('Error adding repeating task:', e)
    }
  } else {
    try {
      const res = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          ...content,
        })
        .select('id')
        .single()
      await supabase.from('list_task_relationships').insert({
        list_id: list,
        task_id: res.data.id,
      })
    } catch (e) {
      console.error('Error adding task:', e)
    }
  }
}

export async function updateTaskNew(userId, task, content, repeating) {
  if (repeating) {
    try {
      await supabase
        .from('repeats')
        .update(content)
        .eq('id', task)
        .eq('user_id', userId)
    } catch (e) {
      console.error('Error updating repeating task:', e)
    }
  } else {
    try {
      await supabase
        .from('tasks')
        .update(content)
        .eq('id', task)
        .eq('user_id', userId)
    } catch (e) {
      console.error('Error updating task:', e)
    }
  }
}

export async function deleteTaskNew(userId, task, repeating) {
  if (repeating) {
    try {
      await supabase
        .from('repeats')
        .delete()
        .eq('id', task)
        .eq('user_id', userId)
    } catch (e) {
      console.error('Error deleting repeating task:', e)
    }
  } else {
    try {
      await supabase.from('tasks').delete().eq('id', task).eq('user_id', userId)
    } catch (e) {
      console.error('Error deleting task:', e)
    }
  }
}

export const NOTES_PLACEHOLDER = 'Notes'

export const TASK_FIELDS = {
  title: '',
  notes: '',
  time: {
    'Target time': '',
    'Actual time': '',
  },
  // repeats: {
  //   Su: false,
  //   M: false,
  //   Tu: false,
  //   W: false,
  //   Th: false,
  //   F: false,
  //   Sa: false,
  // },
  // earns: '',
}
