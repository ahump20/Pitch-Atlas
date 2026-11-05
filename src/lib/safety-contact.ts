import { ensureSession } from './community'
import { supabase } from './supabase'

export async function sendSafetyContact(message: string, replyEmail: string): Promise<string> {
  const text = message.trim()
  const email = replyEmail.trim()
  const characterCount = Array.from(text).length
  if (characterCount < 10 || characterCount > 4000) {
    throw new Error('Enter a message between 10 and 4000 characters.')
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error('Enter a valid reply email address.')
  }

  // Contact is a write-intent action. Opening Support never creates an account.
  // The server deduplicates exact retries and keeps the message private.
  try {
    await ensureSession()
  } catch {
    throw new Error('Your message was not confirmed. Try again.')
  }
  const { data, error } = await supabase.rpc('submit_safety_contact', {
    p_message: text,
    p_reply_email: email || null,
  })
  if (error) {
    if (error.message.includes('rate_limit:')) throw new Error('Please wait before sending another message.')
    throw new Error('Your message was not confirmed. Try again.')
  }
  if (typeof data !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) {
    throw new Error('Your message was not confirmed. Try again.')
  }
  return data
}
