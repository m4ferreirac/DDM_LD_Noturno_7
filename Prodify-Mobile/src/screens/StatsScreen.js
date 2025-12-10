import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  FlatList,
  Share,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { useAuth } from "../contexts/AuthContext";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import { SimpleHeader } from "../components/Header";
import { StatsCard } from "../components/Card";
import Card from "../components/Card";
import Button from "../components/Button";
import { FullScreenLoading } from "../components/LoadingSpinner";
import {
  NoCompletedTasksEmptyState,
  NoPendingTasksEmptyState,
  NoStatsEmptyState,
} from "../components/EmptyState";

const StatsScreen = ({ navigation }) => {
  const { isManager, getUserDisplayName } = useAuth();

  // Data state
  const [completedStats, setCompletedStats] = useState([]);
  const [pendingStats, setPendingStats] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [users, setUsers] = useState({});

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("completed");

  // Fetch stats data
  const fetchStats = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);

        // Fetch users for name lookup
        const allUsers = await userService.getUserNames().catch(() => []);
        const usersMap = {};
        allUsers.forEach((u) => {
          usersMap[u.id] = u.name;
        });
        setUsers(usersMap);

        if (isManager()) {
          // Manager stats
          const [completed, pending, forecastData] = await Promise.all([
            taskService.getManagerCompletedStats(),
            taskService.getManagerPendingStats(),
            taskService.getManagerForecast(),
          ]);

          setCompletedStats(completed);
          setPendingStats(pending);
          setForecast(forecastData);
        } else {
          // Programmer stats
          const completed = await taskService.getProgrammerCompletedStats();
          setCompletedStats(completed);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        Alert.alert("Erro", "Não foi possível carregar as estatísticas.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isManager],
  );

  // Load data on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats(false);
  };

  // Export CSV (Manager only)
  const handleExportCSV = async () => {
    if (!isManager()) return;

    setIsExporting(true);

    try {
      const csvData = await taskService.exportManagerCompletedCSV();

      // Create file using new expo-file-system API
      const fileName = `tarefas_concluidas_${new Date().toISOString().split("T")[0]}.csv`;
      const file = new File(Paths.cache, fileName);

      // Write content to file
      await file.write(csvData);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/csv",
          dialogTitle: "Exportar Tarefas Concluídas",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Sucesso", `Ficheiro guardado em: ${file.uri}`);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      Alert.alert("Erro", "Não foi possível exportar o ficheiro CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // Get programmer names for a task
  const getProgrammerNames = (programmerIds) => {
    if (!programmerIds || programmerIds.length === 0) return "-";
    return programmerIds.map((id) => users[id] || "Desconhecido").join(", ");
  };

  // Format days
  const formatDays = (days) => {
    if (days === null || days === undefined) return "-";
    return `${days.toFixed(1)} dias`;
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    if (completedStats.length === 0) {
      return {
        totalCompleted: 0,
        avgDuration: 0,
        totalDuration: 0,
      };
    }

    const durations = completedStats
      .map((t) => t.durationDays)
      .filter((d) => d !== null && d !== undefined);

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration =
      durations.length > 0 ? totalDuration / durations.length : 0;

    return {
      totalCompleted: completedStats.length,
      avgDuration: avgDuration.toFixed(1),
      totalDuration: totalDuration.toFixed(1),
    };
  };

  // Render completed task item (Programmer)
  const renderProgrammerCompletedItem = ({ item }) => (
    <Card style={styles.taskItem}>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Duração:</Text>
          <Text style={styles.metaValue}>{formatDays(item.durationDays)}</Text>
        </View>
      </View>
    </Card>
  );

  // Render completed task item (Manager)
  const renderManagerCompletedItem = ({ item }) => {
    const expectedDays = item.expectedDays || 0;
    const actualDays = item.durationDays || 0;
    const isDelayed = actualDays > expectedDays;

    return (
      <Card style={styles.taskItem}>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskMetaGrid}>
          <View style={styles.metaGridItem}>
            <Text style={styles.metaLabel}>Programador:</Text>
            <Text style={styles.metaValue}>
              {getProgrammerNames(item.programmerIds)}
            </Text>
          </View>
          <View style={styles.metaGridItem}>
            <Text style={styles.metaLabel}>Previsto:</Text>
            <Text style={styles.metaValue}>
              {formatDays(item.expectedDays)}
            </Text>
          </View>
          <View style={styles.metaGridItem}>
            <Text style={styles.metaLabel}>Real:</Text>
            <Text style={[styles.metaValue, isDelayed && styles.delayedValue]}>
              {formatDays(item.durationDays)}
            </Text>
          </View>
          {isDelayed && (
            <View style={styles.metaGridItem}>
              <Text style={styles.metaLabel}>Atraso:</Text>
              <Text style={styles.delayedValue}>
                +{(actualDays - expectedDays).toFixed(1)} dias
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  // Render pending task item (Manager)
  const renderPendingItem = ({ item }) => {
    const isLate = item.lateDays > 0;

    return (
      <Card style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <View
            style={[
              styles.stateBadge,
              { backgroundColor: getStateColor(item.state) },
            ]}
          >
            <Text style={styles.stateBadgeText}>
              {getStateLabel(item.state)}
            </Text>
          </View>
          {isLate && (
            <View style={styles.lateBadge}>
              <Text style={styles.lateBadgeText}>⚠️ Atrasada</Text>
            </View>
          )}
        </View>
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Programador:</Text>
            <Text style={styles.metaValue}>
              {getProgrammerNames(item.programmerIds)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>
              {isLate ? "Dias em atraso:" : "Dias restantes:"}
            </Text>
            <Text style={[styles.metaValue, isLate && styles.delayedValue]}>
              {isLate
                ? `${item.lateDays.toFixed(1)}`
                : `${(item.remainingDays || 0).toFixed(1)}`}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  // Get state color
  const getStateColor = (state) => {
    const colors = {
      ToDo: "#3498db",
      Doing: "#f39c12",
      Done: "#27ae60",
    };
    return colors[state] || "#95a5a6";
  };

  // Get state label
  const getStateLabel = (state) => {
    const labels = {
      ToDo: "A Fazer",
      Doing: "Em Curso",
      Done: "Concluído",
    };
    return labels[state] || state;
  };

  // Render tabs (Manager only)
  const renderTabs = () => {
    if (!isManager()) return null;

    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Concluídas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Em Curso
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "forecast" && styles.activeTab]}
          onPress={() => setActiveTab("forecast")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "forecast" && styles.activeTabText,
            ]}
          >
            Previsão
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    const summaryStats = getSummaryStats();

    if (!isManager()) {
      // Programmer view - only completed tasks
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#3498db"]}
              tintColor="#3498db"
            />
          }
        >
          {/* Summary Cards */}
          <View style={styles.statsGrid}>
            <StatsCard
              title="Tarefas Concluídas"
              value={summaryStats.totalCompleted}
              icon="✅"
              color="#27ae60"
            />
            <StatsCard
              title="Média de Duração"
              value={`${summaryStats.avgDuration} dias`}
              icon="⏱️"
              color="#3498db"
            />
          </View>

          {/* Completed Tasks List */}
          <Text style={styles.sectionTitle}>Tarefas Concluídas</Text>
          {completedStats.length === 0 ? (
            <NoCompletedTasksEmptyState />
          ) : (
            completedStats.map((item, index) => (
              <View key={item.id || index}>
                {renderProgrammerCompletedItem({ item })}
              </View>
            ))
          )}
        </ScrollView>
      );
    }

    // Manager view - tabs
    switch (activeTab) {
      case "completed":
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#3498db"]}
                tintColor="#3498db"
              />
            }
          >
            {/* Summary Cards */}
            <View style={styles.statsGrid}>
              <StatsCard
                title="Tarefas Concluídas"
                value={summaryStats.totalCompleted}
                icon="✅"
                color="#27ae60"
              />
              <StatsCard
                title="Média de Duração"
                value={`${summaryStats.avgDuration} dias`}
                icon="⏱️"
                color="#3498db"
              />
            </View>

            {/* Export Button */}
            <Button
              title="Exportar CSV"
              onPress={handleExportCSV}
              loading={isExporting}
              disabled={isExporting || completedStats.length === 0}
              variant="outline"
              size="medium"
              style={styles.exportButton}
            />

            {/* Completed Tasks List */}
            <Text style={styles.sectionTitle}>Tarefas Concluídas</Text>
            {completedStats.length === 0 ? (
              <NoCompletedTasksEmptyState />
            ) : (
              completedStats.map((item, index) => (
                <View key={item.id || index}>
                  {renderManagerCompletedItem({ item })}
                </View>
              ))
            )}
          </ScrollView>
        );

      case "pending":
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#3498db"]}
                tintColor="#3498db"
              />
            }
          >
            {/* Summary Cards */}
            <View style={styles.statsGrid}>
              <StatsCard
                title="Tarefas Pendentes"
                value={pendingStats.length}
                icon="⏳"
                color="#f39c12"
              />
              <StatsCard
                title="Em Atraso"
                value={pendingStats.filter((t) => t.lateDays > 0).length}
                icon="⚠️"
                color="#e74c3c"
              />
            </View>

            {/* Pending Tasks List */}
            <Text style={styles.sectionTitle}>Tarefas em Curso</Text>
            {pendingStats.length === 0 ? (
              <NoPendingTasksEmptyState />
            ) : (
              pendingStats.map((item, index) => (
                <View key={item.id || index}>
                  {renderPendingItem({ item })}
                </View>
              ))
            )}
          </ScrollView>
        );

      case "forecast":
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#3498db"]}
                tintColor="#3498db"
              />
            }
          >
            {/* Forecast Summary */}
            {forecast ? (
              <>
                <Card style={styles.forecastCard}>
                  <View style={styles.forecastHeader}>
                    <Text style={styles.forecastIcon}>📊</Text>
                    <View style={styles.forecastInfo}>
                      <Text style={styles.forecastTitle}>Previsão Total</Text>
                      <Text style={styles.forecastValue}>
                        {forecast.totalDays?.toFixed(1) || "0"} dias
                      </Text>
                      <Text style={styles.forecastSubtitle}>
                        para completar todas as tarefas "A Fazer"
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Forecast Items */}
                <Text style={styles.sectionTitle}>
                  Estimativa por Tarefa ({forecast.items?.length || 0})
                </Text>
                {forecast.items && forecast.items.length > 0 ? (
                  forecast.items.map((item, index) => (
                    <Card key={item.id || index} style={styles.forecastItem}>
                      <View style={styles.forecastItemRow}>
                        <View style={styles.spBadge}>
                          <Text style={styles.spBadgeText}>
                            {item.storyPoints} SP
                          </Text>
                        </View>
                        <Text style={styles.forecastItemEstimate}>
                          {item.estimatedDays !== null
                            ? `~${item.estimatedDays.toFixed(1)} dias`
                            : "Sem estimativa"}
                        </Text>
                      </View>
                    </Card>
                  ))
                ) : (
                  <NoStatsEmptyState />
                )}

                {/* Algorithm Explanation */}
                <Card style={styles.infoCard}>
                  <Text style={styles.infoTitle}>ℹ️ Como funciona</Text>
                  <Text style={styles.infoText}>
                    A previsão é calculada com base na média de tempo das
                    tarefas já concluídas, agrupadas por Story Points. Se não
                    existirem tarefas concluídas com os mesmos Story Points, é
                    utilizada a média do valor mais próximo.
                  </Text>
                </Card>
              </>
            ) : (
              <NoStatsEmptyState />
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <FullScreenLoading text="A carregar estatísticas..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <SimpleHeader
        title="Estatísticas"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getUserDisplayName()}</Text>
          <Text style={styles.userRole}>
            {isManager() ? "Gestor" : "Programador"}
          </Text>
        </View>

        {/* Tabs (Manager only) */}
        {renderTabs()}

        {/* Content */}
        {renderContent()}
      </View>
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

  // User Info
  userInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userRole: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#3498db",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#3498db",
    fontWeight: "600",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  // Export Button
  exportButton: {
    marginBottom: 16,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },

  // Task Item
  taskItem: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  taskDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  taskMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaGridItem: {
    width: "45%",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  delayedValue: {
    color: "#e74c3c",
    fontWeight: "600",
  },

  // State Badge
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stateBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  // Late Badge
  lateBadge: {
    backgroundColor: "#fde8e8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lateBadgeText: {
    fontSize: 11,
    color: "#e74c3c",
    fontWeight: "500",
  },

  // Forecast Card
  forecastCard: {
    marginBottom: 16,
    padding: 20,
  },
  forecastHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  forecastIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  forecastInfo: {
    flex: 1,
  },
  forecastTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3498db",
    marginBottom: 4,
  },
  forecastSubtitle: {
    fontSize: 12,
    color: "#999",
  },

  // Forecast Item
  forecastItem: {
    marginBottom: 8,
    padding: 12,
  },
  forecastItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spBadge: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  spBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3498db",
  },
  forecastItemEstimate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  // Info Card
  infoCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
});

export default StatsScreen;
