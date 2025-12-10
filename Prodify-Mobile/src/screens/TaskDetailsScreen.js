import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { taskService } from "../services/taskService";
import { taskTypeService } from "../services/taskTypeService";
import { userService } from "../services/userService";
import { SimpleHeader } from "../components/Header";

import Select, { MultiSelect } from "../components/Select";
import Button from "../components/Button";
import { FullScreenLoading } from "../components/LoadingSpinner";
import Card from "../components/Card";

const TaskDetailsScreen = ({ navigation, route }) => {
  const { taskId, readOnly: initialReadOnly, mode } = route.params || {};
  const { isManager, getUserId } = useAuth();

  const isCreateMode = mode === "create";
  const [readOnly, setReadOnly] = useState(initialReadOnly || !isManager());

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    storyPoints: "",
    expectedStartDate: "",
    expectedEndDate: "",
    idProgrammers: [],
    idTaskType: null,
    orderTask: "",
  });

  // Task data (for existing tasks)
  const [taskData, setTaskData] = useState(null);

  // Options
  const [taskTypes, setTaskTypes] = useState([]);
  const [programmers, setProgrammers] = useState([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});

  // Fetch task data and options
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch task types
      const types = await taskTypeService.getAllTaskTypes();

      // Format options
      const typeOptions = types.map((t) => ({ label: t.name, value: t.id }));
      setTaskTypes(typeOptions);

      // Fetch users - managers need full data (with managerId), programmers just need names
      const userId = getUserId();
      let programmerOptions = [];

      if (isManager()) {
        // Manager: get all users with full data to filter by managerId
        const allUsers = await userService.getAllUsers().catch(() => []);
        const programmerList = allUsers.filter(
          (u) => !u.isManager && u.managerId === userId,
        );
        programmerOptions = programmerList.map((p) => ({
          label: p.name,
          value: p.id,
        }));
      } else {
        // Programmer: just get names for display purposes
        const users = await userService.getUserNames().catch(() => []);
        const programmerList = users.filter((u) => !u.isManager);
        programmerOptions = programmerList.map((p) => ({
          label: p.name,
          value: p.id,
        }));
      }

      setProgrammers(programmerOptions);

      // Fetch task if editing
      if (taskId) {
        const task = await taskService.getTaskById(taskId);
        setTaskData(task);

        // Populate form
        setFormData({
          description: task.description || "",
          storyPoints: String(task.storyPoints || ""),
          expectedStartDate: task.expectedStartDate
            ? formatDateForInput(task.expectedStartDate)
            : "",
          expectedEndDate: task.expectedEndDate
            ? formatDateForInput(task.expectedEndDate)
            : "",
          idProgrammers: task.idProgrammers || [],
          idTaskType: task.idTaskType || null,
          orderTask: String(task.orderTask || ""),
        });

        // Update readOnly based on task state
        if (task.state === "Done") {
          setReadOnly(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da tarefa.");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [taskId, getUserId, isManager, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(
      dateValue._seconds ? dateValue._seconds * 1000 : dateValue,
    );
    return date.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(
      dateValue._seconds ? dateValue._seconds * 1000 : dateValue,
    );
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle form changes - memoized to prevent focus loss
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        return { ...prev, [field]: null };
      }
      return prev;
    });
  }, []);

  // Memoized handlers for each field to prevent re-renders
  const handleDescriptionChange = useCallback(
    (v) => handleChange("description", v),
    [handleChange],
  );
  const handleStoryPointsChange = useCallback(
    (v) => handleChange("storyPoints", v),
    [handleChange],
  );
  const handleOrderTaskChange = useCallback(
    (v) => handleChange("orderTask", v),
    [handleChange],
  );
  const handleIdTaskTypeChange = useCallback(
    (v) => handleChange("idTaskType", v),
    [handleChange],
  );
  const handleIdProgrammersChange = useCallback(
    (v) => handleChange("idProgrammers", v),
    [handleChange],
  );
  const handleExpectedStartDateChange = useCallback(
    (v) => handleChange("expectedStartDate", v),
    [handleChange],
  );
  const handleExpectedEndDateChange = useCallback(
    (v) => handleChange("expectedEndDate", v),
    [handleChange],
  );

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.storyPoints || parseInt(formData.storyPoints) < 1) {
      newErrors.storyPoints = "Story Points deve ser maior que 0";
    }

    if (isCreateMode) {
      if (!formData.idProgrammers || formData.idProgrammers.length === 0) {
        newErrors.idProgrammers = "Selecione pelo menos um programador";
      }

      if (!formData.idTaskType) {
        newErrors.idTaskType = "Tipo de tarefa é obrigatório";
      }

      if (!formData.orderTask || parseInt(formData.orderTask) < 1) {
        newErrors.orderTask = "Ordem da tarefa deve ser maior que 0";
      }
    }

    // Validate dates
    if (formData.expectedStartDate && formData.expectedEndDate) {
      if (
        new Date(formData.expectedStartDate) >
        new Date(formData.expectedEndDate)
      ) {
        newErrors.expectedEndDate =
          "Data de fim não pode ser anterior à data de início";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Erro", "Por favor corrija os erros no formulário.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        description: formData.description.trim(),
        storyPoints: parseInt(formData.storyPoints),
        expectedStartDate: formData.expectedStartDate
          ? new Date(formData.expectedStartDate).toISOString()
          : null,
        expectedEndDate: formData.expectedEndDate
          ? new Date(formData.expectedEndDate).toISOString()
          : null,
        idProgrammers: formData.idProgrammers,
        idTaskType: formData.idTaskType,
        orderTask: parseInt(formData.orderTask),
      };

      if (isCreateMode) {
        await taskService.createTask(payload);
        Alert.alert("Sucesso", "Tarefa criada com sucesso!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await taskService.updateTask(taskId, payload);
        Alert.alert("Sucesso", "Tarefa atualizada com sucesso!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível guardar a tarefa.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      "Eliminar Tarefa",
      "Tem certeza que deseja eliminar esta tarefa? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await taskService.deleteTask(taskId);
              Alert.alert("Sucesso", "Tarefa eliminada com sucesso!", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(
                "Erro",
                error.message || "Não foi possível eliminar a tarefa.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Get state badge styles
  const getStateBadge = (state) => {
    const styles = {
      ToDo: { bg: "#e8f4fd", color: "#3498db", label: "A Fazer" },
      Doing: { bg: "#fff3e0", color: "#f39c12", label: "Em Curso" },
      Done: { bg: "#e8f5e9", color: "#27ae60", label: "Concluído" },
    };
    return styles[state] || { bg: "#f0f0f0", color: "#666", label: state };
  };

  // Get programmer names
  const getProgrammerNames = () => {
    if (!taskData?.idProgrammers || taskData.idProgrammers.length === 0)
      return "-";
    return taskData.idProgrammers
      .map(
        (id) =>
          programmers.find((p) => p.value === id)?.label || "Desconhecido",
      )
      .join(", ");
  };

  if (isLoading) {
    return <FullScreenLoading text="A carregar tarefa..." />;
  }

  const stateBadge = taskData ? getStateBadge(taskData.state) : null;
  const canEdit = isManager() && taskData?.state !== "Done";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <SimpleHeader
        title={
          isCreateMode
            ? "Nova Tarefa"
            : readOnly
              ? "Detalhes da Tarefa"
              : "Editar Tarefa"
        }
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon={
          canEdit && readOnly ? <Text style={styles.editIcon}>✏️</Text> : null
        }
        onRightPress={canEdit && readOnly ? () => setReadOnly(false) : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* State Badge (for existing tasks) */}
          {taskData && stateBadge && (
            <View style={styles.stateContainer}>
              <View
                style={[styles.stateBadge, { backgroundColor: stateBadge.bg }]}
              >
                <Text
                  style={[styles.stateBadgeText, { color: stateBadge.color }]}
                >
                  {stateBadge.label}
                </Text>
              </View>
              <Text style={styles.orderLabel}>
                Ordem: #{taskData.orderTask}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Descrição <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  errors.description && styles.textInputError,
                  readOnly && styles.textInputDisabled,
                ]}
                value={formData.description}
                onChangeText={handleDescriptionChange}
                placeholder="Descreva a tarefa..."
                placeholderTextColor="#999"
                editable={!readOnly}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {/* Story Points */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Story Points <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.storyPoints && styles.textInputError,
                  readOnly && styles.textInputDisabled,
                ]}
                value={formData.storyPoints}
                onChangeText={handleStoryPointsChange}
                placeholder="Ex: 5"
                placeholderTextColor="#999"
                editable={!readOnly}
                keyboardType="numeric"
              />
              {errors.storyPoints && (
                <Text style={styles.errorText}>{errors.storyPoints}</Text>
              )}
            </View>

            {/* Order (create mode only or editable) */}
            {(isCreateMode || !readOnly) && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Ordem da Tarefa{" "}
                  {isCreateMode && <Text style={styles.required}>*</Text>}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.orderTask && styles.textInputError,
                    readOnly && styles.textInputDisabled,
                  ]}
                  value={formData.orderTask}
                  onChangeText={handleOrderTaskChange}
                  placeholder="Ex: 1"
                  placeholderTextColor="#999"
                  editable={!readOnly}
                  keyboardType="numeric"
                />
                {errors.orderTask && (
                  <Text style={styles.errorText}>{errors.orderTask}</Text>
                )}
                <Text style={styles.helperText}>
                  Define a prioridade de execução
                </Text>
              </View>
            )}

            {/* Task Type */}
            <Select
              label="Tipo de Tarefa"
              value={formData.idTaskType}
              options={taskTypes}
              onValueChange={handleIdTaskTypeChange}
              placeholder="Selecione o tipo"
              error={errors.idTaskType}
              required={isCreateMode}
              disabled={readOnly}
            />

            {/* Programmers */}
            {isCreateMode || !readOnly ? (
              <MultiSelect
                label="Programadores"
                values={formData.idProgrammers}
                options={programmers}
                onValuesChange={handleIdProgrammersChange}
                placeholder="Selecione programadores"
                error={errors.idProgrammers}
                required={isCreateMode}
                disabled={readOnly}
              />
            ) : (
              <View style={styles.readOnlyField}>
                <Text style={styles.fieldLabel}>Programadores</Text>
                <Text style={styles.fieldValue}>{getProgrammerNames()}</Text>
              </View>
            )}

            {/* Expected Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data Prevista de Início</Text>
              <TextInput
                style={[styles.textInput, readOnly && styles.textInputDisabled]}
                value={formData.expectedStartDate}
                onChangeText={handleExpectedStartDateChange}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#999"
                editable={!readOnly}
              />
              <Text style={styles.helperText}>Formato: AAAA-MM-DD</Text>
            </View>

            {/* Expected End Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data Prevista de Fim</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.expectedEndDate && styles.textInputError,
                  readOnly && styles.textInputDisabled,
                ]}
                value={formData.expectedEndDate}
                onChangeText={handleExpectedEndDateChange}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#999"
                editable={!readOnly}
              />
              {errors.expectedEndDate && (
                <Text style={styles.errorText}>{errors.expectedEndDate}</Text>
              )}
              <Text style={styles.helperText}>Formato: AAAA-MM-DD</Text>
            </View>

            {/* Read-only dates for existing tasks */}
            {taskData && (
              <Card style={styles.datesCard}>
                <Text style={styles.cardTitle}>Datas do Sistema</Text>

                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Data de Criação:</Text>
                  <Text style={styles.dateValue}>
                    {formatDateForDisplay(taskData.createDate)}
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Início Real:</Text>
                  <Text style={styles.dateValue}>
                    {taskData.realStartDate
                      ? formatDateForDisplay(taskData.realStartDate)
                      : "-"}
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Fim Real:</Text>
                  <Text style={styles.dateValue}>
                    {taskData.realEndDate
                      ? formatDateForDisplay(taskData.realEndDate)
                      : "-"}
                  </Text>
                </View>
              </Card>
            )}
          </View>

          {/* Action Buttons */}
          {!readOnly && (
            <View style={styles.buttonContainer}>
              <Button
                title={isCreateMode ? "Criar Tarefa" : "Guardar Alterações"}
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving || isDeleting}
                fullWidth
                size="large"
              />

              {!isCreateMode && (
                <Button
                  title="Eliminar Tarefa"
                  onPress={handleDelete}
                  loading={isDeleting}
                  disabled={isSaving || isDeleting}
                  variant="outlineDanger"
                  fullWidth
                  size="medium"
                  style={styles.deleteButton}
                />
              )}

              <Button
                title="Cancelar"
                onPress={() =>
                  isCreateMode ? navigation.goBack() : setReadOnly(true)
                }
                variant="ghost"
                fullWidth
                size="medium"
                disabled={isSaving || isDeleting}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3498db",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  editIcon: {
    fontSize: 20,
  },

  // State container
  stateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  stateBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stateBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  // Form
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Read-only field
  readOnlyField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#666",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },

  // Dates card
  datesCard: {
    marginTop: 8,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateLabel: {
    fontSize: 13,
    color: "#666",
  },
  dateValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
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
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  textInputError: {
    borderColor: "#e74c3c",
  },
  textInputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
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

  // Buttons
  buttonContainer: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 12,
  },
});

export default TaskDetailsScreen;
