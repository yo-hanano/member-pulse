import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { MapPinPlus } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";
import type { AreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { areaFormSchema, emptyAreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { AreaFormFields } from "~/routes/_core+/areas+/_index/components/area-form-fields";
import { useAreaCreate } from "~/routes/_core+/areas+/_index/hooks/useAreaCreate";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// エリア作成モーダル。フォームと保存処理を内包する。
export function AreaCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<AreaForm>({
    mode: "uncontrolled",
    initialValues: emptyAreaForm,
    validate: schemaResolver(areaFormSchema, { sync: true }),
  });

  // オープン時は初期値を反映する。
  useEffect(() => {
    if (isOpen) form.setValues(emptyAreaForm);
  }, [form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const createMutation = useAreaCreate(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  const handleSubmit = form.onSubmit((data) => {
    createMutation.submit(data);
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size="lg"
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <MapPinPlus size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            エリアを作成
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyAreaForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            必要な情報を入力して作成します。
          </Text>
          <AreaFormFields form={form} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button loading={createMutation.state !== "idle"} type="submit">
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
