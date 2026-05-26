import { Button, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPinPlus } from "lucide-react";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRevalidator } from "react-router";

import { AreaFormFields } from "~/routes/_core+/areas+/_index/components/area-form-fields";
import type { AreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { areaFormSchema, emptyAreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { useAreaCreate } from "~/routes/_core+/areas+/_index/hooks/useAreaCreate";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// エリア作成モーダル。フォームと保存処理を内包する。
export function AreaCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<AreaForm>({
    resolver: zodResolver(areaFormSchema),
    mode: "onSubmit",
    defaultValues: emptyAreaForm,
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.reset(emptyAreaForm);
  }, [form, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useAreaCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  // 検証後に action hook へ送信する。
  const onValid: SubmitHandler<AreaForm> = (data) => {
    createMutation.submit(data);
  };

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
                <MapPinPlus className="size-5 text-gray-700" />
              </span>
              <span>エリアを作成</span>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted-foreground mb-3 text-sm">必要な情報を入力して作成します。</p>
            <AreaFormFields form={form} />
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
