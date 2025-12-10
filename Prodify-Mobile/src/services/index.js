// Services index - export all services for easy imports

export { apiService } from './api';
export { authService } from './authService';
export { userService } from './userService';
export { taskService } from './taskService';
export { taskTypeService } from './taskTypeService';

// Default export with all services
export default {
  apiService: require('./api').apiService,
  authService: require('./authService').authService,
  userService: require('./userService').userService,
  taskService: require('./taskService').taskService,
  taskTypeService: require('./taskTypeService').taskTypeService,
};
