import { supabase } from '../supabase/client'

export async function getLogEntries(userId) {
  if (!userId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase.from('log').select('*').eq('user_id', userId)

  return { data, error }
}

export async function createLogEntry(content) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Supabase auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('log')
    .insert([{ ...content, user_id: user.id }])

  if (error) {
    console.error('Error adding log entry:', error)
    return null
  }

  return data?.[0] ?? null
}

export async function updateLogEntry(id, content) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Supabase auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('log')
    .update(content)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating log entry:', error)
    return null
  }

  return data?.[0] ?? null
}

export async function deleteLogEntry(id) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Supabase auth error:', authError)
    return null
  }

  const { error } = await supabase.from('log').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error deleting log entry:', error)
    return null
  }

  return true
}

export const TOTAL_HOURS = 24
export const BUDGET_FIELDS = {
  Sleep: 0,
  Meals: 0,
  'Class / Work': 0,
  Extracurriculars: 0,
  Studying: 0,
  Chores: 0,
  'Self-Care & Exercise': 0,
  'Outings & Social Events': 0,
  'Social Media & Entertainment': 0,
  'Time for Friends & Loved Ones': 0,
  'Miscellaneous / Other': 0,
}

export const NOTES_PLACEHOLDER =
  '**Notes**\n- What are you looking forward to?\n- What distractions can be avoided?\n- Are you facing any roadblocks?'
