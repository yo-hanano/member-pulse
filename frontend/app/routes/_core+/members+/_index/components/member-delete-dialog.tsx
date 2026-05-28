import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

// 会員削除前の確認ダイアログ。
export function MemberDeleteDialog({ isOpen, isPending, onOpenChange, onConfirm }: Props) {
  return (
    <Modal
      centered
      opened={isOpen}
      title={
        <Group gap="sm">
          <ThemeIcon color="red" radius="sm" variant="light">
            <Trash2 size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            会員を削除
          </Title>
        </Group>
      }
      onClose={() => onOpenChange(false)}
    >
      <Stack gap="md">
        <Text size="sm">この会員を削除します。削除後は一覧に表示されません。</Text>
        <Group justify="flex-end">
          <Button disabled={isPending} variant="default" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button color="red" loading={isPending} onClick={onConfirm}>
            削除
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
