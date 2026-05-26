import { Button, Card } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";

import { formatDateYmd } from "~/lib/date";
import { studentStatusLabel } from "~/routes/_core+/students+/_index/student-status";
import type { StudentDetailContext } from "~/routes/_core+/students+/$studentId/route";

// 生徒詳細の基本情報タブ。
export default function StudentDetailOverviewRoute() {
  const { student } = useOutletContext<StudentDetailContext>();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          className="border-border text-foreground hover:bg-default-100"
          variant="outline"
          onPress={() => navigate("/students")}
        >
          <ArrowLeft className="size-4" />
          一覧へ戻る
        </Button>
      </div>

      <Card className="border-border/60 bg-surface">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="生徒NO" value={student.code} />
          <DetailItem label="名前" value={student.name} />
          <DetailItem label="フリガナ" value={student.kana} />
          <DetailItem label="誕生日" value={formatDateYmd(student.birthday)} />
          <DetailItem label="性別" value={student.genderCode} />
          <DetailItem label="所属学校" value={student.schoolName} />
          <DetailItem label="学年" value={student.schoolGradeName} />
          <DetailItem label="在籍状態" value={studentStatusLabel(student.status)} />
          <DetailItem label="メモ" value={student.note} className="md:col-span-2 xl:col-span-3" />
        </div>
      </Card>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value?: string | null;
  className?: string;
}

// 詳細表示用のラベル付き値を描画する。
function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={["space-y-1", className].filter(Boolean).join(" ")}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium whitespace-pre-wrap">{value || "-"}</p>
    </div>
  );
}
