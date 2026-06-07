import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

// 売上明細削除の確認ダイアログ。
export function RevenueRecordDeleteDialog({ isOpen, onOpenChange, isPending, onConfirm }: Props) {
  return (
    <Modal
      centered
      opened={isOpen}
      size="md"
      withCloseButton={false}
      onClose={() => onOpenChange(false)}
    >
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon color="red" radius="sm" variant="light">
            <AlertTriangle size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            売上を削除しますか？
          </Title>
        </Group>
        <Text size="sm">
          削除した売上はサマリの集計から除外されます。自動生成された月謝を削除した場合、「月謝を生成」を再実行すると再作成されます。
        </Text>
        <Group justify="flex-end">
          <Button disabled={isPending} variant="default" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button color="red" loading={isPending} onClick={onConfirm}>
            削除する
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
