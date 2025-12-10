import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';

class TaskService {
  // Get kanban board data (grouped by state)
  async getKanban() {
    try {
      const kanban = await apiService.get(API_ENDPOINTS.TASK_KANBAN);
      return kanban;
    } catch (error) {
      console.error('Error fetching kanban:', error);
      throw error;
    }
  }

  // Get all tasks with optional filters
  async getAllTasks(filters = {}) {
    try {
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.programmer) params.programmer = filters.programmer;

      const tasks = await apiService.get(API_ENDPOINTS.TASKS, params);
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(id) {
    try {
      const task = await apiService.get(API_ENDPOINTS.TASK_BY_ID(id));
      return task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Create new task (manager only)
  async createTask(taskData) {
    try {
      const payload = {
        description: taskData.description,
        storyPoints: taskData.storyPoints,
        expectedStartDate: taskData.expectedStartDate || null,
        expectedEndDate: taskData.expectedEndDate || null,
        idProgrammers: taskData.idProgrammers,
        idTaskType: taskData.idTaskType,
        orderTask: taskData.orderTask
      };

      const result = await apiService.post(API_ENDPOINTS.TASKS, payload);
      return result;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update task (manager only)
  async updateTask(id, taskData) {
    try {
      const payload = {};

      // Only include fields that are being updated
      if (taskData.description !== undefined) payload.description = taskData.description;
      if (taskData.storyPoints !== undefined) payload.storyPoints = taskData.storyPoints;
      if (taskData.expectedStartDate !== undefined) payload.expectedStartDate = taskData.expectedStartDate;
      if (taskData.expectedEndDate !== undefined) payload.expectedEndDate = taskData.expectedEndDate;
      if (taskData.idProgrammers !== undefined) payload.idProgrammers = taskData.idProgrammers;
      if (taskData.idTaskType !== undefined) payload.idTaskType = taskData.idTaskType;
      if (taskData.orderTask !== undefined) payload.orderTask = taskData.orderTask;

      const result = await apiService.patch(API_ENDPOINTS.TASK_BY_ID(id), payload);
      return result;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task (manager only)
  async deleteTask(id) {
    try {
      const result = await apiService.delete(API_ENDPOINTS.TASK_BY_ID(id));
      return result;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Move task to another state (programmer)
  async moveTask(id, toState) {
    try {
      const payload = { toState };
      const result = await apiService.post(API_ENDPOINTS.TASK_MOVE(id), payload);
      return result;
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }

  // Move task to Doing
  async moveTaskToDoing(id) {
    return this.moveTask(id, 'Doing');
  }

  // Move task to Done
  async moveTaskToDone(id) {
    return this.moveTask(id, 'Done');
  }

  // Get programmer's completed tasks stats
  async getProgrammerCompletedStats() {
    try {
      const stats = await apiService.get(API_ENDPOINTS.STATS_PROGRAMMER_COMPLETED);
      return stats;
    } catch (error) {
      console.error('Error fetching programmer completed stats:', error);
      throw error;
    }
  }

  // Get manager's completed tasks stats
  async getManagerCompletedStats() {
    try {
      const stats = await apiService.get(API_ENDPOINTS.STATS_MANAGER_COMPLETED);
      return stats;
    } catch (error) {
      console.error('Error fetching manager completed stats:', error);
      throw error;
    }
  }

  // Get manager's pending tasks stats
  async getManagerPendingStats() {
    try {
      const stats = await apiService.get(API_ENDPOINTS.STATS_MANAGER_PENDING);
      return stats;
    } catch (error) {
      console.error('Error fetching manager pending stats:', error);
      throw error;
    }
  }

  // Get manager's ToDo forecast
  async getManagerForecast() {
    try {
      const forecast = await apiService.get(API_ENDPOINTS.STATS_MANAGER_FORECAST);
      return forecast;
    } catch (error) {
      console.error('Error fetching manager forecast:', error);
      throw error;
    }
  }

  // Export manager's completed tasks to CSV
  async exportManagerCompletedCSV() {
    try {
      const csvData = await apiService.get(API_ENDPOINTS.EXPORT_MANAGER_COMPLETED);
      return csvData;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  // Validate task data
  validateTaskData(taskData, isCreate = true) {
    const errors = [];

    if (!taskData.description || taskData.description.trim() === '') {
      errors.push('Descrição é obrigatória');
    }

    if (taskData.storyPoints === undefined || taskData.storyPoints === null) {
      errors.push('Story Points são obrigatórios');
    } else if (taskData.storyPoints < 1) {
      errors.push('Story Points deve ser maior que 0');
    }

    if (isCreate) {
      if (!taskData.idProgrammers || taskData.idProgrammers.length === 0) {
        errors.push('Pelo menos um programador deve ser atribuído');
      }

      if (!taskData.idTaskType) {
        errors.push('Tipo de tarefa é obrigatório');
      }

      if (taskData.orderTask === undefined || taskData.orderTask === null) {
        errors.push('Ordem da tarefa é obrigatória');
      } else if (taskData.orderTask < 1) {
        errors.push('Ordem da tarefa deve ser maior que 0');
      }
    }

    // Validate dates if both are provided
    if (taskData.expectedStartDate && taskData.expectedEndDate) {
      const startDate = new Date(taskData.expectedStartDate);
      const endDate = new Date(taskData.expectedEndDate);
      if (startDate > endDate) {
        errors.push('Data de início prevista não pode ser maior que a data de fim prevista');
      }
    }

    return errors;
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Format date with time for display
  formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculate days between two dates
  calculateDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Get state display name in Portuguese
  getStateDisplayName(state) {
    const stateNames = {
      'ToDo': 'A Fazer',
      'Doing': 'Em Curso',
      'Done': 'Concluído'
    };
    return stateNames[state] || state;
  }

  // Get state color
  getStateColor(state) {
    const stateColors = {
      'ToDo': '#3498db',
      'Doing': '#f39c12',
      'Done': '#27ae60'
    };
    return stateColors[state] || '#95a5a6';
  }

  // Check if task can be moved to Doing
  canMoveTaskToDoing(task) {
    return task.state === 'ToDo';
  }

  // Check if task can be moved to Done
  canMoveTaskToDone(task) {
    return task.state === 'Doing';
  }

  // Check if task is editable (not Done)
  isTaskEditable(task) {
    return task.state !== 'Done';
  }
}

// Export singleton instance
export const taskService = new TaskService();
export default taskService;
