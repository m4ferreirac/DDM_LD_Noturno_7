import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { taskTypeService } from "../services/taskTypeService";
import { SimpleHeader } from "../components/Header";
import { TaskTypeCard } from "../components/Card";
import { SearchInput } from "../components/Input";
import Button from "../components/Button";
import { FullScreenLoading } from "../components/LoadingSpinner";
import {
  NoTaskTypesEmptyState,
  NoSearchResultsEmptyState,
} from "../components/EmptyState";

const TaskTypesScreen = ({ navigation }) => {
  const { isManager } = useAuth();

  // Data state
  const [taskTypes, setTaskTypes] = useState([]);
  const [filteredTaskTypes, setFilteredTaskTypes] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [taskTypeName, setTaskTypeName] = useState("");
  const [formError, setFormError] = useState(null);

  // Ref for input
  const inputRef = useRef(null);

  // Fetch task types
  const fetchTaskTypes = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      const types = await taskTypeService.getAllTaskTypes();
      setTaskTypes(types);
      setFilteredTaskTypes(types);
    } catch (error) {
      console.error("Error fetching task types:", error);
      Alert.alert("Erro", "Não foi possível carregar os tipos de tarefas.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchTaskTypes();
  }, [fetchTaskTypes]);

  // Filter task types when search changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTaskTypes(taskTypes);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = taskTypes.filter((type) =>
      type.name?.toLowerCase().includes(searchLower),
    );
    setFilteredTaskTypes(filtered);
  }, [searchText, taskTypes]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTaskTypes(false);
  };

  // Reset form
  const resetForm = () => {
    setTaskTypeName("");
    setFormError(null);
    setSelectedTaskType(null);
  };

  // Open create modal
  const handleCreate = () => {
    if (!isManager()) {
      Alert.alert(
        "Acesso Negado",
        "Apenas gestores podem criar tipos de tarefas.",
      );
      return;
    }
    resetForm();
    setIsEditMode(false);
    setModalVisible(true);
    // Focus input after modal opens
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  };

  // Open edit modal
  const handleEdit = (taskType) => {
    if (!isManager()) {
      Alert.alert(
        "Acesso Negado",
        "Apenas gestores podem editar tipos de tarefas.",
      );
      return;
    }
    setSelectedTaskType(taskType);
    setTaskTypeName(taskType.name || "");
    setFormError(null);
    setIsEditMode(true);
    setModalVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  };

  // Handle delete
  const handleDelete = (taskType) => {
    if (!isManager()) {
      Alert.alert(
        "Acesso Negado",
        "Apenas gestores podem eliminar tipos de tarefas.",
      );
      return;
    }

    Alert.alert(
      "Eliminar Tipo de Tarefa",
      `Tem certeza que deseja eliminar o tipo "${taskType.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await taskTypeService.deleteTaskType(taskType.id);
              Alert.alert("Sucesso", "Tipo de tarefa eliminado com sucesso!");
              fetchTaskTypes(false);
            } catch (error) {
              Alert.alert(
                "Erro",
                error.message || "Não foi possível eliminar o tipo de tarefa.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Validate form
  const validateForm = () => {
    const errors = taskTypeService.validateTaskTypeName(taskTypeName);
    if (errors.length > 0) {
      setFormError(errors[0]);
      return false;
    }
    setFormError(null);
    return true;
  };

  // Handle save
  const handleSave = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const name = taskTypeName.trim();

      // Check for duplicate names
      const isUnique = await taskTypeService.isNameUnique(
        name,
        isEditMode ? selectedTaskType.id : null,
      );

      if (!isUnique) {
        setFormError("Já existe um tipo de tarefa com este nome");
        setIsSaving(false);
        return;
      }

      if (isEditMode) {
        await taskTypeService.updateTaskType(selectedTaskType.id, name);
        Alert.alert("Sucesso", "Tipo de tarefa atualizado com sucesso!");
      } else {
        await taskTypeService.createTaskType(name);
        Alert.alert("Sucesso", "Tipo de tarefa criado com sucesso!");
      }

      setModalVisible(false);
      resetForm();
      fetchTaskTypes(false);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível guardar o tipo de tarefa.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal - memoized
  const handleCloseModal = useCallback(() => {
    if (!isSaving) {
      Keyboard.dismiss();
      setModalVisible(false);
      resetForm();
    }
  }, [isSaving]);

  // Handle name change - memoized to prevent focus loss
  const handleNameChange = useCallback((value) => {
    setTaskTypeName(value);
    setFormError((prev) => (prev ? null : prev));
  }, []);

  // Render task type item
  const renderTaskTypeItem = ({ item }) => (
    <TaskTypeCard
      taskType={item}
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
    return <NoTaskTypesEmptyState onCreatePress={handleCreate} />;
  };

  if (isLoading) {
    return <FullScreenLoading text="A carregar tipos de tarefas..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <SimpleHeader
        title="Tipos de Tarefas"
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
            placeholder="Pesquisar tipos de tarefas..."
            onClear={() => setSearchText("")}
          />
        </View>

        {/* Count Badge */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredTaskTypes.length}{" "}
            {filteredTaskTypes.length === 1 ? "tipo" : "tipos"} de tarefa
          </Text>
        </View>

        {/* Task Types List */}
        <FlatList
          data={filteredTaskTypes}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskTypeItem}
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

      {/* FAB for creating new task type */}
      {isManager() && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Editar Tipo" : "Novo Tipo"}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={isSaving || !taskTypeName.trim()}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!taskTypeName.trim() || isSaving) &&
                    styles.saveButtonDisabled,
                ]}
              >
                {isSaving ? "A guardar..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView
            style={styles.modalForm}
            contentContainerStyle={styles.modalFormContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Icon Preview */}
            <View style={styles.iconPreview}>
              <View style={styles.iconContainer}>
                <Text style={styles.previewIcon}>📋</Text>
              </View>
              <Text style={styles.iconHint}>
                {taskTypeName.trim() || "Nome do tipo de tarefa"}
              </Text>
            </View>

            {/* Name Input - Native TextInput */}
            <Text style={styles.label}>Nome do Tipo de Tarefa *</Text>
            <TextInput
              ref={inputRef}
              style={[styles.textInput, formError && styles.textInputError]}
              value={taskTypeName}
              onChangeText={handleNameChange}
              placeholder="Ex: Design, Desenvolvimento, Bug Fix..."
              placeholderTextColor="#999"
              maxLength={100}
              autoFocus={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {formError && <Text style={styles.errorText}>{formError}</Text>}
            <Text style={styles.helperText}>
              {taskTypeName.length}/100 - O nome deve ser único e descritivo
            </Text>

            {/* Examples */}
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Sugestões:</Text>
              <View style={styles.exampleTags}>
                {[
                  "Design",
                  "Desenvolvimento",
                  "Bug Fix",
                  "Teste",
                  "Documentação",
                  "Manutenção",
                ].map((example) => (
                  <TouchableOpacity
                    key={example}
                    style={styles.exampleTag}
                    onPress={() => handleNameChange(example)}
                  >
                    <Text style={styles.exampleTagText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
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

  // Count
  countContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  countText: {
    fontSize: 13,
    color: "#666",
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
    marginTop: -2,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#3498db",
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
  },
  saveButtonDisabled: {
    color: "#a9cce3",
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    padding: 16,
  },

  // Form elements
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
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

  // Icon Preview
  iconPreview: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#e8f4fd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  previewIcon: {
    fontSize: 40,
  },
  iconHint: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  // Examples
  examplesContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  exampleTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  exampleTag: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exampleTagText: {
    fontSize: 13,
    color: "#3498db",
    fontWeight: "500",
  },
});

export default TaskTypesScreen;
