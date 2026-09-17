import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../../services/taskApi';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('taskApi service', () => {
  let axiosInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    axiosInstance = axios.create();
  });

  it('getAllTasks calls GET /tasks', async () => {
    const mockTasks = [{ _id: '1', title: 'Task 1' }];
    axiosInstance.get.mockResolvedValueOnce({ data: mockTasks });

    const result = await getAllTasks();

    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks');
    expect(result.data).toEqual(mockTasks);
  });

  it('getTaskById calls GET /tasks/:id', async () => {
    const mockTask = { _id: '123', title: 'Single Task' };
    axiosInstance.get.mockResolvedValueOnce({ data: mockTask });

    const result = await getTaskById('123');

    expect(axiosInstance.get).toHaveBeenCalledWith('/tasks/123');
    expect(result.data).toEqual(mockTask);
  });

  it('createTask calls POST /tasks with taskData', async () => {
    const newTask = { title: 'New Task', description: 'Description' };
    const mockResponse = { _id: '456', ...newTask };
    axiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await createTask(newTask);

    expect(axiosInstance.post).toHaveBeenCalledWith('/tasks', newTask);
    expect(result.data).toEqual(mockResponse);
  });

  it('updateTask calls PUT /tasks/:id with taskData', async () => {
    const updatedData = { title: 'Updated Title', status: 'Completed' };
    const mockResponse = { _id: '123', ...updatedData };
    axiosInstance.put.mockResolvedValueOnce({ data: mockResponse });

    const result = await updateTask('123', updatedData);

    expect(axiosInstance.put).toHaveBeenCalledWith('/tasks/123', updatedData);
    expect(result.data).toEqual(mockResponse);
  });

  it('deleteTask calls DELETE /tasks/:id', async () => {
    const mockResponse = { message: 'Task deleted successfully' };
    axiosInstance.delete.mockResolvedValueOnce({ data: mockResponse });

    const result = await deleteTask('123');

    expect(axiosInstance.delete).toHaveBeenCalledWith('/tasks/123');
    expect(result.data).toEqual(mockResponse);
  });
});
