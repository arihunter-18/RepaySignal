import client from './client';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<AuthResponse>('/auth/login', payload).then(r => r.data),

  register: (payload: RegisterPayload) =>
    client.post<AuthResponse>('/auth/register', payload).then(r => r.data),

  me: () =>
    client.get('/auth/me').then(r => r.data),

  logout: () =>
    client.post('/auth/logout').then(r => r.data),
};