export interface Env {
  DB: D1Database
  JWT_SECRET: string
  ASSETS: Fetcher
}

export type AppEnv = {
  Bindings: Env
  Variables: { username: string }
}
