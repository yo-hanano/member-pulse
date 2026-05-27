import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Divider,
  Group,
  NavLink as MantineNavLink,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  Activity,
  BarChart3,
  Building2,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, redirect, useLoaderData, useLocation, useSubmit } from "react-router";

type AuthMeResponse = {
  userId: string;
  name: string | null;
  email: string | null;
  groups?: string[];
};

type NavigationItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  end?: boolean;
};

const navigationItems: NavigationItem[] = [
  { label: "ホーム", to: "/", icon: BarChart3, end: true },
  { label: "拠点", to: "/locations", icon: MapPin },
  { label: "見込み客", to: "/leads", icon: MessageSquare },
  { label: "チーム", to: "/employees", icon: Users },
  { label: "アカウント設定", to: "/settings/account", icon: Settings },
];

export async function clientLoader() {
  const res = await fetch("/auth/me", { credentials: "include" });
  if (res.status === 401) {
    throw redirect("/login");
  }
  if (!res.ok) {
    throw new Response(null, { status: res.status });
  }

  const data = (await res.json()) as AuthMeResponse;
  return {
    user: {
      id: data.userId,
      name: data.name ?? "User",
      email: data.email ?? "",
      isAdmin: (data.groups ?? []).includes("admin"),
    },
  };
}

export default function CoreLayout() {
  const { user } = useLoaderData<typeof clientLoader>();
  const location = useLocation();
  const submit = useSubmit();
  const [mobileOpened, setMobileOpened] = useState(false);
  const initials = user.name.slice(0, 1).toUpperCase();

  const handleLogout = () => {
    // ログアウトは既存の /logout action に集約し、BFF セッション削除を再利用する。
    submit(null, { action: "/logout", method: "post" });
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 280, breakpoint: "md", collapsed: { mobile: !mobileOpened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" px="lg">
          <Group gap="sm">
            <Burger
              hiddenFrom="md"
              opened={mobileOpened}
              size="sm"
              onClick={() => setMobileOpened((v) => !v)}
            />
            <Group gap="sm">
              <Avatar color="teal" radius="sm" size="sm">
                <Activity size={18} />
              </Avatar>
              <Stack gap={0} visibleFrom="xs">
                <Title order={1} size="h4">
                  MemberPulse
                </Title>
                <Text c="dimmed" size="xs">
                  Monthly review console
                </Text>
              </Stack>
            </Group>
          </Group>

          <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="sm">
                  <Avatar color="teal" radius="xl" size="sm">
                    {initials}
                  </Avatar>
                  <Stack gap={0} visibleFrom="sm">
                    <Text fw={600} size="sm">
                      {user.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {user.email}
                    </Text>
                  </Stack>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>アカウント</Menu.Label>
              <Menu.Item
                component={NavLink}
                leftSection={<Settings size={16} />}
                to="/settings/account"
              >
                設定
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<LogOut size={16} />} onClick={handleLogout}>
                ログアウト
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack h="100%" gap="md">
          <Stack gap={4}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              Navigation
            </Text>
            {navigationItems.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <MantineNavLink
                  active={isActive}
                  component={NavLink}
                  key={item.to}
                  label={item.label}
                  leftSection={<item.icon size={18} />}
                  onClick={() => setMobileOpened(false)}
                  to={item.to}
                  variant="light"
                />
              );
            })}
          </Stack>

          <Divider />

          <ScrollArea flex={1}>
            <Stack gap="xs">
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                Current focus
              </Text>
              <Button justify="flex-start" leftSection={<Building2 size={16} />} variant="subtle">
                月次レビュー
              </Button>
            </Stack>
          </ScrollArea>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
