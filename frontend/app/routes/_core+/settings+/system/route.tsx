import {
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { Monitor, Moon, Settings, Sun } from "lucide-react";

type ColorSchemeValue = "auto" | "light" | "dark";

const colorSchemeOptions = [
  {
    value: "auto",
    label: "自動",
    description: "端末やブラウザの設定に合わせます。",
    icon: Monitor,
  },
  {
    value: "light",
    label: "ライト",
    description: "明るい配色で固定します。",
    icon: Sun,
  },
  {
    value: "dark",
    label: "ダーク",
    description: "暗い配色で固定します。",
    icon: Moon,
  },
] as const;

export function meta() {
  return [{ title: "システム設定" }, { name: "description", content: "システム設定" }];
}

// システム設定は、端末ごとの差が出やすい表示設定をユーザー単位で切り替える画面。
export default function SystemSettingsRoute() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const selectedScheme = colorScheme as ColorSchemeValue;
  const selectedOption = colorSchemeOptions.find((option) => option.value === selectedScheme);

  const handleColorSchemeChange = (value: string) => {
    // Mantine の color scheme manager に保存し、次回表示にも反映する。
    setColorScheme(value as ColorSchemeValue);
  };

  return (
    <Stack maw={860} gap="lg">
      <Stack gap={4}>
        <Group gap="sm">
          <ThemeIcon color="teal" radius="sm" variant="light">
            <Settings size={18} />
          </ThemeIcon>
          <Title order={1}>システム設定</Title>
        </Group>
        <Text c="dimmed" size="sm">
          画面表示や操作感に関わる設定を変更できます。
        </Text>
      </Stack>

      <Paper className="app-dashboard-surface" p="lg" radius="sm" shadow="xs" withBorder>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Title order={2} size="h4">
                表示モード
              </Title>
              <Text c="dimmed" size="sm">
                ライト、ダーク、端末設定に合わせる自動切替を選べます。
              </Text>
            </Stack>
            <Badge color="teal" radius="sm" variant="light">
              {selectedOption?.label ?? "自動"}
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {colorSchemeOptions.map((option) => {
              const Icon = option.icon;
              const active = option.value === selectedScheme;
              return (
                <Paper
                  className="app-dashboard-surface"
                  component="button"
                  key={option.value}
                  onClick={() => handleColorSchemeChange(option.value)}
                  p="md"
                  radius="sm"
                  style={{ cursor: "pointer", textAlign: "left" }}
                  withBorder
                  bd={active ? "1px solid teal" : undefined}
                >
                  <Stack gap="sm">
                    <Group gap="sm" justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <ThemeIcon color={active ? "teal" : "gray"} radius="sm" variant="light">
                          <Icon size={18} />
                        </ThemeIcon>
                        <Text fw={700}>{option.label}</Text>
                      </Group>
                      {active ? (
                        <Badge color="teal" radius="sm" variant="light">
                          選択中
                        </Badge>
                      ) : null}
                    </Group>
                    <Text c="dimmed" size="sm">
                      {option.description}
                    </Text>
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  );
}
