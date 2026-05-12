import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});



let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(null)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((e) => Promise.reject(e));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        
        await axios.post(`${API_URL}/token/refresh/`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (typeof window !== 'undefined') {
         
          document.cookie = 'tm_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login'; 
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;


export const login = (email: string, password: string) =>
  api.post('/login/', { email, password });

export const logout = () =>
  api.post('/logout/').finally(() => {
    document.cookie = 'tm_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });


export const getUsers = (page = 1) => api.get(`/users/?page=${page}`);
export const createUser = (data: any) => api.post('/users/', data);

export const getEmployees = () => api.get('/employees/');


export const getProjects = (page = 1) => api.get(`/projects/?page=${page}`);

export const getAllProjects = () => api.get(`/projects/?page_size=100`);
export const getProject = (id: number) => api.get(`/projects/${id}/`);
export const createProject = (data: any) => api.post('/projects/', data);


export const getTasks = (page = 1) => api.get(`/tasks/?page=${page}`);
export const getTask = (id: number) => api.get(`/tasks/${id}/`);
export const createTask = (data: any) => api.post('/tasks/', data);
export const updateTask = (id: number, data: any) => api.patch(`/tasks/${id}/`, data);


export const getDashboard = () => api.get('/dashboard/');


export const getDailyLogs = (page = 1) => api.get(`/daily-logs/?page=${page}`);

export const getDailyLogTasks = (page = 1) => api.get(`/tasks/?page=${page}`);
export const createDailyLog = (data: any) => api.post('/daily-logs/', data);
