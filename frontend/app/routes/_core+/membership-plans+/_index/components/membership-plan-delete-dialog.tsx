import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

// 月額プラン削除の確認ダイアログ。
export function MembershipPlanDeleteDialog({ isOpen, onOpenChange, isPending, onConfirm }: Props) {
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
            プランを削除しますか？
          </Title>
        </Group>
        <Text size="sm">
          既存の契約には影響しませんが、この操作は元に戻せません。募集を止めるだけなら編集から「募集中」をオフにしてください。
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
