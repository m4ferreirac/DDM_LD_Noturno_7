import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Select = ({
  label,
  value,
  options = [],
  onValueChange,
  placeholder = "Selecione uma opção",
  error,
  helperText,
  disabled = false,
  required = false,
  style,
  labelStyle,
  containerStyle,
  searchable = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const filteredOptions =
    searchable && searchText
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchText.toLowerCase()),
        )
      : options;

  const handleSelect = (option) => {
    onValueChange(option.value);
    setModalVisible(false);
    setSearchText("");
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchText("");
  };

  const getBorderColor = () => {
    if (error) return "#e74c3c";
    return "#dcdcdc";
  };

  const renderOption = ({ item }) => {
    const isSelected = item.value === value;
    return (
      <TouchableOpacity
        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.optionText, isSelected && styles.optionTextSelected]}
        >
          {item.label}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          { borderColor: getBorderColor() },
          disabled && styles.selectButtonDisabled,
          style,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={[styles.chevron, disabled && styles.disabledText]}>▼</Text>
      </TouchableOpacity>

      <View style={styles.bottomContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!error && helperText && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Selecionar"}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {searchable && (
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Pesquisar..."
                  placeholderTextColor="#999"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={renderOption}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchText
                      ? "Nenhum resultado encontrado"
                      : "Sem opções disponíveis"}
                  </Text>
                </View>
              }
              style={styles.optionsList}
              contentContainerStyle={styles.optionsListContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            />

            {/* Clear Selection Button */}
            {value !== null && value !== undefined && (
              <TouchableOpacity
                style={styles.clearSelectionButton}
                onPress={() => {
                  onValueChange(null);
                  handleClose();
                }}
              >
                <Text style={styles.clearSelectionText}>Limpar Seleção</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

// Multi-Select variant
export const MultiSelect = ({
  label,
  values = [],
  options = [],
  onValuesChange,
  placeholder = "Selecione opções",
  error,
  helperText,
  disabled = false,
  required = false,
  style,
  labelStyle,
  containerStyle,
  maxSelections,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabels = options
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label);

  const displayText =
    selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;

  const handleToggle = (optionValue) => {
    let newValues;
    if (values.includes(optionValue)) {
      newValues = values.filter((v) => v !== optionValue);
    } else {
      if (maxSelections && values.length >= maxSelections) {
        return;
      }
      newValues = [...values, optionValue];
    }
    onValuesChange(newValues);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const getBorderColor = () => {
    if (error) return "#e74c3c";
    return "#dcdcdc";
  };

  const renderOption = ({ item }) => {
    const isSelected = values.includes(item.value);
    const canSelect =
      !maxSelections || values.length < maxSelections || isSelected;

    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected,
          !canSelect && styles.optionItemDisabled,
        ]}
        onPress={() => canSelect && handleToggle(item.value)}
        disabled={!canSelect}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            !canSelect && styles.optionTextDisabled,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {maxSelections && (
            <Text style={styles.selectionCount}>
              {values.length}/{maxSelections}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          { borderColor: getBorderColor() },
          disabled && styles.selectButtonDisabled,
          style,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            selectedLabels.length === 0 && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={[styles.chevron, disabled && styles.disabledText]}>▼</Text>
      </TouchableOpacity>

      {/* Selected Tags */}
      {selectedLabels.length > 0 && (
        <View style={styles.tagsContainer}>
          {options
            .filter((opt) => values.includes(opt.value))
            .map((opt) => (
              <View key={opt.value} style={styles.tag}>
                <Text style={styles.tagText}>{opt.label}</Text>
                <TouchableOpacity
                  onPress={() => handleToggle(opt.value)}
                  style={styles.tagRemove}
                >
                  <Text style={styles.tagRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      <View style={styles.bottomContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!error && helperText && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Selecionar"}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {maxSelections && (
              <Text style={styles.maxSelectionsHint}>
                Selecione até {maxSelections}{" "}
                {maxSelections === 1 ? "opção" : "opções"}
              </Text>
            )}

            {/* Options List */}
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={renderOption}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Sem opções disponíveis</Text>
                </View>
              }
              style={styles.optionsList}
              contentContainerStyle={styles.optionsListContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            />

            {/* Done Button */}
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  required: {
    color: "#e74c3c",
    fontWeight: "600",
  },
  selectionCount: {
    fontSize: 12,
    color: "#666",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  selectText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  disabledText: {
    color: "#999",
  },
  chevron: {
    fontSize: 10,
    color: "#666",
    marginLeft: 8,
  },
  bottomContainer: {
    marginTop: 4,
    minHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
  },

  // Modal Styles
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

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearIcon: {
    fontSize: 14,
    color: "#999",
    padding: 4,
  },

  // Options List Styles
  optionsList: {
    flex: 1,
  },
  optionsListContent: {
    flexGrow: 1,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  optionItemSelected: {
    backgroundColor: "#e8f4fd",
  },
  optionItemDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    color: "#3498db",
    fontWeight: "600",
  },
  optionTextDisabled: {
    color: "#999",
  },
  checkmark: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },

  // Checkbox Styles
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#dcdcdc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  checkboxMark: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },

  // Tags Styles
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f4fd",
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: "#3498db",
    marginRight: 4,
  },
  tagRemove: {
    padding: 2,
  },
  tagRemoveText: {
    fontSize: 12,
    color: "#3498db",
  },

  // Buttons
  clearSelectionButton: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  clearSelectionText: {
    fontSize: 16,
    color: "#e74c3c",
  },
  doneButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: "#3498db",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  maxSelectionsHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
});

export default Select;
