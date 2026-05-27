import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { MapPinPlus } from "lucide-react";
import { useRevalidator } from "react-router";

import { modalSizes } from "~/lib/modal-sizes";
import { LocationFormFields } from "~/routes/_core+/locations+/_index/components/location-form-fields";
import { useLocationCreate } from "~/routes/_core+/locations+/_index/hooks/useLocationCreate";
import type { LocationForm } from "~/routes/_core+/locations+/_index/location-form-schema";
import {
  emptyLocationForm,
  locationFormSchema,
} from "~/routes/_core+/locations+/_index/location-form-schema";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 拠点作成モーダル（フォームと送信処理を内包する）。
export function LocationCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<LocationForm>({
    mode: "uncontrolled",
    initialValues: emptyLocationForm,
    validate: schemaResolver(locationFormSchema, { sync: true }),
  });

  const revalidator = useRevalidator();
  const createMutation = useLocationCreate(() => {
    revalidator.revalidate();
    form.setValues(emptyLocationForm);
    onOpenChange(false);
  });
  const isPending = createMutation.submitting;

  const handleSubmit = form.onSubmit((data) => {
    createMutation.submit(data);
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size={modalSizes["2xl"]}
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <MapPinPlus size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            拠点を作成
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyLocationForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            店舗やスタジオなど、会員・見込み客に紐づく拠点を登録します。
          </Text>
          <LocationFormFields form={form} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button loading={isPending} type="submit">
              保存
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
