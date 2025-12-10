import React, {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const Input = forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      error,
      helperText,
      secureTextEntry = false,
      keyboardType = "default",
      autoCapitalize = "sentences",
      autoCorrect = true,
      editable = true,
      multiline = false,
      numberOfLines = 1,
      maxLength,
      leftIcon,
      rightIcon,
      onRightIconPress,
      style,
      inputStyle,
      labelStyle,
      containerStyle,
      required = false,
      showCharCount = false,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
      autoFocus = false,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);

    // Expose focus/blur methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      isFocused: () => inputRef.current?.isFocused(),
    }));

    const handleFocus = useCallback((e) => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback((e) => {
      setIsFocused(false);
    }, []);

    const getBorderColor = useCallback(() => {
      if (error) return "#e74c3c";
      if (isFocused) return "#3498db";
      return "#dcdcdc";
    }, [error, isFocused]);

    const togglePasswordVisibility = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    const handleChangeText = useCallback(
      (text) => {
        if (onChangeText) {
          onChangeText(text);
        }
      },
      [onChangeText],
    );

    const renderRightIcon = () => {
      if (secureTextEntry) {
        return (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.passwordToggle}>
              {showPassword ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        );
      }

      if (rightIcon) {
        return (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconContainer}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        );
      }

      return null;
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

        <View
          style={[
            styles.inputContainer,
            { borderColor: getBorderColor() },
            isFocused && styles.inputContainerFocused,
            !editable && styles.inputContainerDisabled,
            multiline && styles.inputContainerMultiline,
            style,
          ]}
        >
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
              !editable && styles.inputDisabled,
              inputStyle,
            ]}
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={editable}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            textAlignVertical={multiline ? "top" : "center"}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            autoFocus={autoFocus}
          />

          {renderRightIcon()}
        </View>

        <View style={styles.bottomContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {!error && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
          {showCharCount && maxLength && (
            <Text style={styles.charCount}>
              {value?.length || 0}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

Input.displayName = "Input";

// Number Input variant
export const NumberInput = forwardRef(
  ({ value, onChangeText, min, max, ...props }, ref) => {
    const handleChange = useCallback(
      (text) => {
        // Only allow numeric input
        const numericValue = text.replace(/[^0-9]/g, "");

        if (numericValue === "") {
          onChangeText("");
          return;
        }

        const num = parseInt(numericValue, 10);

        if (min !== undefined && num < min) {
          onChangeText(String(min));
          return;
        }

        if (max !== undefined && num > max) {
          onChangeText(String(max));
          return;
        }

        onChangeText(numericValue);
      },
      [onChangeText, min, max],
    );

    return (
      <Input
        ref={ref}
        {...props}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

// Email Input variant
export const EmailInput = forwardRef((props, ref) => {
  return (
    <Input
      ref={ref}
      {...props}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
});

EmailInput.displayName = "EmailInput";

// Password Input variant
export const PasswordInput = forwardRef((props, ref) => {
  return (
    <Input
      ref={ref}
      {...props}
      secureTextEntry={true}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
});

PasswordInput.displayName = "PasswordInput";

// Search Input variant
export const SearchInput = forwardRef(({ onClear, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      {...props}
      leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
      rightIcon={props.value ? <Text style={styles.clearIcon}>✕</Text> : null}
      onRightIconPress={onClear}
      autoCapitalize="none"
    />
  );
});

SearchInput.displayName = "SearchInput";

// TextArea variant
export const TextArea = forwardRef(({ numberOfLines = 4, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      {...props}
      multiline={true}
      numberOfLines={numberOfLines}
    />
  );
});

TextArea.displayName = "TextArea";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  inputContainerFocused: {
    borderWidth: 2,
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerDisabled: {
    backgroundColor: "#f5f5f5",
  },
  inputContainerMultiline: {
    minHeight: 100,
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  inputDisabled: {
    color: "#999",
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordToggle: {
    fontSize: 20,
  },
  searchIcon: {
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 14,
    color: "#999",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    minHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#e74c3c",
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
});

export default Input;
