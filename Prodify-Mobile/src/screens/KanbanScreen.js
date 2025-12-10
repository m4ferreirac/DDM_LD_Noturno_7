import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { taskService } from "../services/taskService";
import { taskTypeService } from "../services/taskTypeService";
import { userService } from "../services/userService";
import { KanbanHeader } from "../components/Header";
import { TaskCard } from "../components/Card";
import { FullScreenLoading } from "../components/LoadingSpinner";
import { NoTasksEmptyState } from "../components/EmptyState";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.85;

const KanbanScreen = ({ navigation }) => {
  const { userProfile, getUserDisplayName, isManager, getUserId } = useAuth();

  const [kanbanData, setKanbanData] = useState({
    ToDo: [],
    Doing: [],
    Done: [],
  });
  const [taskTypes, setTaskTypes] = useState({});
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [movingTaskId, setMovingTaskId] = useState(null);
  const [activeColumn, setActiveColumn] = useState("ToDo");

  // Fetch kanban data
  const fetchKanbanData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      // Fetch all data in parallel
      const [kanban, types, allUsers] = await Promise.all([
        taskService.getKanban(),
        taskTypeService.getAllTaskTypes(),
        userService.getUserNames().catch(() => []),
      ]);

      // Create lookup maps
      const typesMap = {};
      types.forEach((t) => {
        typesMap[t.id] = t.name;
      });

      const usersMap = {};
      allUsers.forEach((u) => {
        usersMap[u.id] = u.name;
      });

      setKanbanData(kanban);
      setTaskTypes(typesMap);
      setUsers(usersMap);
    } catch (error) {
      console.error("Error fetching kanban data:", error);
      Alert.alert("Erro", "Não foi possível carregar as tarefas.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchKanbanData();
  }, [fetchKanbanData]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchKanbanData(false);
  };

  // Handle task press - navigate to details
  const handleTaskPress = (task) => {
    navigation.navigate("TaskDetails", {
      taskId: task.id,
      readOnly: !isManager() || task.state === "Done",
    });
  };

  // Handle move task
  const handleMoveTask = async (task, toState) => {
    const userId = getUserId();

    // Check if user can move this task
    if (!task.idProgrammers || !task.idProgrammers.includes(userId)) {
      Alert.alert(
        "Ação não permitida",
        "Apenas pode mover as suas próprias tarefas.",
      );
      return;
    }

    // Confirm action
    const stateLabels = {
      Doing: "Em Curso",
      Done: "Concluído",
    };

    Alert.alert(
      "Mover Tarefa",
      `Tem certeza que deseja mover esta tarefa para "${stateLabels[toState]}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setMovingTaskId(task.id);
            try {
              await taskService.moveTask(task.id, toState);
              await fetchKanbanData(false);
              Alert.alert(
                "Sucesso",
                `Tarefa movida para "${stateLabels[toState]}" com sucesso!`,
              );
            } catch (error) {
              Alert.alert(
                "Erro",
                error.message || "Não foi possível mover a tarefa.",
              );
            } finally {
              setMovingTaskId(null);
            }
          },
        },
      ],
    );
  };

  // Check if user can move a specific task
  const canUserMoveTask = (task) => {
    const userId = getUserId();
    return task.idProgrammers && task.idProgrammers.includes(userId);
  };

  // Get programmer names for a task
  const getProgrammerNames = (task) => {
    if (!task.idProgrammers || task.idProgrammers.length === 0) return "-";
    return task.idProgrammers
      .map((id) => users[id] || "Desconhecido")
      .join(", ");
  };

  // Render task card
  const renderTaskCard = (task, column) => {
    const canMove = canUserMoveTask(task);
    const canMoveToDoing = column === "ToDo" && canMove;
    const canMoveToDone = column === "Doing" && canMove;
    const isMoving = movingTaskId === task.id;

    return (
      <TaskCard
        key={task.id}
        task={task}
        onPress={() => handleTaskPress(task)}
        onMovePress={(toState) => handleMoveTask(task, toState)}
        showMoveButtons={canMove && (canMoveToDoing || canMoveToDone)}
        canMoveToDoing={canMoveToDoing}
        canMoveToDone={canMoveToDone}
        programmerName={getProgrammerNames(task)}
        taskTypeName={taskTypes[task.idTaskType] || "-"}
        style={isMoving ? styles.movingCard : null}
      />
    );
  };

  // Render column
  const renderColumn = (title, state, color, tasks) => {
    const isActive = activeColumn === state;

    return (
      <View
        style={[
          styles.column,
          { width: COLUMN_WIDTH },
          isActive && styles.activeColumn,
        ]}
      >
        {/* Column Header */}
        <View style={[styles.columnHeader, { backgroundColor: color }]}>
          <Text style={styles.columnTitle}>{title}</Text>
          <View style={styles.columnBadge}>
            <Text style={styles.columnCount}>{tasks.length}</Text>
          </View>
        </View>

        {/* Column Content */}
        <ScrollView
          style={styles.columnContent}
          contentContainerStyle={styles.columnContentContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {tasks.length === 0 ? (
            <View style={styles.emptyColumn}>
              <Text style={styles.emptyColumnText}>Sem tarefas</Text>
            </View>
          ) : (
            tasks
              .sort((a, b) => (a.orderTask || 0) - (b.orderTask || 0))
              .map((task) => renderTaskCard(task, state))
          )}
        </ScrollView>
      </View>
    );
  };

  // Render column indicators
  const renderColumnIndicators = () => {
    const columns = [
      { state: "ToDo", color: "#3498db" },
      { state: "Doing", color: "#f39c12" },
      { state: "Done", color: "#27ae60" },
    ];

    return (
      <View style={styles.indicatorContainer}>
        {columns.map((col) => (
          <TouchableOpacity
            key={col.state}
            style={[
              styles.indicator,
              { backgroundColor: col.color },
              activeColumn === col.state && styles.activeIndicator,
            ]}
            onPress={() => setActiveColumn(col.state)}
          />
        ))}
      </View>
    );
  };

  // Get total task count
  const getTotalTasks = () => {
    return (
      (kanbanData.ToDo?.length || 0) +
      (kanbanData.Doing?.length || 0) +
      (kanbanData.Done?.length || 0)
    );
  };

  if (isLoading) {
    return <FullScreenLoading text="A carregar tarefas..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header with user info */}
      <KanbanHeader
        userName={getUserDisplayName()}
        userRole={isManager() ? "Gestor" : "Programador"}
        onProfilePress={() => navigation.navigate("MenuTab")}
      />

      {/* Content */}
      <View style={styles.content}>
        {getTotalTasks() === 0 ? (
          <NoTasksEmptyState
            isManager={isManager()}
            onCreatePress={() =>
              navigation.navigate("TaskForm", { mode: "create" })
            }
          />
        ) : (
          <>
            {/* Column Indicators */}
            {renderColumnIndicators()}

            {/* Kanban Board - Horizontal Scroll */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.boardContainer}
              onMomentumScrollEnd={(e) => {
                const pageIndex = Math.round(
                  e.nativeEvent.contentOffset.x / COLUMN_WIDTH,
                );
                const states = ["ToDo", "Doing", "Done"];
                setActiveColumn(states[pageIndex] || "ToDo");
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#3498db"]}
                  tintColor="#3498db"
                />
              }
            >
              {renderColumn(
                "A Fazer",
                "ToDo",
                "#3498db",
                kanbanData.ToDo || [],
              )}
              {renderColumn(
                "Em Curso",
                "Doing",
                "#f39c12",
                kanbanData.Doing || [],
              )}
              {renderColumn(
                "Concluído",
                "Done",
                "#27ae60",
                kanbanData.Done || [],
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* Floating Action Button - Manager only */}
      {isManager() && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("TaskForm", { mode: "create" })}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
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

  // Indicator styles
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.4,
  },
  activeIndicator: {
    opacity: 1,
    width: 24,
    height: 10,
    borderRadius: 5,
  },

  // Board styles
  boardContainer: {
    paddingHorizontal: (SCREEN_WIDTH - COLUMN_WIDTH) / 2,
  },

  // Column styles
  column: {
    marginHorizontal: 8,
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeColumn: {
    // Additional styling for active column if needed
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  columnBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  columnContent: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  columnContentContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  emptyColumn: {
    padding: 40,
    alignItems: "center",
  },
  emptyColumnText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },

  // Moving card style
  movingCard: {
    opacity: 0.6,
  },

  // FAB styles
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
});

export default KanbanScreen;
