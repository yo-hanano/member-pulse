import { ActionIcon, Menu } from "@mantine/core";
import { Check, Laptop, Moon, Sun } from "lucide-react";

import { type Theme, useTheme } from "~/context/theme-context";

const themeOptions: {
  icon: typeof Sun;
  key: Theme;
  label: string;
}[] = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Laptop },
];

export function ThemeSwitch() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <Menu position="bottom-end" shadow="md" width={180}>
      <Menu.Target>
        <ActionIcon aria-label="テーマ切替" variant="default">
          <CurrentIcon size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Menu.Item
              key={option.key}
              leftSection={<Icon size={16} />}
              rightSection={theme === option.key ? <Check size={16} /> : null}
              onClick={() => setTheme(option.key)}
            >
              {option.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
