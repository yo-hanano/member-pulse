import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";

import { useMasterPrefectures } from "~/hooks/useMasterData";
import { BranchFormFields } from "~/routes/_core+/branches+/_index/components/branch-form-fields";
import type { BranchForm } from "~/routes/_core+/branches+/_index/branch-form-schema";
import { branchFormSchema, emptyBranchForm } from "~/routes/_core+/branches+/_index/branch-form-schema";
import { useBranchCreate } from "~/routes/_core+/branches+/_index/hooks/useBranchCreate";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 拠点作成モーダル。フォーム、master、保存処理を内包する。
export function BranchCreateModal({ isOpen, onOpenChange }: Props) {
  const { data: prefectures } = useMasterPrefectures();

  const form = useForm<BranchForm>({
    resolver: zodResolver(branchFormSchema),
    mode: "onSubmit",
    defaultValues: emptyBranchForm,
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.reset(emptyBranchForm);
  }, [form, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useBranchCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<BranchForm> = (data) => {
    createMutation.submit(data);
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyBranchForm);
      }}
    >
      <Modal.Container className="max-w-6xl" size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <Building2 className="size-5 text-gray-700" />
              </span>
              <span>拠点を作成</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">必要な情報を入力して作成します。完了したら保存をクリックしてください。</p>
            <BranchFormFields form={form} prefectures={prefectures ?? []} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button
              className="app-primary-button"
              isPending={createMutation.state !== "idle"}
              onPress={() => {
                void form.handleSubmit(onValid)();
              }}
            >
              保存
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
