import {useState} from "react";
import {useRouter} from "next/navigation";
import {authApi} from "../api";
import {loginRequestDto, registerRequestDto} from "../types";

export const useAuth = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthSuccess = (token: string) => {
        localStorage.setItem("token", token);
        router.push("/workspaces");
    };

    const login = async (data: loginRequestDto) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await authApi.login(data);
            handleAuthSuccess(response.token);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to login. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: registerRequestDto) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await authApi.register(data);
            handleAuthSuccess(response.token);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register. Please check your details.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return {
        login,
        register,
        logout,
        isLoading,
        error,
    };
};