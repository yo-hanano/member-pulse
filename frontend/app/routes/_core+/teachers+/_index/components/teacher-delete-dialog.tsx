import { Button, Modal } from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onConfirm: () => void;
}

// 講師削除の確認ダイアログを表示する。
export function TeacherDeleteDialog({ isOpen, onOpenChange, isPending, onConfirm }: Props) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2 text-lg">
              <AlertTriangle className="size-5 text-danger" />
              <span>講師を削除</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-muted-foreground">この操作は講師を論理削除します。続行しますか？</p>
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button className="bg-danger text-white" isPending={isPending} onPress={onConfirm}>
              削除
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
