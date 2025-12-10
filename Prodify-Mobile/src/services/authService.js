import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    this.authStateListeners = [];
  }

  // Initialize auth state listener
  initializeAuthListener(callback) {
    return onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;

      if (user) {
        try {
          // Fetch user profile from backend
          await this.fetchUserProfile();
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        this.userProfile = null;
      }

      if (callback) {
        callback(user, this.userProfile);
      }

      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(user, this.userProfile));
    });
  }

  // Add auth state listener
  addAuthStateListener(listener) {
    this.authStateListeners.push(listener);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  // Fetch user profile from backend
  async fetchUserProfile() {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const profile = await apiService.get(API_ENDPOINTS.USER_BY_ID(this.currentUser.uid));
      this.userProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Login with email and password
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = userCredential.user;

      // Fetch user profile after login
      await this.fetchUserProfile();

      return {
        user: userCredential.user,
        profile: this.userProfile
      };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Register new user (for development/testing purposes)
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      this.currentUser = userCredential.user;

      // Create user in backend
      const userPayload = {
        uid: userCredential.user.uid,
        userName: userData.userName,
        name: userData.name,
        isManager: userData.isManager || false,
        department: userData.department || null,
        experienceLevel: userData.experienceLevel || null,
        managerId: userData.managerId || null
      };

      await apiService.post(API_ENDPOINTS.USERS, userPayload);
      await this.fetchUserProfile();

      return {
        user: userCredential.user,
        profile: this.userProfile
      };
    } catch (error) {
      console.error('Register error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile() {
    return this.userProfile;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.currentUser;
  }

  // Check if user is manager
  isManager() {
    return this.userProfile?.isManager || false;
  }

  // Get user ID
  getUserId() {
    return this.currentUser?.uid || null;
  }

  // Get user display name
  getUserDisplayName() {
    return this.userProfile?.name || this.currentUser?.email || 'Utilizador';
  }

  // Handle Firebase auth errors
  handleAuthError(error) {
    let message = 'Ocorreu um erro de autenticação';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/user-disabled':
        message = 'Utilizador desativado';
        break;
      case 'auth/user-not-found':
        message = 'Utilizador não encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Password incorreta';
        break;
      case 'auth/email-already-in-use':
        message = 'Email já está em uso';
        break;
      case 'auth/weak-password':
        message = 'Password muito fraca';
        break;
      case 'auth/network-request-failed':
        message = 'Erro de rede. Verifique a sua conexão';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiadas tentativas. Tente novamente mais tarde';
        break;
      case 'auth/invalid-credential':
        message = 'Credenciais inválidas';
        break;
      default:
        message = error.message || 'Ocorreu um erro de autenticação';
    }

    return new Error(message);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
