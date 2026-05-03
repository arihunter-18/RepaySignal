// Bypass auth - just return dummy data
export const authApi = {
  login: async () => ({ token: 'bypass', user: {} }),
  logout: async () => ({ message: 'Logged out' }),
  me: async () => ({}),
};