import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { SimpleHeader } from "../components/Header";
import { UserCard } from "../components/Card";
import { SearchInput } from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import { FullScreenLoading } from "../components/LoadingSpinner";
import {
  NoUsersEmptyState,
  NoSearchResultsEmptyState,
} from "../components/EmptyState";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const UsersScreen = ({ navigation }) => {
  const { isManager, getUserId, userProfile } = useAuth();

  // Data state
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    email: "",
    isManager: false,
    department: null,
    experienceLevel: null,
    managerId: null,
  });
  const [formErrors, setFormErrors] = useState({});

  // Options
  const departmentOptions = userService.getDepartmentOptions();
  const experienceLevelOptions = userService.getExperienceLevelOptions();
  const userTypeOptions = userService.getUserTypeOptions();

  // Fetch users
  const fetchUsers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);

      // Get managers for dropdown
      const managerList = allUsers.filter((u) => u.isManager);
      setManagers(managerList.map((m) => ({ label: m.name, value: m.id })));
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Erro", "Não foi possível carregar os utilizadores.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users when search changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.userName?.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower),
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers(false);
  };

  // Get manager name by ID
  const getManagerName = (managerId) => {
    if (!managerId) return null;
    const manager = users.find((u) => u.id === managerId);
    return manager?.name || "Desconhecido";
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      userName: "",
      name: "",
      email: "",
      isManager: false,
      department: null,
      experienceLevel: null,
      managerId: null,
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  // Open create modal
  const handleCreate = () => {
    if (!isManager()) {
      Alert.alert("Acesso Negado", "Apenas gestores podem criar utilizadores.");
      return;
    }
    resetForm();
    setIsEditMode(false);
    setModalVisible(true);
  };

  // Open edit modal
  const handleEdit = (user) => {
    if (!isManager()) {
      Alert.alert(
        "Acesso Negado",
        "Apenas gestores podem editar utilizadores.",
      );
      return;
    }
    setSelectedUser(user);
    setFormData({
      userName: user.userName || "",
      name: user.name || "",
      email: "", // Email is not editable
      isManager: user.isManager || false,
      department: user.department || null,
      experienceLevel: user.experienceLevel || null,
      managerId: user.managerId || null,
    });
    setFormErrors({});
    setIsEditMode(true);
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = (user) => {
    if (!isManager()) {
      Alert.alert(
        "Acesso Negado",
        "Apenas gestores podem eliminar utilizadores.",
      );
      return;
    }

    // Prevent deleting yourself
    if (user.id === getUserId()) {
      Alert.alert("Erro", "Não pode eliminar a sua própria conta.");
      return;
    }

    Alert.alert(
      "Eliminar Utilizador",
      `Tem certeza que deseja eliminar o utilizador "${user.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await userService.deleteUser(user.id);
              Alert.alert("Sucesso", "Utilizador eliminado com sucesso!");
              fetchUsers(false);
            } catch (error) {
              Alert.alert(
                "Erro",
                error.message || "Não foi possível eliminar o utilizador.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Handle form change - memoized to prevent focus loss
  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear managerId if switching to manager
      if (field === "isManager" && value === true) {
        newData.managerId = null;
      }

      return newData;
    });

    setFormErrors((prev) => {
      if (prev[field]) {
        return { ...prev, [field]: null };
      }
      return prev;
    });
  }, []);

  // Memoized handlers for each field to prevent re-renders
  const handleUserNameChange = useCallback(
    (v) => handleFormChange("userName", v),
    [handleFormChange],
  );
  const handleNameChange = useCallback(
    (v) => handleFormChange("name", v),
    [handleFormChange],
  );
  const handleEmailChange = useCallback(
    (v) => handleFormChange("email", v),
    [handleFormChange],
  );
  const handleIsManagerChange = useCallback(
    (v) => handleFormChange("isManager", v),
    [handleFormChange],
  );
  const handleManagerIdChange = useCallback(
    (v) => handleFormChange("managerId", v),
    [handleFormChange],
  );
  const handleDepartmentChange = useCallback(
    (v) => handleFormChange("department", v),
    [handleFormChange],
  );
  const handleExperienceLevelChange = useCallback(
    (v) => handleFormChange("experienceLevel", v),
    [handleFormChange],
  );

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!isEditMode && !formData.userName.trim()) {
      errors.userName = "Username é obrigatório";
    }

    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório";
    }

    if (!isEditMode && !formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (
      !isEditMode &&
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = "Email inválido";
    }

    if (!formData.isManager && !formData.managerId) {
      errors.managerId = "Programador deve ter um gestor associado";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        isManager: formData.isManager,
        department: formData.department,
        experienceLevel: formData.experienceLevel,
        managerId: formData.isManager ? null : formData.managerId,
      };

      if (isEditMode) {
        await userService.updateUser(selectedUser.id, payload);
        Alert.alert("Sucesso", "Utilizador atualizado com sucesso!");
      } else {
        payload.userName = formData.userName.trim();
        payload.email = formData.email.trim();
        payload.password = "Password123!"; // Default password
        const result = await userService.createUser(payload);
        Alert.alert(
          "Sucesso",
          `Utilizador criado com sucesso!\n\nEmail: ${formData.email}\nPassword inicial: Password123!\n\nO utilizador deve alterar a password no primeiro login.`,
        );
      }

      setModalVisible(false);
      resetForm();
      fetchUsers(false);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível guardar o utilizador.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal
  const handleCloseModal = useCallback(() => {
    if (!isSaving) {
      setModalVisible(false);
      resetForm();
    }
  }, [isSaving]);

  // Render user item
  const renderUserItem = ({ item }) => (
    <UserCard
      user={item}
      managerName={getManagerName(item.managerId)}
      showActions={isManager()}
      onEditPress={() => handleEdit(item)}
      onDeletePress={() => handleDelete(item)}
      onPress={() => handleEdit(item)}
    />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchText.trim()) {
      return (
        <NoSearchResultsEmptyState
          searchTerm={searchText}
          onClearSearch={() => setSearchText("")}
        />
      );
    }
    return <NoUsersEmptyState onCreatePress={handleCreate} />;
  };

  if (isLoading) {
    return <FullScreenLoading text="A carregar utilizadores..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <SimpleHeader
        title="Gestão de Utilizadores"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon={isManager() ? <Text style={styles.addIcon}>+</Text> : null}
        onRightPress={isManager() ? handleCreate : null}
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Pesquisar utilizadores..."
            onClear={() => setSearchText("")}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {users.filter((u) => u.isManager).length}
            </Text>
            <Text style={styles.statLabel}>Gestores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {users.filter((u) => !u.isManager).length}
            </Text>
            <Text style={styles.statLabel}>Programadores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#3498db"]}
              tintColor="#3498db"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Editar Utilizador" : "Novo Utilizador"}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Form */}
            <ScrollView
              style={styles.modalForm}
              contentContainerStyle={styles.modalFormContent}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={true}
            >
              {/* Username (only for create) */}
              {!isEditMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Username <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.userName && styles.textInputError,
                    ]}
                    value={formData.userName}
                    onChangeText={handleUserNameChange}
                    placeholder="Ex: joaosilva"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {formErrors.userName && (
                    <Text style={styles.errorText}>{formErrors.userName}</Text>
                  )}
                  <Text style={styles.helperText}>Username deve ser único</Text>
                </View>
              )}

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Nome <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.name && styles.textInputError,
                  ]}
                  value={formData.name}
                  onChangeText={handleNameChange}
                  placeholder="Nome completo"
                  placeholderTextColor="#999"
                />
                {formErrors.name && (
                  <Text style={styles.errorText}>{formErrors.name}</Text>
                )}
              </View>

              {/* Email (only for create) */}
              {!isEditMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Email <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.email && styles.textInputError,
                    ]}
                    value={formData.email}
                    onChangeText={handleEmailChange}
                    placeholder="exemplo@email.com"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  {formErrors.email && (
                    <Text style={styles.errorText}>{formErrors.email}</Text>
                  )}
                  <Text style={styles.helperText}>
                    Email para login. Password inicial: Password123!
                  </Text>
                </View>
              )}

              {/* User Type */}
              <Select
                label="Tipo de Utilizador"
                value={formData.isManager}
                options={userTypeOptions}
                onValueChange={handleIsManagerChange}
                placeholder="Selecione o tipo"
                required
              />

              {/* Manager (only for programmers) */}
              {!formData.isManager && (
                <Select
                  label="Gestor Responsável"
                  value={formData.managerId}
                  options={managers}
                  onValueChange={handleManagerIdChange}
                  placeholder="Selecione o gestor"
                  error={formErrors.managerId}
                  required
                />
              )}

              {/* Department */}
              <Select
                label="Departamento"
                value={formData.department}
                options={departmentOptions}
                onValueChange={handleDepartmentChange}
                placeholder="Selecione o departamento"
              />

              {/* Experience Level */}
              <Select
                label="Nível de Experiência"
                value={formData.experienceLevel}
                options={experienceLevelOptions}
                onValueChange={handleExperienceLevelChange}
                placeholder="Selecione o nível"
              />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button
                title={isEditMode ? "Guardar Alterações" : "Criar Utilizador"}
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving}
                fullWidth
                size="large"
              />
              <Button
                title="Cancelar"
                onPress={handleCloseModal}
                variant="ghost"
                fullWidth
                size="medium"
                disabled={isSaving}
                style={styles.cancelButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3498db",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  addIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
  },

  // Search
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3498db",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    padding: 16,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    marginTop: 8,
  },

  // Native TextInput styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#e74c3c",
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  textInputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});

export default UsersScreen;
