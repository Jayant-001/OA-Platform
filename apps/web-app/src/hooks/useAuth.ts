import { useUser } from '@/context/UserContext';
import apiService from '@/api/apiService';

export const useAuth = () => {
    const { setUser, setToken } = useUser();

    const login = async (email: string, password: string) => {
        const data = await apiService.post('/auth/users/login', { email, password }, { withCredentials: true });
        setToken(data.token);
        setUser({
            id: "1",
            name: "John Doe",
            accessToken: data.token,
            email: "john@doe.com",
            role: "user",
        })
        return data;
    };

    const userRegister = async (email: string, password: string, name: string, college: string, batch: string, branch: string) => {
        const data = await apiService.post('/auth/users/register', { email, password, name, college, batch, branch }, { withCredentials: true });
        return data;
    };

    const adminLogin = async (email: string, password: string) => {
        const data = await apiService.post('/auth/admins/login', { email, password }, { withCredentials: true });
        setToken(data.token);
        setUser({
            id: "1",
            name: "John Doe",
            accessToken: data.token,
            email: "john@doe.com",
            role: "admin",
        })
        return data;
    };

    const adminRegister = async (email: string, password: string, name: string, organization: string, role: string) => {
        const data = await apiService.post('/auth/admins/register', { email, password, name, organization, role }, { withCredentials: true });
        return data;
    };

    const logout = () => {
        setToken("");
        setUser(null);
    };

    return { login, userRegister, logout, adminLogin, adminRegister };
};