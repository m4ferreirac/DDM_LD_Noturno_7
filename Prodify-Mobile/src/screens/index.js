// Screens index - export all screens for easy imports

export { default as LoginScreen } from './LoginScreen';
export { default as KanbanScreen } from './KanbanScreen';
export { default as TaskDetailsScreen } from './TaskDetailsScreen';
export { default as UsersScreen } from './UsersScreen';
export { default as TaskTypesScreen } from './TaskTypesScreen';
export { default as StatsScreen } from './StatsScreen';
export { default as MenuScreen } from './MenuScreen';

// Default export with all screens
export default {
  LoginScreen: require('./LoginScreen').default,
  KanbanScreen: require('./KanbanScreen').default,
  TaskDetailsScreen: require('./TaskDetailsScreen').default,
  UsersScreen: require('./UsersScreen').default,
  TaskTypesScreen: require('./TaskTypesScreen').default,
  StatsScreen: require('./StatsScreen').default,
  MenuScreen: require('./MenuScreen').default,
};
