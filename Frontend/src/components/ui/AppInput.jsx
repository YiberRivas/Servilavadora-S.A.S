import React from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { radii } from '../../theme';

export default function AppInput({ label, value, onChangeText, error, secureTextEntry, keyboardType, autoCapitalize, multiline, numberOfLines, disabled, placeholder, icon, onBlur }) {
  const { colors } = useTheme();

  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={!!error}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize || 'none'}
      multiline={multiline}
      numberOfLines={numberOfLines}
      disabled={disabled}
      placeholder={placeholder}
      left={icon ? <TextInput.Icon icon={icon} /> : undefined}
      onBlur={onBlur}
      mode="outlined"
      outlineColor={colors.outline}
      activeOutlineColor={colors.primary}
      style={{ backgroundColor: colors.surface }}
      outlineStyle={{ borderRadius: radii.md, borderWidth: 1.5 }}
      contentStyle={{ fontSize: 15 }}
    />
  );
}
