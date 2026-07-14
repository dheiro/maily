import { app } from './app'
import { handleInboundEmail } from './services/inbound-email'
import type { Env } from './env'

export default {
  fetch: app.fetch,
  email: (message: any, env: Env, ctx: ExecutionContext) =>
    handleInboundEmail(message, env, ctx),
}
