import PostalMime from 'postal-mime'
import { insertEmail } from '../repositories/emails'
import type { Env } from '../env'

export async function handleInboundEmail(message: any, env: Env, _ctx: ExecutionContext) {
  try {
    const rawEmail = await new Response(message.raw).arrayBuffer()
    const email = await PostalMime.parse(rawEmail)

    const senderName = email.from?.name || 'unknown'
    const senderEmail = email.from?.address || 'unknown'
    const fromValue = `${senderName} <${senderEmail}>`

    let receivedAt = new Date().toISOString()
    if (email.date) {
      try {
        receivedAt = new Date(email.date).toISOString()
      } catch (e) {
        // If the date header is unparseable, fallback to current time
      }
    }

    await insertEmail(env.DB, {
      id: crypto.randomUUID(),
      to: message.to,
      from: fromValue,
      subject: email.subject || '(no subject)',
      bodyText: email.text || '',
      bodyHtml: email.html || '',
      receivedAt,
    })
  } catch (e) {
    console.error('Failed to process email', e)
    message.setReject('Internal server error')
  }
}
