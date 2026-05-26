import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useFetcher, useRevalidator } from "react-router";

import type { clientLoader as areaEditLoader } from "~/routes/_core+/areas+/$areaId.edit/route";
import { AreaFormFields } from "~/routes/_core+/areas+/_index/components/area-form-fields";
import type { AreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { areaFormSchema, emptyAreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { useAreaEdit } from "~/routes/_core+/areas+/_index/hooks/useAreaEdit";

interface Props {
  areaId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// エリア編集モーダル。詳細取得、フォーム、更新処理を内包する。
export function AreaEditModal({ areaId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof areaEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);

  const form = useForm<AreaForm>({
    resolver: zodResolver(areaFormSchema),
    mode: "onSubmit",
    defaultValues: emptyAreaForm,
  });

  // オープン時に対象エリアを取得する。
  useEffect(() => {
    if (!isOpen || !areaId) {
      lastLoadedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === areaId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = areaId;
    fetcher.load(`/areas/${areaId}/edit`);
  }, [areaId, fetcher, fetcher.state, isOpen]);

  // 取得結果をフォームへ反映する。
  useEffect(() => {
    const area = fetcher.data?.area;
    if (!isOpen || !area) return;
    form.reset({
      name: area.name ?? "",
      dispOrder: area.dispOrder ?? undefined,
    });
  }, [fetcher.data, form, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useAreaEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<AreaForm> = (data) => {
    if (!areaId) return;
    editMutation.submit(data, [{ areaId }]);
  };

  const isPending = editMutation.state !== "idle" || fetcher.state !== "idle";

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset(emptyAreaForm);
      }}
    >
      <Modal.Container className="max-w-xl">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="flex items-center gap-2.5 text-xl">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gray-200/70">
                <PencilLine className="size-5 text-gray-700" />
              </span>
              <span>エリアを編集</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">必要な情報を入力して編集します。</p>
            <AreaFormFields form={form} />
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
