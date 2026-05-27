import { Button, Group, Loader, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { PencilLine } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFetcher, useRevalidator } from "react-router";
import { EmployeeFormFields } from "~/routes/_core+/employees+/_index/components/employee-form-fields";
import type { EmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";
import {
  employeeFormSchema,
  emptyEmployeeForm,
} from "~/routes/_core+/employees+/_index/employee-form-schema";
import { useEmployeeEdit } from "~/routes/_core+/employees+/_index/hooks/useEmployeeEdit";
import type { clientLoader as employeeEditLoader } from "~/routes/_core+/employees+/$employeeId.edit/route";

interface Props {
  employeeId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 従業員編集モーダル（詳細取得、フォーム、送信処理を内包する）。
export function EmployeeEditModal({ employeeId, isOpen, onOpenChange }: Props) {
  const fetcher = useFetcher<typeof employeeEditLoader>();
  const lastLoadedIdRef = useRef<string | null>(null);
  const lastAppliedIdRef = useRef<string | null>(null);
  const isLoading = fetcher.state !== "idle";

  const form = useForm<EmployeeForm>({
    mode: "uncontrolled",
    initialValues: emptyEmployeeForm,
    validate: schemaResolver(employeeFormSchema, { sync: true }),
  });

  useEffect(() => {
    if (!isOpen || !employeeId) {
      lastLoadedIdRef.current = null;
      lastAppliedIdRef.current = null;
      return;
    }
    if (lastLoadedIdRef.current === employeeId) return;
    if (fetcher.state !== "idle") return;
    lastLoadedIdRef.current = employeeId;
    fetcher.load(`/employees/${employeeId}/edit`);
  }, [employeeId, fetcher, fetcher.state, isOpen]);

  useEffect(() => {
    const employee = fetcher.data?.employee;
    const loadedEmployeeId = employee?.id ? String(employee.id) : null;
    if (!isOpen || !employee || !loadedEmployeeId) return;
    if (lastAppliedIdRef.current === loadedEmployeeId) return;

    // 取得した従業員が変わった時だけフォームへ反映し、setValues の再レンダーループを避ける。
    lastAppliedIdRef.current = loadedEmployeeId;
    form.setValues({
      name: employee.name ?? "",
      email: employee.email ?? "",
      genderCode: employee.genderCode ?? "not_specified",
      isAdmin: employee.isAdmin ?? false,
    });
  }, [fetcher.data?.employee, form.setValues, isOpen]);

  const revalidator = useRevalidator();
  const editMutation = useEmployeeEdit(() => {
    revalidator.revalidate();
    onOpenChange(false);
  });
  const isPending = editMutation.submitting || isLoading;

  const handleSubmit = form.onSubmit((data) => {
    if (!employeeId) return;
    editMutation.submit(data, [{ employeeId }]);
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
            従業員を編集
          </Title>
        </Group>
      }
      onClose={() => {
        onOpenChange(false);
        form.setValues(emptyEmployeeForm);
      }}
    >
      <form noValidate onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            必要な情報を入力して編集します。完了したら保存をクリックしてください。
          </Text>
          {isLoading && !fetcher.data?.employee ? (
            <Group justify="center" py="xl">
              <Loader size="sm" />
            </Group>
          ) : (
            <EmployeeFormFields form={form} />
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
