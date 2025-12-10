import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';

class TaskTypeService {
  // Get all task types
  async getAllTaskTypes() {
    try {
      const taskTypes = await apiService.get(API_ENDPOINTS.TASK_TYPES);
      return taskTypes;
    } catch (error) {
      console.error('Error fetching task types:', error);
      throw error;
    }
  }

  // Get task type by ID
  async getTaskTypeById(id) {
    try {
      const taskTypes = await this.getAllTaskTypes();
      const taskType = taskTypes.find(tt => tt.id === id);
      if (!taskType) {
        throw new Error('Tipo de tarefa não encontrado');
      }
      return taskType;
    } catch (error) {
      console.error('Error fetching task type:', error);
      throw error;
    }
  }

  // Create new task type (manager only)
  async createTaskType(name) {
    try {
      const payload = { name };
      const result = await apiService.post(API_ENDPOINTS.TASK_TYPES, payload);
      return result;
    } catch (error) {
      console.error('Error creating task type:', error);
      throw error;
    }
  }

  // Update task type (manager only)
  async updateTaskType(id, name) {
    try {
      const payload = { name };
      const result = await apiService.patch(API_ENDPOINTS.TASK_TYPE_BY_ID(id), payload);
      return result;
    } catch (error) {
      console.error('Error updating task type:', error);
      throw error;
    }
  }

  // Delete task type (manager only)
  async deleteTaskType(id) {
    try {
      const result = await apiService.delete(API_ENDPOINTS.TASK_TYPE_BY_ID(id));
      return result;
    } catch (error) {
      console.error('Error deleting task type:', error);
      throw error;
    }
  }

  // Validate task type data
  validateTaskTypeName(name) {
    const errors = [];

    if (!name || name.trim() === '') {
      errors.push('Nome do tipo de tarefa é obrigatório');
    }

    if (name && name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (name && name.trim().length > 100) {
      errors.push('Nome não pode ter mais de 100 caracteres');
    }

    return errors;
  }

  // Check if task type name is unique
  async isNameUnique(name, excludeId = null) {
    try {
      const taskTypes = await this.getAllTaskTypes();
      const normalizedName = name.trim().toLowerCase();
      const duplicate = taskTypes.find(
        tt => tt.name.toLowerCase() === normalizedName && tt.id !== excludeId
      );
      return !duplicate;
    } catch (error) {
      console.error('Error checking name uniqueness:', error);
      throw error;
    }
  }

  // Get task types as options for dropdown
  async getTaskTypeOptions() {
    try {
      const taskTypes = await this.getAllTaskTypes();
      return taskTypes.map(tt => ({
        label: tt.name,
        value: tt.id
      }));
    } catch (error) {
      console.error('Error getting task type options:', error);
      throw error;
    }
  }

  // Get task type name by ID
  async getTaskTypeName(id) {
    try {
      if (!id) return '-';
      const taskType = await this.getTaskTypeById(id);
      return taskType?.name || '-';
    } catch (error) {
      console.error('Error getting task type name:', error);
      return '-';
    }
  }
}

// Export singleton instance
export const taskTypeService = new TaskTypeService();
export default taskTypeService;
