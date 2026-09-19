import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {authApi} from "../api";
import {loginRequestDto, registerRequestDto} from "../types";

export const useAuth = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [user, setUser] = useState<{ id: string; email: string } | null>(null);

    // 2. Helper function to decode the JWT and extract user data
    const decodeAndSetUser = (token: string) => {
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            // Ensure your Spring Boot backend includes 'userId' or 'id' in the token claims!
            setUser({ id: decoded.userId || decoded.id, email: decoded.sub });
        } catch (e) {
            console.error("Failed to parse token", e);
        }
    };

    // 3. Check for token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            decodeAndSetUser(token);
        }
    }, []);

    const handleAuthSuccess = (token: string) => {
        localStorage.setItem("token", token);
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        decodeAndSetUser(token);
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
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
    };

    return {
        login,
        register,
        logout,
        isLoading,
        error,
        user,
    };
};