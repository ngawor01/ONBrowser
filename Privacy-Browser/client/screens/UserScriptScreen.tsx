import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { HeaderButton } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors, Fonts } from "@/constants/theme";
import { getUserScripts, saveUserScripts, UserScript } from "@/lib/storage";

export default function UserScriptScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [scripts, setScripts] = useState<UserScript[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingScript, setEditingScript] = useState<UserScript | null>(null);
  const [scriptName, setScriptName] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [matchPattern, setMatchPattern] = useState("*");

  const loadScripts = useCallback(async () => {
    const loaded = await getUserScripts();
    setScripts(loaded);
  }, []);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton onPress={openAddModal}>
          <Feather name="plus" size={24} color={BrandColors.primary} />
        </HeaderButton>
      ),
    });
  }, [navigation]);

  const openAddModal = () => {
    setEditingScript(null);
    setScriptName("");
    setScriptCode("");
    setMatchPattern("*");
    setIsModalVisible(true);
  };

  const openEditModal = (script: UserScript) => {
    setEditingScript(script);
    setScriptName(script.name);
    setScriptCode(script.code);
    setMatchPattern(script.matchPattern);
    setIsModalVisible(true);
  };

  const saveScript = async () => {
    if (!scriptName.trim() || !scriptCode.trim()) return;

    let newScripts: UserScript[];
    if (editingScript) {
      newScripts = scripts.map((s) =>
        s.id === editingScript.id
          ? { ...s, name: scriptName, code: scriptCode, matchPattern }
          : s
      );
    } else {
      const newScript: UserScript = {
        id: Date.now().toString(),
        name: scriptName,
        code: scriptCode,
        matchPattern,
        enabled: true,
      };
      newScripts = [...scripts, newScript];
    }

    setScripts(newScripts);
    await saveUserScripts(newScripts);
    setIsModalVisible(false);
  };

  const toggleScript = async (scriptId: string, enabled: boolean) => {
    const newScripts = scripts.map((s) =>
      s.id === scriptId ? { ...s, enabled } : s
    );
    setScripts(newScripts);
    await saveUserScripts(newScripts);
  };

  const deleteScript = async (scriptId: string) => {
    const newScripts = scripts.filter((s) => s.id !== scriptId);
    setScripts(newScripts);
    await saveUserScripts(newScripts);
  };

  const renderScriptItem = ({ item }: { item: UserScript }) => (
    <View style={[styles.scriptItem, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.scriptHeader}>
        <View style={[styles.scriptIcon, { backgroundColor: item.enabled ? "#9C27B0" : theme.backgroundSecondary }]}>
          <Feather name="code" size={18} color={item.enabled ? "#FFFFFF" : theme.textSecondary} />
        </View>
        <View style={styles.scriptInfo}>
          <ThemedText type="body" style={styles.scriptName}>
            {item.name}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Match: {item.matchPattern}
          </ThemedText>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={(v) => toggleScript(item.id, v)}
          trackColor={{ false: theme.backgroundSecondary, true: "#9C27B0" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <View style={styles.scriptActions}>
        <Pressable
          onPress={() => openEditModal(item)}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="edit-2" size={16} color={theme.text} />
          <ThemedText type="caption">Edit</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => deleteScript(item.id)}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.error + "20", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="trash-2" size={16} color={theme.error} />
          <ThemedText type="caption" style={{ color: theme.error }}>
            Delete
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { borderColor: theme.textSecondary }]}>
        <Feather name="code" size={40} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Scripts Installed
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Add custom JavaScript to enhance your browsing experience
      </ThemedText>
      <Pressable
        onPress={openAddModal}
        style={({ pressed }) => [
          styles.addScriptButton,
          { backgroundColor: BrandColors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <ThemedText style={styles.addScriptText}>Add Script</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={scripts}
        keyExtractor={(item) => item.id}
        renderItem={renderScriptItem}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xl },
          scripts.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">
                {editingScript ? "Edit Script" : "Add Script"}
              </ThemedText>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                hitSlop={8}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <KeyboardAwareScrollViewCompat
              contentContainerStyle={styles.modalForm}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                  Script Name
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                  value={scriptName}
                  onChangeText={setScriptName}
                  placeholder="My Script"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                  Match Pattern
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                  value={matchPattern}
                  onChangeText={setMatchPattern}
                  placeholder="* (all sites) or *.example.com"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                  JavaScript Code
                </ThemedText>
                <TextInput
                  style={[
                    styles.codeInput,
                    { backgroundColor: theme.backgroundDefault, color: theme.text, fontFamily: Fonts?.mono },
                  ]}
                  value={scriptCode}
                  onChangeText={setScriptCode}
                  placeholder="// Your JavaScript code here"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                onPress={saveScript}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: BrandColors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText style={styles.saveButtonText}>
                  {editingScript ? "Save Changes" : "Add Script"}
                </ThemedText>
              </Pressable>
            </KeyboardAwareScrollViewCompat>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  scriptItem: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  scriptHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  scriptIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  scriptInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  scriptName: {
    fontWeight: "600",
  },
  scriptActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  addScriptButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  addScriptText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  modalForm: {
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  codeInput: {
    height: 200,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
