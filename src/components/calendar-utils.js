import { supabase } from '../supabase/client'

export async function getPeriods(userId) {
  if (!userId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('calendar')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true })

  return { data, error }
}

export async function createPeriod(type, start_time, end_time) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Supabase auth error:', authError)
    return null
  }

  const { data, error } = await supabase.from('calendar').insert([
    {
      type: type,
      start_time: start_time,
      end_time: end_time,
      user_id: user.id,
    },
  ])

  if (error) {
    console.error('Error adding calendar period:', error)
    return null
  }

  return data?.[0] ?? null
}

export async function updatePeriod(id, start_time, end_time) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Supabase auth error:', authError)
    return null
  }

  const { data, error } = await supabase
    .from('calendar')
    .update({
      start_time: start_time,
      end_time: end_time,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating calendar period:', error)
    return null
  }

  return data?.[0] ?? null
}

export async function deletePeriod(id) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Supabase auth error:', authError)
    return null
  }

  const { error } = await supabase
    .from('calendar')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting calendar period:', error)
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
