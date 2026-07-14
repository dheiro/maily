export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  emails: {
    list: (params: { username: string; domain: string; page: number }) =>
      ['emails', params.username, params.domain, params.page] as const,
    detail: (id: string | undefined) => ['email', id] as const,
  },
  domains: {
    list: () => ['domains'] as const,
  },
}
