import { Button, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { UserPlus2 } from "lucide-react";
import { useRevalidator } from "react-router";

import { modalSizes } from "~/lib/modal-sizes";
import { EmployeeFormFields } from "~/routes/_core+/employees+/_index/components/employee-form-fields";
import type { EmployeeForm } from "~/routes/_core+/employees+/_index/employee-form-schema";
import {
  employeeFormSchema,
  emptyEmployeeForm,
} from "~/routes/_core+/employees+/_index/employee-form-schema";
import { useEmployeeCreate } from "~/routes/_core+/employees+/_index/hooks/useEmployeeCreate";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// 従業員作成モーダル（フォームと送信処理を内包する）。
export function EmployeeCreateModal({ isOpen, onOpenChange }: Props) {
  const form = useForm<EmployeeForm>({
    mode: "uncontrolled",
    initialValues: emptyEmployeeForm,
    validate: schemaResolver(employeeFormSchema, { sync: true }),
  });

  const revalidator = useRevalidator();
  const createMutation = useEmployeeCreate(() => {
    revalidator.revalidate();
    form.setValues(emptyEmployeeForm);
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
            <UserPlus2 size={18} />
          </ThemeIcon>
          <Title order={3} size="h4">
            従業員を作成
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
            必要な情報を入力して作成します。完了したら保存をクリックしてください。
          </Text>
          <EmployeeFormFields form={form} />
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
