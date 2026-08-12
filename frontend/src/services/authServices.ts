import {api} from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
    //cadastro de usuario
    async register(name: string, email: string, password: string, role: string): Promise<User>{
        const response = await api.post<User>('/auth/register', {
            name,
            email,
            password,
            role,
        });
        return response.data;
    },

    // login de usuario
    async login(email: string, password: string): Promise<AuthResponse>{
        const formData = new FormData();

        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post<AuthResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};