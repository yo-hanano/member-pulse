import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";

import { useMasterPrefectures } from "~/hooks/useMasterData";
import type { clientLoader as branchEditLoader } from "~/routes/_core+/branches+/$branchId.edit/route";
import { BranchFormFields } from "~/routes/_core+/branches+/_index/components/branch-form-fields";
import type { BranchForm } from "~/routes/_core+/branches+/_index/branch-form-schema";
import { branchFormSchema, emptyBranchForm } from "~/routes/_core+/branches+/_index/branch-form-schema";
import { useBranchEdit } from "~/routes/_core+/branches+/_index/hooks/useBranchEdit";

interface Props {
  branchId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 拠点編集モーダル。詳細取得、master、フォーム、更新処理を内包する。
export function BranchEditModal({ branchId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof branchEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const { data: prefectures } = useMasterPrefectures();

  const form = useForm<BranchForm>({
    resolver: zodResolver(branchFormSchema),
    mode: "onSubmit",
    defaultValues: emptyBranchForm,
  });

  // オープン時に対象拠点を取得する。
  useEffect(() => {
    if (!isOpen || !branchId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === branchId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = branchId;
    fetcher.load(`/branches/${branchId}/edit`);
  }, [branchId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const branch = fetcher.data?.branch;
    if (!isOpen || !branch) return;
    form.reset({
      areaId: branch.areaId ?? "",
      code: branch.code ?? "",
      name: branch.name ?? "",
      zipCode: branch.zipCode ?? "",
      prefectureCode: branch.prefectureCode ?? "",
      address: branch.address ?? "",
    });
  }, [fetcher.data, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useBranchEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<BranchForm> = (data) => {
    if (!branchId) return;
    editMutation.submit(data, [{ branchId }]);
  };

  const isPending = editMutation.state !== "idle" || fetcher.state !== "idle";

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
                <Building className="size-5 text-gray-700" />
              </span>
              <span>拠点を編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">必要な情報を入力して編集します。完了したら更新をクリックしてください。</p>
            <BranchFormFields form={form} prefectures={prefectures ?? []} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="border-border text-foreground hover:bg-default-100" slot="close" variant="outline">
              キャンセル
            </Button>
            <Button
              className="app-primary-button"
              isPending={isPending}
              onPress={() => {
                void form.handleSubmit(onValid)();
              }}
            >
              更新
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
