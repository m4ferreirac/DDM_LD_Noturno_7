import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const EmptyState = ({
  icon = '📭',
  title = 'Sem dados',
  message = 'Não existem itens para mostrar.',
  actionLabel,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Variant for no tasks
export const NoTasksEmptyState = ({ onCreatePress, isManager }) => (
  <EmptyState
    icon="📋"
    title="Sem tarefas"
    message={
      isManager
        ? 'Ainda não existem tarefas. Crie a primeira tarefa para começar.'
        : 'Não tem tarefas atribuídas de momento.'
    }
    actionLabel={isManager ? 'Criar Tarefa' : undefined}
    onActionPress={isManager ? onCreatePress : undefined}
  />
);

// Variant for no users
export const NoUsersEmptyState = ({ onCreatePress }) => (
  <EmptyState
    icon="👥"
    title="Sem utilizadores"
    message="Ainda não existem utilizadores registados."
    actionLabel="Criar Utilizador"
    onActionPress={onCreatePress}
  />
);

// Variant for no task types
export const NoTaskTypesEmptyState = ({ onCreatePress }) => (
  <EmptyState
    icon="🏷️"
    title="Sem tipos de tarefas"
    message="Ainda não existem tipos de tarefas definidos."
    actionLabel="Criar Tipo"
    onActionPress={onCreatePress}
  />
);

// Variant for no stats/data
export const NoStatsEmptyState = () => (
  <EmptyState
    icon="📊"
    title="Sem estatísticas"
    message="Ainda não existem dados suficientes para mostrar estatísticas."
  />
);

// Variant for search results
export const NoSearchResultsEmptyState = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon="🔍"
    title="Sem resultados"
    message={`Não foram encontrados resultados para "${searchTerm}".`}
    actionLabel="Limpar pesquisa"
    onActionPress={onClearSearch}
  />
);

// Variant for error state
export const ErrorEmptyState = ({ message, onRetry }) => (
  <EmptyState
    icon="⚠️"
    title="Ocorreu um erro"
    message={message || 'Não foi possível carregar os dados.'}
    actionLabel="Tentar novamente"
    onActionPress={onRetry}
  />
);

// Variant for offline state
export const OfflineEmptyState = ({ onRetry }) => (
  <EmptyState
    icon="📡"
    title="Sem ligação"
    message="Verifique a sua ligação à internet e tente novamente."
    actionLabel="Tentar novamente"
    onActionPress={onRetry}
  />
);

// Variant for completed tasks list (programmer)
export const NoCompletedTasksEmptyState = () => (
  <EmptyState
    icon="✅"
    title="Sem tarefas concluídas"
    message="Ainda não concluiu nenhuma tarefa."
  />
);

// Variant for pending tasks list (manager)
export const NoPendingTasksEmptyState = () => (
  <EmptyState
    icon="⏳"
    title="Sem tarefas pendentes"
    message="Não existem tarefas pendentes de momento."
  />
);

// Variant for programmers list
export const NoProgrammersEmptyState = ({ onCreatePress }) => (
  <EmptyState
    icon="👨‍💻"
    title="Sem programadores"
    message="Ainda não tem programadores associados."
    actionLabel="Adicionar Programador"
    onActionPress={onCreatePress}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'transparent',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
