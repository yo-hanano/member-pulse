import { Button, Group, Paper, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import type { ChangeEvent } from "react";

interface Props {
  name: string | null;
  onFilterChange: (updates: Record<string, string | null>) => void;
}

// エリア一覧のフィルタ入力UIを表示し、変更内容を親へ通知する
export function AreaFiltersPanel({ name, onFilterChange }: Props) {
  return (
    <Paper p="md" radius="sm" shadow="xs" withBorder>
      <Group align="flex-end" gap="sm">
        <TextInput
          label="エリア名"
          placeholder="エリア名"
          value={name ?? ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onFilterChange({ name: event.target.value || null, page: "1" })
          }
        />
        <Button
          leftSection={<X size={16} />}
          variant="light"
          onClick={() => {
            onFilterChange({
              name: null,
              page: "1",
            });
          }}
        >
          条件をクリア
        </Button>
      </Group>
    </Paper>
  );
}
