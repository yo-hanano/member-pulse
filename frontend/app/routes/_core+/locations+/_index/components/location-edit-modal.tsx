import { Button, Group, Loader, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFetcher, useRevalidator } from "react-router";

import { LocationFormFields } from "~/routes/_core+/locations+/_index/components/location-form-fields";
import type { LocationForm } from "~/routes/_core+/locations+/_index/location-form-schema";
import {
  emptyLocationForm,
  locationFormSchema,
} from "~/routes/_core+/locations+/_index/location-form-schema";
import { useLocationEdit } from "~/routes/_core+/locations+/_index/hooks/useLocationEdit";
import type { clientLoader as locationEditLoader } from "~/routes/_core+/locations+/$locationId.edit/route";

interface Props {
  locationId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 拠点編集モーダル（詳細取得、フォーム、送信処理を内包する）。
export function LocationEditModal({ locationId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof locationEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const lastAppliedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<LocationForm>({
    mode: "uncontrolled",
    initialValues: emptyLocationForm,
    validate: schemaResolver(locationFormSchema, { sync: true }),
  });

  useEffect(() => {
    if (!isOpen || !locationId) {
      lastLoadedIdRef.current = null;
      lastAppliedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === locationId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = locationId;
    fetcher.load(`/locations/${locationId}/edit`);
  }, [locationId, fetcher, fetcher.state, isOpen]);

  useEffect(() => {
    const location = fetcher.data?.location;
    const loadedLocationId = location?.id ? String(location.id) : null;
    if (!isOpen || !location || !loadedLocationId) return;
    if (lastAppliedIdRef.current === loadedLocationId) return;

    // 取得した拠点が変わった時だけフォームへ反映し、setValues の再レンダーループを避ける。
    lastAppliedIdRef.current = loadedLocationId;
    form.setValues({
      areaId: location.areaId ?? "",
      name: location.name ?? "",
      zipCode: location.zipCode ?? "",
      prefectureCode: location.prefectureCode ?? "",
      address: location.address ?? "",
      isDefault: location.isDefault ?? false,
    });
  }, [fetcher.data?.location, form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useLocationEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });
  const isPending = editMutation.submitting || isLoading;
  const isDefaultLocation = Boolean(fetcher.data?.location?.isDefault);

  const handleSubmit = form.onSubmit((data) => {
    if (!locationId) return;
    editMutation.submit(data, [{ locationId }]);
  });

  return (
    <Modal
      centered
      opened={isOpen}
      size="lg"
      title={
        <Group gap="sm">
          <ThemeIcon color="brand" radius="sm" variant="light">
            <PencilLine size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            拠点を編集
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
            拠点名、所属エリア、所在地を編集します。
          </Text>
          {isLoading && !fetcher.data?.location ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <LocationFormFields form={form} lockDefaultOff={isDefaultLocation} />
          )}
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
