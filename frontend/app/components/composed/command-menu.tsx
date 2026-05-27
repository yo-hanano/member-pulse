import { Badge, Group, Modal, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { ArrowRight, Search } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useSearch } from "~/context/search-context";
import { useTheme } from "~/context/theme-context";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  action: () => void;
};

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const commandItems = useMemo<CommandItem[]>(
    () => [
      {
        id: "/",
        label: "ダッシュボード",
        description: "概要と主要な指標を確認",
        keywords: ["home", "overview", "top", "ダッシュボード", "ホーム"],
        action: () => navigate("/"),
      },
      {
        id: "/leads",
        label: "リード",
        description: "リード一覧と対応状況を確認",
        keywords: ["lead", "inquiry", "リード", "contact"],
        action: () => navigate("/leads"),
      },
      {
        id: "/employees",
        label: "従業員",
        description: "従業員一覧と権限を確認",
        keywords: ["staff", "member", "admin", "従業員", "employee"],
        action: () => navigate("/employees"),
      },
      {
        id: "theme:light",
        label: "Light Theme",
        description: "明るい配色に切り替え",
        keywords: ["theme", "light", "appearance", "テーマ", "ライト"],
        action: () => setTheme("light"),
      },
      {
        id: "theme:dark",
        label: "Dark Theme",
        description: "暗い配色に切り替え",
        keywords: ["theme", "dark", "appearance", "テーマ", "ダーク"],
        action: () => setTheme("dark"),
      },
      {
        id: "theme:system",
        label: "System Theme",
        description: "OS 設定に追従",
        keywords: ["theme", "system", "appearance", "テーマ", "システム"],
        action: () => setTheme("system"),
      },
    ],
    [navigate, setTheme],
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredItems = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return commandItems;

    return commandItems.filter((item) => {
      const target = `${item.label} ${item.description} ${item.keywords.join(" ")}`.toLowerCase();
      return target.includes(q);
    });
  }, [commandItems, deferredQuery]);

  const handleAction = (item: CommandItem) => {
    setOpen(false);
    item.action();
  };

  return (
    <Modal
      opened={open}
      onClose={() => setOpen(false)}
      padding={0}
      size={640}
      title={null}
      withCloseButton={false}
      yOffset="8vh"
    >
      <Stack gap={0}>
        <div className="p-3">
          <TextInput
            autoFocus
            leftSection={<Search size={16} />}
            placeholder="コマンドまたはキーワードで検索..."
            value={query}
            onChange={(event) => {
              const value = event.currentTarget.value;
              startTransition(() => setQuery(value));
            }}
          />
        </div>
        <Stack className="max-h-80 overflow-auto border-t" gap={0} p="xs">
          {filteredItems.length === 0 ? (
            <Text c="dimmed" p="sm" size="sm">
              該当する項目がありません。
            </Text>
          ) : (
            filteredItems.map((item) => (
              <UnstyledButton key={item.id} p="sm" onClick={() => handleAction(item)}>
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={600} size="sm">
                        {item.label}
                      </Text>
                      {item.id === `theme:${theme}` ? (
                        <Badge size="sm" variant="light">
                          Active
                        </Badge>
                      ) : null}
                    </Group>
                    <Text c="dimmed" size="xs">
                      {item.description}
                    </Text>
                  </Stack>
                  <ArrowRight size={16} />
                </Group>
              </UnstyledButton>
            ))
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
