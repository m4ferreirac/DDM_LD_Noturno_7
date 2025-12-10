import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { SimpleHeader } from "../components/Header";
import Card from "../components/Card";

const MenuScreen = ({ navigation }) => {
  const { userProfile, isManager, getUserDisplayName, logout, isLoading } =
    useAuth();

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      "Terminar Sessão",
      "Tem certeza que deseja terminar a sessão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Terminar",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert("Erro", "Não foi possível terminar a sessão.");
            }
          },
        },
      ],
    );
  };

  // Menu items configuration
  const getMenuItems = () => {
    const commonItems = [
      {
        id: "kanban",
        title: "Quadro Kanban",
        subtitle: "Ver e gerir tarefas",
        icon: "📋",
        screen: "KanbanTab",
        isTab: true,
        color: "#3498db",
      },
      {
        id: "stats",
        title: "Estatísticas",
        subtitle: isManager()
          ? "Análise de produtividade"
          : "As minhas tarefas concluídas",
        icon: "📊",
        screen: "StatsTab",
        isTab: true,
        color: "#9b59b6",
      },
    ];

    const managerItems = [
      {
        id: "users",
        title: "Gestão de Utilizadores",
        subtitle: "Gerir programadores e gestores",
        icon: "👥",
        screen: "UsersTab",
        isTab: true,
        color: "#27ae60",
      },
      {
        id: "taskTypes",
        title: "Tipos de Tarefas",
        subtitle: "Configurar tipos de tarefas",
        icon: "🏷️",
        screen: "TaskTypes",
        isTab: false,
        color: "#f39c12",
      },
    ];

    if (isManager()) {
      return [...commonItems, ...managerItems];
    }

    return commonItems;
  };

  // Handle menu navigation
  const handleMenuNavigation = (item) => {
    if (item.isTab) {
      // Navigate to tab within MainTabs
      navigation.navigate("MainTabs", { screen: item.screen });
    } else {
      // Navigate to stack screen
      navigation.navigate(item.screen);
    }
  };

  // Render menu item
  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuNavigation(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: item.color + "20" },
        ]}
      >
        <Text style={styles.menuIcon}>{item.icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  // Get role display
  const getRoleDisplay = () => {
    return isManager() ? "Gestor" : "Programador";
  };

  // Get role color
  const getRoleColor = () => {
    return isManager() ? "#9b59b6" : "#27ae60";
  };

  // Get department display
  const getDepartmentDisplay = () => {
    return userProfile?.department || "-";
  };

  // Get experience display
  const getExperienceDisplay = () => {
    const levels = {
      Junior: "Júnior",
      Senior: "Sénior",
    };
    return levels[userProfile?.experienceLevel] || "-";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <SimpleHeader
        title="Menu"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {getUserDisplayName().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{getUserDisplayName()}</Text>
              <Text style={styles.profileUsername}>
                @{userProfile?.userName || "utilizador"}
              </Text>
              <View
                style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}
              >
                <Text style={styles.roleText}>{getRoleDisplay()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Departamento</Text>
              <Text style={styles.detailValue}>{getDepartmentDisplay()}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Experiência</Text>
              <Text style={styles.detailValue}>{getExperienceDisplay()}</Text>
            </View>
          </View>
        </Card>

        {/* Menu Section */}
        <Text style={styles.sectionTitle}>Navegação</Text>
        <View style={styles.menuContainer}>
          {getMenuItems().map(renderMenuItem)}
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.menuContainer}>
          {/* Create Task (Manager only) */}
          {isManager() && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                navigation.navigate("TaskForm", { mode: "create" })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: "#3498db20" },
                ]}
              >
                <Text style={styles.menuIcon}>➕</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Nova Tarefa</Text>
                <Text style={styles.menuSubtitle}>Criar uma nova tarefa</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Refresh Data */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert("Sucesso", "Dados atualizados!");
              navigation.navigate("MainTabs", { screen: "KanbanTab" });
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: "#2ecc7120" },
              ]}
            >
              <Text style={styles.menuIcon}>🔄</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Atualizar Dados</Text>
              <Text style={styles.menuSubtitle}>Recarregar informações</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.menuContainer}>
          {/* Logout */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: "#e74c3c20" },
              ]}
            >
              <Text style={styles.menuIcon}>🚪</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: "#e74c3c" }]}>
                Terminar Sessão
              </Text>
              <Text style={styles.menuSubtitle}>Sair da aplicação</Text>
            </View>
            <Text style={[styles.menuArrow, { color: "#e74c3c" }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Prodify</Text>
          <Text style={styles.appVersion}>Versão 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 DDM ISTEC</Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Profile Card
  profileCard: {
    marginBottom: 24,
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  profileDetails: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  detailDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },

  // Menu Container
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Menu Item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#999",
  },
  menuArrow: {
    fontSize: 24,
    color: "#ccc",
    fontWeight: "300",
  },

  // App Info
  appInfo: {
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
    color: "#999",
    marginBottom: 2,
  },
  appCopyright: {
    fontSize: 12,
    color: "#bbb",
  },
});

export default MenuScreen;
