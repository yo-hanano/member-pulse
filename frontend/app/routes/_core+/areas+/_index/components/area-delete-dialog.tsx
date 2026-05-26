import { AlertDialog, Button } from "@heroui/react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

// エリア削除の確認ダイアログ（警告表示と削除実行操作を担当）
export function AreaDeleteDialog({ isOpen, onOpenChange, isPending, onConfirm }: Props) {
  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header className="flex flex-row items-center gap-3">
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>エリアを削除しますか？</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>この操作は元に戻せません。問題なければ削除を実行してください。</AlertDialog.Body>
          <AlertDialog.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button className="app-primary-button" isPending={isPending} onPress={onConfirm}>
              削除する
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
