import axios from 'axios';

// Base URL for all API calls — points to Express backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// GET all tasks
export const getAllTasks = () => API.get('/tasks');

// GET single task by ID
export const getTaskById = (id) => API.get(`/tasks/${id}`);

// POST create a new task
export const createTask = (taskData) => API.post('/tasks', taskData);

// PUT update a task
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);

// DELETE a task
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
