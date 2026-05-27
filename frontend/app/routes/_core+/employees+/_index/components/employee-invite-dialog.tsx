import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Mail } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | null;
  isPending: boolean;
  onConfirm: () => void;
}

// パスワード設定リンク送信の確認ダイアログ。
export function EmployeeInviteDialog({ isOpen, onOpenChange, email, isPending, onConfirm }: Props) {
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
          <ThemeIcon color="yellow" radius="sm" variant="light">
            <Mail size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            招待メールを送信しますか？
          </Title>
        </Group>
        <Stack gap={4}>
          <Text size="sm">対象: {email ?? "-"}</Text>
          <Text c="dimmed" size="sm">
            パスワード設定用のリンクを再送します。
          </Text>
        </Stack>
        <Group justify="flex-end">
          <Button disabled={isPending} variant="default" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button loading={isPending} onClick={onConfirm}>
            送信する
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
