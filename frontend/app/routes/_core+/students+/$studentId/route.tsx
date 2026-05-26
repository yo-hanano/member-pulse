import { Breadcrumbs, Tabs } from "@heroui/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router";

import { getSdk, type StudentFormInitialFragment, type StudentInput } from "~/generated/graphql";
import type { StudentForm } from "~/routes/_core+/students+/_index/student-form-schema";
import { getGraphQLClient } from "~/services/graphql-client";

export type StudentDetailContext = {
  student: StudentFormInitialFragment;
};

// 生徒詳細配下のタブで共有する生徒詳細を取得する。
export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const { studentById } = await sdk.studentById({ studentId });
  if (!studentById) {
    throw new Response("student not found", { status: 404 });
  }

  return { student: studentById };
};

// 生徒詳細配下から、生徒基本情報または主保護者情報の更新を実行する。
export const clientAction = async ({ params, request }: ActionFunctionArgs) => {
  const studentId = params.studentId;
  if (!studentId) {
    throw new Response("studentId is required", { status: 400 });
  }

  const client = getGraphQLClient();
  const sdk = getSdk(client);
  const input = (await request.json()) as StudentForm;
  const { updateStudent } = await sdk.updateStudent({ studentId, input: toStudentInput(input) });

  return {
    message: updateStudent ? "ok" : "ng",
    student: updateStudent ?? undefined,
    notify: updateStudent
      ? { type: "success" as const, message: "生徒の関連情報を更新しました" }
      : { type: "error" as const, message: "更新に失敗しました" },
  };
};

// フォーム値を GraphQL の StudentInput へ変換する。
function toStudentInput(input: StudentForm): StudentInput {
  return {
    code: input.code,
    name: input.name,
    kana: input.kana,
    birthday: input.birthday,
    genderCode: input.genderCode,
    branchId: input.branchId,
    schoolCode: input.schoolCode,
    schoolGradeCode: input.schoolGradeCode,
    status: input.status,
    note: input.note || undefined,
    guardian: {
      id: input.guardian.id || undefined,
      name: input.guardian.name,
      kana: input.guardian.kana,
      relationshipCode: input.guardian.relationshipCode,
      prefectureCode: input.guardian.prefectureCode,
      phone: input.guardian.phone,
      email: input.guardian.email || undefined,
      postalCode: input.guardian.postalCode,
      address: input.guardian.address,
      note: input.guardian.note || undefined,
    },
  };
}

export function meta() {
  return [{ title: "生徒詳細" }, { name: "description", content: "生徒詳細、関連情報" }];
}

// 生徒詳細レイアウト。リード詳細と同じようにタブと子ルートをまとめる。
export default function StudentDetailRoute() {
  const { student } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.endsWith("/guardians")
    ? "guardians"
    : location.pathname.endsWith("/billing-contacts")
      ? "billingContacts"
      : location.pathname.endsWith("/courses")
        ? "courses"
        : "overview";
  const basePath = `/students/${student.id}`;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Breadcrumbs className="text-sm text-muted-foreground">
          <Breadcrumbs.Item href="/">ホーム</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/students">生徒</Breadcrumbs.Item>
          <Breadcrumbs.Item className="text-foreground">
            {student.name ?? "生徒関連情報"}
          </Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {student.name ?? "生徒関連情報"}
            </h1>
            <p className="text-muted-foreground mt-1 text-xs">生徒の関連情報を管理します。</p>
          </div>
        </div>

        <Tabs
          className="w-full"
          selectedKey={selectedKey}
          variant="secondary"
          onSelectionChange={(key) => {
            if (key === "overview") {
              navigate(basePath);
            } else if (key === "guardians") {
              navigate(`${basePath}/guardians`);
            } else if (key === "billingContacts") {
              navigate(`${basePath}/billing-contacts`);
            } else if (key === "courses") {
              navigate(`${basePath}/courses`);
            }
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="生徒詳細タブ" className="w-fit min-w-max">
              <Tabs.Tab id="overview" className="whitespace-nowrap">
                基本情報
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="guardians" className="whitespace-nowrap">
                保護者情報
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="billingContacts" className="whitespace-nowrap">
                請求情報
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="courses" className="whitespace-nowrap">
                コース
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      <Outlet context={{ student }} />
    </section>
  );
}
