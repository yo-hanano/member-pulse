import { AlertDialog, Button } from "@heroui/react";

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
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header className="flex flex-row items-center gap-3">
            <AlertDialog.Icon status="warning" />
            <AlertDialog.Heading>招待メールを送信しますか？</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p className="text-sm">対象: {email ?? "-"}</p>
            <p className="text-muted-foreground mt-2 text-sm">パスワード設定用のリンクを再送します。</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button className="app-primary-button" isPending={isPending} onPress={onConfirm}>
              送信する
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
