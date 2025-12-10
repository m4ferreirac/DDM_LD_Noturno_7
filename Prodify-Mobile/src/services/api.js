import { auth } from "../config/firebase";
import { API_BASE_URL } from "../config/api";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = 30000; // 30 seconds timeout
  }

  // Get the current user's ID token for authentication
  async getAuthToken() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Utilizador não autenticado");
    }
    try {
      return await user.getIdToken(true); // Force refresh token
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw new Error("Erro ao obter token de autenticação");
    }
  }

  // Build headers with authentication
  async buildHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (includeAuth) {
      try {
        const token = await this.getAuthToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        throw error;
      }
    }

    return headers;
  }

  // Create a fetch with timeout
  async fetchWithTimeout(url, options, timeout = this.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Tempo limite excedido. Verifique a sua ligação.");
      }
      throw error;
    }
  }

  // Handle API response
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");

    // Handle CSV responses
    if (contentType && contentType.includes("text/csv")) {
      if (!response.ok) {
        throw new Error("Erro ao descarregar ficheiro CSV");
      }
      return await response.text();
    }

    // Handle JSON responses
    if (contentType && contentType.includes("application/json")) {
      let data;
      try {
        data = await response.json();
      } catch (e) {
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        return null;
      }

      if (!response.ok) {
        // Extract error message from response
        const errorMessage =
          data.error ||
          (data.errors && Array.isArray(data.errors)
            ? data.errors.join(", ")
            : null) ||
          data.message ||
          `Erro HTTP: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    }

    // Handle other content types
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    try {
      return await response.text();
    } catch (e) {
      return null;
    }
  }

  // Handle network errors
  handleNetworkError(error) {
    if (error.message === "Network request failed") {
      return new Error("Erro de rede. Verifique a sua ligação à internet.");
    }
    if (error.message.includes("Tempo limite")) {
      return error;
    }
    if (error.message.includes("Utilizador não autenticado")) {
      return error;
    }
    return error;
  }

  // GET request
  async get(endpoint, params = {}, includeAuth = true) {
    try {
      const headers = await this.buildHeaders(includeAuth);

      // Build query string from params
      const queryString =
        Object.keys(params).length > 0
          ? "?" + new URLSearchParams(params).toString()
          : "";

      const url = `${this.baseUrl}${endpoint}${queryString}`;
      console.log("[API] GET:", url);

      const response = await this.fetchWithTimeout(url, {
        method: "GET",
        headers,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("[API] GET error:", error);
      throw this.handleNetworkError(error);
    }
  }

  // POST request
  async post(endpoint, body = {}, includeAuth = true) {
    try {
      const headers = await this.buildHeaders(includeAuth);

      const url = `${this.baseUrl}${endpoint}`;
      console.log("[API] POST:", url, body);

      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("[API] POST error:", error);
      throw this.handleNetworkError(error);
    }
  }

  // PATCH request
  async patch(endpoint, body = {}, includeAuth = true) {
    try {
      const headers = await this.buildHeaders(includeAuth);

      const url = `${this.baseUrl}${endpoint}`;
      console.log("[API] PATCH:", url, body);

      const response = await this.fetchWithTimeout(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("[API] PATCH error:", error);
      throw this.handleNetworkError(error);
    }
  }

  // PUT request
  async put(endpoint, body = {}, includeAuth = true) {
    try {
      const headers = await this.buildHeaders(includeAuth);

      const url = `${this.baseUrl}${endpoint}`;
      console.log("[API] PUT:", url, body);

      const response = await this.fetchWithTimeout(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("[API] PUT error:", error);
      throw this.handleNetworkError(error);
    }
  }

  // DELETE request
  async delete(endpoint, includeAuth = true) {
    try {
      const headers = await this.buildHeaders(includeAuth);

      const url = `${this.baseUrl}${endpoint}`;
      console.log("[API] DELETE:", url);

      const response = await this.fetchWithTimeout(url, {
        method: "DELETE",
        headers,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("[API] DELETE error:", error);
      throw this.handleNetworkError(error);
    }
  }

  // Health check (no auth required)
  async healthCheck() {
    try {
      const url = `${this.baseUrl}/`;
      console.log("[API] Health check:", url);

      const response = await this.fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        5000,
      ); // 5 second timeout for health check

      return await this.handleResponse(response);
    } catch (error) {
      console.error("[API] Health check error:", error);
      throw new Error(
        "Backend não disponível. Verifique se o servidor está a correr.",
      );
    }
  }

  // Check if backend is available
  async isBackendAvailable() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
