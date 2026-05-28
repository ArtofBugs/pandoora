import { supabase } from '../supabase/client'

export async function createTaskNew(userId, list, content) {
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

export async function updateTaskNew(userId, task, content) {
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

export async function deleteTaskNew(userId, task) {
  try {
    await supabase.from('tasks').delete().eq('id', task).eq('user_id', userId)
  } catch (e) {
    console.error('Error deleting task:', e)
  }
}

export async function setFocusedTask(userId, taskId) {
  try {
    // Fetch the current task to check its focus status
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('focus')
      .eq('id', taskId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    const isCurrentlyFocused = currentTask.focus

    if (isCurrentlyFocused) {
      // If the clicked task is currently focused, unfocus it
      await supabase
        .from('tasks')
        .update({ focus: false })
        .eq('id', taskId)
        .eq('user_id', userId)
      await supabase
        .from('settings')
        .update({ focused_task: null })
        .eq('user_id', userId)
    } else {
      // If the clicked task is not currently focused, make it focused.
      // First, unfocus any other task that might be focused by this user.
      await supabase
        .from('tasks')
        .update({ focus: false })
        .eq('user_id', userId)
        .eq('focus', true)
      // Then, focus the clicked task
      await supabase
        .from('tasks')
        .update({ focus: true })
        .eq('id', taskId)
        .eq('user_id', userId)
      // Update the 'settings' table to point to the new focused task
      await supabase
        .from('settings')
        .update({ focused_task: taskId })
        .eq('user_id', userId)
    }
  } catch (e) {
    console.error('Error setting focused task:', e)
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
