// src/services/auth.ts
import api from './api';
import type { ApiResponse, User, LoginPayload, RegisterPayload } from '../types';

export const login = (payload: LoginPayload) =>
  api.post<ApiResponse<{ user: User; token: string }>>('/api/login', payload);

export const register = (payload: RegisterPayload) =>
  api.post<ApiResponse<User>>('/api/register', payload);

export const getProfile = () =>
  api.get<ApiResponse<User>>('/api/me');