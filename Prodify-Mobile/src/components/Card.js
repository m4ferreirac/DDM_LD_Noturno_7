import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

const Card = ({
  children,
  style,
  onPress,
  disabled = false,
  elevation = 2,
  borderRadius = 12,
  padding = 16,
  backgroundColor = "#ffffff",
}) => {
  const cardStyle = [
    styles.card,
    {
      borderRadius,
      padding,
      backgroundColor,
      ...getShadowStyle(elevation),
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// Task Card Component
export const TaskCard = ({
  task,
  onPress,
  onMovePress,
  showMoveButtons = false,
  canMoveToDoing = false,
  canMoveToDone = false,
  style,
  programmerName,
  taskTypeName,
}) => {
  const getStateColor = (state) => {
    const colors = {
      ToDo: "#3498db",
      Doing: "#f39c12",
      Done: "#27ae60",
    };
    return colors[state] || "#95a5a6";
  };

  const getStateLabel = (state) => {
    const labels = {
      ToDo: "A Fazer",
      Doing: "Em Curso",
      Done: "Concluído",
    };
    return labels[state] || state;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    // Handle Firestore timestamp objects with _seconds
    let date;
    if (dateValue._seconds) {
      date = new Date(dateValue._seconds * 1000);
    } else if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card style={[styles.taskCard, style]} onPress={onPress}>
      {/* Header with state badge */}
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.stateBadge,
            { backgroundColor: getStateColor(task.state) },
          ]}
        >
          <Text style={styles.stateBadgeText}>{getStateLabel(task.state)}</Text>
        </View>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>#{task.orderTask}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.taskDescription} numberOfLines={2}>
        {task.description}
      </Text>

      {/* Task Type and Story Points */}
      <View style={styles.taskMeta}>
        {taskTypeName && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Tipo:</Text>
            <Text style={styles.metaValue}>{taskTypeName}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>SP:</Text>
          <View style={styles.storyPointsBadge}>
            <Text style={styles.storyPointsText}>{task.storyPoints}</Text>
          </View>
        </View>
      </View>

      {/* Programmer Name */}
      {programmerName && (
        <View style={styles.programmerContainer}>
          <Text style={styles.programmerIcon}>👤</Text>
          <Text style={styles.programmerName}>{programmerName}</Text>
        </View>
      )}

      {/* Dates */}
      <View style={styles.datesContainer}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Início Prev.</Text>
          <Text style={styles.dateValue}>
            {formatDate(task.expectedStartDate)}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Fim Prev.</Text>
          <Text style={styles.dateValue}>
            {formatDate(task.expectedEndDate)}
          </Text>
        </View>
      </View>

      {/* Move Buttons */}
      {showMoveButtons && (canMoveToDoing || canMoveToDone) && (
        <View style={styles.moveButtonsContainer}>
          {canMoveToDoing && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveToDoingButton]}
              onPress={() => onMovePress && onMovePress("Doing")}
            >
              <Text style={styles.moveButtonText}>➡️ Em Curso</Text>
            </TouchableOpacity>
          )}
          {canMoveToDone && (
            <TouchableOpacity
              style={[styles.moveButton, styles.moveToDoneButton]}
              onPress={() => onMovePress && onMovePress("Done")}
            >
              <Text style={styles.moveButtonText}>✅ Concluído</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

// User Card Component
export const UserCard = ({
  user,
  onPress,
  onEditPress,
  onDeletePress,
  showActions = false,
  managerName,
  style,
}) => {
  const getRoleLabel = (isManager) => {
    return isManager ? "Gestor" : "Programador";
  };

  const getRoleColor = (isManager) => {
    return isManager ? "#9b59b6" : "#3498db";
  };

  const getDepartmentColor = (department) => {
    const colors = {
      IT: "#3498db",
      Marketing: "#e74c3c",
      Administração: "#27ae60",
    };
    return colors[department] || "#95a5a6";
  };

  const getExperienceLabel = (level) => {
    const labels = {
      Junior: "Júnior",
      Senior: "Sénior",
    };
    return labels[level] || level || "-";
  };

  return (
    <Card style={[styles.userCard, style]} onPress={onPress}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUsername}>@{user.userName}</Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleColor(user.isManager) },
          ]}
        >
          <Text style={styles.roleBadgeText}>
            {getRoleLabel(user.isManager)}
          </Text>
        </View>
      </View>

      <View style={styles.userMeta}>
        {user.department && (
          <View
            style={[
              styles.departmentBadge,
              { backgroundColor: getDepartmentColor(user.department) },
            ]}
          >
            <Text style={styles.departmentText}>{user.department}</Text>
          </View>
        )}
        {user.experienceLevel && (
          <View style={styles.experienceBadge}>
            <Text style={styles.experienceText}>
              {getExperienceLabel(user.experienceLevel)}
            </Text>
          </View>
        )}
      </View>

      {!user.isManager && managerName && (
        <View style={styles.managerInfo}>
          <Text style={styles.managerLabel}>Gestor:</Text>
          <Text style={styles.managerName}>{managerName}</Text>
        </View>
      )}

      {showActions && (
        <View style={styles.actionsContainer}>
          {onEditPress && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEditPress}
            >
              <Text style={styles.actionButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
          {onDeletePress && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDeletePress}
            >
              <Text style={styles.actionButtonText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

// Task Type Card Component
export const TaskTypeCard = ({
  taskType,
  onPress,
  onEditPress,
  onDeletePress,
  showActions = false,
  style,
}) => {
  return (
    <Card style={[styles.taskTypeCard, style]} onPress={onPress}>
      <View style={styles.taskTypeHeader}>
        <View style={styles.taskTypeIcon}>
          <Text style={styles.taskTypeIconText}>📋</Text>
        </View>
        <Text style={styles.taskTypeName}>{taskType.name}</Text>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          {onEditPress && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEditPress}
            >
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDeletePress && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDeletePress}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
};

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "#3498db",
  style,
}) => {
  return (
    <Card style={[styles.statsCard, style]}>
      <View
        style={[styles.statsIconContainer, { backgroundColor: color + "20" }]}
      >
        <Text style={styles.statsIcon}>{icon || "📊"}</Text>
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={[styles.statsValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
    </Card>
  );
};

// Helper function for shadow styles
const getShadowStyle = (elevation) => {
  return {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + elevation * 0.03,
    shadowRadius: elevation * 1.5,
    elevation: elevation,
  };
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginVertical: 6,
    marginHorizontal: 2,
  },

  // Task Card Styles
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 22,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 13,
    color: "#666",
    marginRight: 4,
  },
  metaValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  storyPointsBadge: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  storyPointsText: {
    color: "#3498db",
    fontSize: 13,
    fontWeight: "600",
  },
  programmerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  programmerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  programmerName: {
    fontSize: 13,
    color: "#666",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  moveButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  moveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  moveToDoingButton: {
    backgroundColor: "#fff3e0",
  },
  moveToDoneButton: {
    backgroundColor: "#e8f5e9",
  },
  moveButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  // User Card Styles
  userCard: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    color: "#666",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  userMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  departmentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  departmentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  experienceBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  experienceText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  managerInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  managerLabel: {
    fontSize: 13,
    color: "#666",
    marginRight: 6,
  },
  managerName: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },

  // Task Type Card Styles
  taskTypeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
  },
  taskTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e8f4fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskTypeIconText: {
    fontSize: 18,
  },
  taskTypeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },

  // Actions
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: "#e8f4fd",
  },
  deleteButton: {
    backgroundColor: "#fde8e8",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Stats Card Styles
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  statsIcon: {
    fontSize: 24,
  },
  statsContent: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statsSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});

export default Card;
