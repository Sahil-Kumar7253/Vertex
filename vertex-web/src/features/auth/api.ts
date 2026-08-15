import api from "../../lib/api";
import { AuthResponseDto, loginRequestDto, registerRequestDto } from "./types";

export const authApi = {
    login: async (data: loginRequestDto): Promise<AuthResponseDto> => {
        const response = await api.post<AuthResponseDto>("/auth/login", data);
        return response.data;
    },

    register: async (data: registerRequestDto): Promise<AuthResponseDto> => {
        const response = await api.post<AuthResponseDto>("/auth/register", data);
        return response.data;
    }
};

