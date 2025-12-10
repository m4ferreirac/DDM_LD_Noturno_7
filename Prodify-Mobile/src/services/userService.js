import { apiService } from "./api";
import { API_ENDPOINTS } from "../config/api";

class UserService {
  // Get all users (manager only)
  async getAllUsers() {
    try {
      const users = await apiService.get(API_ENDPOINTS.USERS);
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Get user names (any authenticated user) - returns only id, name, isManager
  async getUserNames() {
    try {
      const users = await apiService.get(API_ENDPOINTS.USERS_PUBLIC);
      return users;
    } catch (error) {
      console.error("Error fetching user names:", error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(uid) {
    try {
      const user = await apiService.get(API_ENDPOINTS.USER_BY_ID(uid));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  // Create new user (manager only)
  // Now includes email and password for Firebase Authentication
  async createUser(userData) {
    try {
      const payload = {
        uid: userData.uid || undefined,
        userName: userData.userName,
        name: userData.name,
        email: userData.email, // Required for Firebase Auth
        password: userData.password || "Password123!", // Default password
        isManager: userData.isManager || false,
        department: userData.department || null,
        experienceLevel: userData.experienceLevel || null,
        managerId: userData.isManager ? null : userData.managerId || null,
      };

      const result = await apiService.post(API_ENDPOINTS.USERS, payload);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Update user (manager only)
  async updateUser(uid, userData) {
    try {
      const payload = {};

      // Only include fields that are being updated
      if (userData.name !== undefined) payload.name = userData.name;
      if (userData.department !== undefined)
        payload.department = userData.department;
      if (userData.experienceLevel !== undefined)
        payload.experienceLevel = userData.experienceLevel;
      if (userData.managerId !== undefined)
        payload.managerId = userData.managerId;
      if (userData.isManager !== undefined)
        payload.isManager = userData.isManager;

      const result = await apiService.patch(
        API_ENDPOINTS.USER_BY_ID(uid),
        payload,
      );
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Delete user (manager only)
  async deleteUser(uid) {
    try {
      const result = await apiService.delete(API_ENDPOINTS.USER_BY_ID(uid));
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Reset user password (manager only)
  async resetPassword(uid, newPassword) {
    try {
      const result = await apiService.post(
        `${API_ENDPOINTS.USER_BY_ID(uid)}/reset-password`,
        { newPassword },
      );
      return result;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  // Get programmers managed by a specific manager
  async getProgrammersByManager(managerId) {
    try {
      const allUsers = await this.getAllUsers();
      const programmers = allUsers.filter(
        (user) => !user.isManager && user.managerId === managerId,
      );
      return programmers;
    } catch (error) {
      console.error("Error fetching programmers by manager:", error);
      throw error;
    }
  }

  // Get all managers
  async getAllManagers() {
    try {
      const allUsers = await this.getAllUsers();
      const managers = allUsers.filter((user) => user.isManager);
      return managers;
    } catch (error) {
      console.error("Error fetching managers:", error);
      throw error;
    }
  }

  // Get all programmers
  async getAllProgrammers() {
    try {
      const allUsers = await this.getAllUsers();
      const programmers = allUsers.filter((user) => !user.isManager);
      return programmers;
    } catch (error) {
      console.error("Error fetching programmers:", error);
      throw error;
    }
  }

  // Validate user data
  validateUserData(userData, isCreate = true) {
    const errors = [];

    if (isCreate && !userData.userName) {
      errors.push("Username é obrigatório");
    }

    if (!userData.name) {
      errors.push("Nome é obrigatório");
    }

    if (isCreate && !userData.email) {
      errors.push("Email é obrigatório");
    }

    if (isCreate && userData.email && !this.isValidEmail(userData.email)) {
      errors.push("Email inválido");
    }

    if (!userData.isManager && !userData.managerId) {
      errors.push("Programador deve ter um Gestor associado");
    }

    if (
      userData.department &&
      !["IT", "Marketing", "Administração"].includes(userData.department)
    ) {
      errors.push("Departamento inválido");
    }

    if (
      userData.experienceLevel &&
      !["Junior", "Senior"].includes(userData.experienceLevel)
    ) {
      errors.push("Nível de experiência inválido");
    }

    return errors;
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate default password
  generateDefaultPassword() {
    return "Password123!";
  }

  // Department options
  getDepartmentOptions() {
    return [
      { label: "IT", value: "IT" },
      { label: "Marketing", value: "Marketing" },
      { label: "Administração", value: "Administração" },
    ];
  }

  // Experience level options
  getExperienceLevelOptions() {
    return [
      { label: "Júnior", value: "Junior" },
      { label: "Sénior", value: "Senior" },
    ];
  }

  // User type options
  getUserTypeOptions() {
    return [
      { label: "Programador", value: false },
      { label: "Gestor", value: true },
    ];
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
