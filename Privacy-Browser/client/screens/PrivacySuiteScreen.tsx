import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import {
  getPrivacySettings,
  savePrivacySettings,
  PrivacySettings,
  DEFAULT_PRIVACY_SETTINGS,
  getRandomUserAgent,
} from "@/lib/storage";

interface PrivacyToggleProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  icon: keyof typeof Feather.glyphMap;
}

function PrivacyToggle({ title, description, value, onToggle, icon }: PrivacyToggleProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onToggle(!value)}
      style={[styles.toggleItem, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.toggleIcon, { backgroundColor: value ? BrandColors.secondary : theme.backgroundSecondary }]}>
        <Feather name={icon} size={20} color={value ? "#FFFFFF" : theme.textSecondary} />
      </View>
      <View style={styles.toggleContent}>
        <ThemedText type="body" style={styles.toggleTitle}>
          {title}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {description}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.backgroundSecondary, true: BrandColors.secondary }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}

export default function PrivacySuiteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);

  const loadSettings = useCallback(async () => {
    const loaded = await getPrivacySettings();
    setSettings(loaded);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    let newSettings = { ...settings, [key]: value };
    
    if (key === "randomUserAgent" && value) {
      newSettings.currentUserAgent = getRandomUserAgent();
    }
    
    setSettings(newSettings);
    await savePrivacySettings(newSettings);
  };

  const rotateUserAgent = async () => {
    const newSettings = {
      ...settings,
      currentUserAgent: getRandomUserAgent(),
    };
    setSettings(newSettings);
    await savePrivacySettings(newSettings);
  };

  const activeCount = Object.entries(settings).filter(
    ([key, value]) => key !== "currentUserAgent" && value === true
  ).length;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusCard, { backgroundColor: BrandColors.primary + "15" }]}>
          <View style={[styles.statusIcon, { backgroundColor: BrandColors.secondary }]}>
            <Feather name="shield" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.statusContent}>
            <ThemedText type="h4">{activeCount} Protections Active</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Your browsing is protected
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            FINGERPRINT PROTECTION
          </ThemedText>

          <PrivacyToggle
            title="Canvas Fingerprint Protection"
            description="Randomizes canvas data to prevent tracking"
            value={settings.canvasProtection}
            onToggle={(v) => updateSetting("canvasProtection", v)}
            icon="image"
          />

          <PrivacyToggle
            title="WebGL Spoofing"
            description="Masks your GPU information"
            value={settings.webglSpoofing}
            onToggle={(v) => updateSetting("webglSpoofing", v)}
            icon="box"
          />

          <PrivacyToggle
            title="Font Fingerprint Blocking"
            description="Prevents font enumeration tracking"
            value={settings.fontBlocking}
            onToggle={(v) => updateSetting("fontBlocking", v)}
            icon="type"
          />

          <PrivacyToggle
            title="Audio Context Protection"
            description="Adds noise to audio fingerprinting"
            value={settings.audioProtection}
            onToggle={(v) => updateSetting("audioProtection", v)}
            icon="volume-2"
          />

          <PrivacyToggle
            title="Resolution Spoofing"
            description="Reports standard screen dimensions"
            value={settings.resolutionSpoofing}
            onToggle={(v) => updateSetting("resolutionSpoofing", v)}
            icon="monitor"
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            NETWORK PRIVACY
          </ThemedText>

          <PrivacyToggle
            title="WebRTC Complete Blocking"
            description="Prevents IP address leaks via WebRTC"
            value={settings.webrtcBlocking}
            onToggle={(v) => updateSetting("webrtcBlocking", v)}
            icon="wifi-off"
          />

          <PrivacyToggle
            title="Anti Proxy Detection"
            description="Hides automation and proxy indicators"
            value={settings.antiProxyDetection}
            onToggle={(v) => updateSetting("antiProxyDetection", v)}
            icon="eye-off"
          />

          <PrivacyToggle
            title="Smart Timezone"
            description="Automatically detects timezone from location"
            value={settings.smartTimezone}
            onToggle={(v) => updateSetting("smartTimezone", v)}
            icon="clock"
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            USER AGENT
          </ThemedText>

          <PrivacyToggle
            title="Random User Agent"
            description="Changes browser identity on each session"
            value={settings.randomUserAgent}
            onToggle={(v) => updateSetting("randomUserAgent", v)}
            icon="shuffle"
          />

          {settings.randomUserAgent ? (
            <View style={[styles.userAgentCard, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="caption" style={[styles.userAgentLabel, { color: theme.textSecondary }]}>
                Current User Agent:
              </ThemedText>
              <ThemedText type="caption" numberOfLines={3} style={{ color: theme.text }}>
                {settings.currentUserAgent || "Not set"}
              </ThemedText>
              <Pressable
                onPress={rotateUserAgent}
                style={({ pressed }) => [
                  styles.rotateButton,
                  { backgroundColor: BrandColors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Feather name="refresh-cw" size={16} color="#FFFFFF" />
                <ThemedText style={styles.rotateButtonText}>Rotate Now</ThemedText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statusContent: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontWeight: "500",
    marginBottom: 2,
  },
  userAgentCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  userAgentLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  rotateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  rotateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
