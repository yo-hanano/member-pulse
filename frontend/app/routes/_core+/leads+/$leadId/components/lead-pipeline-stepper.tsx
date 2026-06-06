import { Badge, Group, Stepper, Text } from "@mantine/core";

import { formatDateTimeYmdHm } from "~/lib/date";
import {
  formatLeadStatus,
  type LeadStatus,
  leadStatusBadgeColor,
  leadStatusOptions,
} from "~/routes/_core+/leads+/_index/lead-status";
import type { LeadDetailContext } from "~/routes/_core+/leads+/$leadId/route";

// ファネル進行順のステップ定義。不通・キャンセル・不成約はファネル外なのでバッジで別表示する。
const offPipelineStatuses: LeadStatus[] = ["unreachable", "canceled", "lost"];
const pipelineSteps = leadStatusOptions.filter(
  (option) => !offPipelineStatuses.includes(option.value),
);

interface Props {
  lead: LeadDetailContext["lead"];
}

// リードがファネルのどこまで進んだかを示す表示専用ステッパー。ファネル外の状態はバッジで示す。
export function LeadPipelineStepper({ lead }: Props) {
  const status = (lead.status ?? "new") as LeadStatus;
  const isOffPipeline = offPipelineStatuses.includes(status);
  const currentIndex = pipelineSteps.findIndex((option) => option.value === status);
  // 入会済みは全ステップ完了として表示する。ファネル外の状態はどのステップも進行中にしない。
  const active = isOffPipeline ? -1 : status === "enrolled" ? pipelineSteps.length : currentIndex;

  return (
    <Group align="center" gap="md" wrap="wrap">
      <Stepper active={active} size="xs" style={{ flex: 1, minWidth: 320 }}>
        {pipelineSteps.map((option) => (
          <Stepper.Step key={option.value} allowStepClick={false} label={option.label} />
        ))}
      </Stepper>
      {isOffPipeline ? (
        <Group gap="xs">
          <Badge color={leadStatusBadgeColor(status)} radius="sm" variant="filled">
            {formatLeadStatus(status)}
          </Badge>
          {status === "lost" && lead.lostAt ? (
            <Text c="dimmed" size="xs">
              {formatDateTimeYmdHm(lead.lostAt)}
            </Text>
          ) : null}
        </Group>
      ) : null}
    </Group>
  );
}
