import { Button, Group, Loader, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFetcher, useRevalidator } from "react-router";
import type { AreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { areaFormSchema, emptyAreaForm } from "~/routes/_core+/areas+/_index/area-form-schema";
import { AreaFormFields } from "~/routes/_core+/areas+/_index/components/area-form-fields";
import { useAreaEdit } from "~/routes/_core+/areas+/_index/hooks/useAreaEdit";
import type { clientLoader as areaEditLoader } from "~/routes/_core+/areas+/$areaId.edit/route";

interface Props {
  areaId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// エリア編集モーダル。詳細取得、フォーム、更新処理を内包する。
export function AreaEditModal({ areaId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof areaEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const lastAppliedIdRef = useRef<string | null>(null);

  const form = useForm<AreaForm>({
    mode: "uncontrolled",
    initialValues: emptyAreaForm,
    validate: schemaResolver(areaFormSchema, { sync: true }),
  });

  // オープン時に対象エリアを取得する。
  useEffect(() => {
    if (!isOpen || !areaId) {
      lastLoadedIdRef.current = null;
      lastAppliedIdRef.current = null;
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
    const loadedAreaId = area?.id ? String(area.id) : null;
    if (!isOpen || !area || !loadedAreaId) return;
    if (lastAppliedIdRef.current === loadedAreaId) return;

    lastAppliedIdRef.current = loadedAreaId;
    form.setValues({
      name: area.name ?? "",
      dispOrder: area.dispOrder ?? undefined,
    });
  }, [fetcher.data?.area, form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useAreaEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });

  const handleSubmit = form.onSubmit((data) => {
    if (!areaId) return;
    editMutation.submit(data, [{ areaId }]);
  });

  const isPending = editMutation.state !== "idle" || fetcher.state !== "idle";

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
            エリアを編集
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
            必要な情報を入力して編集します。
          </Text>
          {fetcher.state !== "idle" && !fetcher.data?.area ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <AreaFormFields form={form} />
          )}
          <Group justify="flex-end" mt="sm">
            <Button disabled={isPending} variant="default" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button loading={isPending} type="submit">
              更新
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
