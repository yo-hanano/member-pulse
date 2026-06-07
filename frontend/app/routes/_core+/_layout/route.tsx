import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Divider,
  Group,
  NavLink as MantineNavLink,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  Activity,
  BadgeJapaneseYen,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  LogOut,
  Map as MapIcon,
  MapPin,
  Megaphone,
  MessageSquare,
  NotebookTabs,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  SlidersHorizontal,
  Tags,
  UserRound,
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
  to?: string;
  icon: React.ComponentType<{ size?: number }>;
  end?: boolean;
  disabled?: boolean;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "CRM",
    items: [
      { label: "リード", to: "/leads", icon: MessageSquare },
      { label: "会員", to: "/members", icon: UserRound },
    ],
  },
  {
    label: "Review",
    items: [
      { label: "売上", to: "/revenues", icon: Receipt },
      { label: "広告費", icon: Megaphone, disabled: true },
      { label: "費用", icon: BadgeJapaneseYen, disabled: true },
    ],
  },
  {
    label: "Master",
    items: [
      { label: "拠点", to: "/locations", icon: MapPin },
      { label: "エリア", to: "/areas", icon: MapIcon },
      { label: "会員プラン", to: "/membership-plans", icon: CreditCard },
      { label: "費用マスタ", icon: Tags, disabled: true },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "従業員", to: "/employees", icon: Users },
      { label: "初期セットアップ", to: "/setup", icon: ClipboardCheck },
      { label: "アカウント設定", to: "/settings/account", icon: Settings },
      { label: "システム設定", to: "/settings/system", icon: SlidersHorizontal },
    ],
  },
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
  const [sidebarOpened, setSidebarOpened] = useLocalStorage({
    key: "sidebar-opened",
    defaultValue: true,
    getInitialValueInEffect: true,
  });
  const initials = user.name.slice(0, 1).toUpperCase();

  const handleLogout = () => {
    // ログアウトは既存の /logout action に集約し、BFF セッション削除を再利用する。
    submit(null, { action: "/logout", method: "post" });
  };

  const isItemActive = (item: NavigationItem) => {
    if (!item.to) return false;
    return item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: "md",
        collapsed: { mobile: !mobileOpened, desktop: !sidebarOpened },
      }}
      padding="lg"
    >
      <AppShell.Header className="app-shell-header">
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
            <Tooltip
              label={sidebarOpened ? "メニューを閉じる" : "メニューを開く"}
              position="bottom"
            >
              <ActionIcon
                aria-label={sidebarOpened ? "メニューを閉じる" : "メニューを開く"}
                onClick={() => setSidebarOpened((opened) => !opened)}
                size="lg"
                variant="subtle"
                visibleFrom="md"
              >
                {sidebarOpened ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </ActionIcon>
            </Tooltip>
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
                アカウント設定
              </Menu.Item>
              <Menu.Item
                component={NavLink}
                leftSection={<SlidersHorizontal size={16} />}
                to="/settings/system"
              >
                システム設定
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<LogOut size={16} />} onClick={handleLogout}>
                ログアウト
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="app-shell-navbar" p="md">
        <Stack h="100%" gap="md">
          <MantineNavLink
            active={location.pathname === "/"}
            component={NavLink}
            label="ダッシュボード"
            leftSection={<BarChart3 size={18} />}
            onClick={() => setMobileOpened(false)}
            to="/"
            variant="light"
          />

          <MantineNavLink
            active={location.pathname.startsWith("/financial-plans")}
            component={NavLink}
            label="収支計画"
            leftSection={<ClipboardCheck size={18} />}
            onClick={() => setMobileOpened(false)}
            to="/financial-plans"
            variant="light"
          />

          <MantineNavLink
            active={location.pathname.startsWith("/monthly-reviews")}
            component={NavLink}
            label="月次レビュー"
            leftSection={<NotebookTabs size={18} />}
            onClick={() => setMobileOpened(false)}
            to="/monthly-reviews"
            variant="light"
          />

          <Divider />

          <ScrollArea flex={1} type="auto">
            <Stack gap="lg" pr="xs">
              {navigationGroups.map((group) => (
                <Stack gap={4} key={group.label}>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    {group.label}
                  </Text>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);
                    const commonProps = {
                      active,
                      disabled: item.disabled,
                      label: item.label,
                      leftSection: <Icon size={18} />,
                      variant: "light" as const,
                    };

                    if (!item.to || item.disabled) {
                      return (
                        <MantineNavLink key={`${group.label}-${item.label}`} {...commonProps} />
                      );
                    }

                    return (
                      <MantineNavLink
                        key={`${group.label}-${item.label}`}
                        {...commonProps}
                        component={NavLink}
                        onClick={() => setMobileOpened(false)}
                        to={item.to}
                      />
                    );
                  })}
                </Stack>
              ))}
            </Stack>
          </ScrollArea>

          <Divider />

          <Group gap="sm">
            <Avatar color="teal" radius="xl" size="sm">
              {initials}
            </Avatar>
            <Stack gap={0} className="min-w-0">
              <Text fw={600} size="sm" truncate>
                {user.name}
              </Text>
              <Text c="dimmed" size="xs" truncate>
                {user.email}
              </Text>
            </Stack>
          </Group>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className="app-shell-main">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
