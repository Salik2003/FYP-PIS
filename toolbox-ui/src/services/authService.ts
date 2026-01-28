import axiosClient from '../api/axiosClient';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        // The backend endpoint is /login based on AuthController @Post('login')
        // and the controller route is @Controller() (empty)
        const response = await axiosClient.post<LoginResponse>('/login', credentials);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // Note: There was no "/me" endpoint found in AuthController.
    // We rely on the token for now, or maybe the login response provides user details.
};
