import { Dropdown, Label } from "@heroui/react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "~/context/theme-context";

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
    <Dropdown>
      <Dropdown.Trigger
        aria-label="テーマ切替"
        className="flex size-8 shrink-0 items-center justify-center rounded-medium border border-border/60 bg-default-100 text-foreground shadow-none transition-colors hover:bg-default-200"
      >
        <span aria-hidden="true" className="flex items-center justify-center">
          <CurrentIcon className="size-4" />
        </span>
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-[180px]">
        <Dropdown.Menu
          aria-label="テーマ選択"
          selectedKeys={[theme]}
          selectionMode="single"
          onAction={(key) => setTheme(String(key) as Theme)}
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Dropdown.Item className="text-foreground" id={option.key} key={option.key} textValue={option.label}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <Label>{option.label}</Label>
                  </div>
                  {theme === option.key ? <Check className="size-4 text-foreground/70" /> : null}
                </div>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
