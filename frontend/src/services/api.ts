import axios from 'axios';

// Instancia do axios para fazer chamada pro Backend
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    },
});


// Adiciona o Token JWT no Header de todas as requisições
api.interceptors.request.use(
    (config) => {
        // Lê o token no navegador
        const token = localStorage.getItem('@ticketon:token');

        if(token && config.headers){
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Tratamento de erros
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error.response && error.response.status === 401){
            localStorage.removeItem('@ticketon:token');
            localStorage.removeItem('@ticketon:user');

            if(!window.location.pathname.includes('/login')){
                window.location.href = '/login?';
            }
        }
        return Promise.reject(error);
    }
);
