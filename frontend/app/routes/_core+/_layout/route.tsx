import { Avatar, Button, Chip, Dropdown, Kbd, Label, SearchField, Separator, Surface, Tooltip } from "@heroui/react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  PanelLeft,
  Settings,
  UserCircle2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, redirect, useLoaderData, useNavigate, useSubmit } from "react-router";
import { ClerkFullLogo } from "~/assets/clerk-full-logo";
import { ClerkLogo } from "~/assets/clerk-logo";
import { ThemeSwitch } from "~/components/composed/theme-switch";
import { useSearch } from "~/context/search-context";
import { cn } from "~/lib/utils";

type AuthMeResponse = {
  userId: string;
  name: string | null;
  email: string | null;
  groups?: string[];
};

type SidebarItem = {
  type: "item";
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

type SidebarGroup = {
  type: "group";
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: SidebarItem[];
};

type SidebarSection = {
  id: string;
  label: string;
  items: Array<SidebarItem | SidebarGroup>;
};

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
  const submit = useSubmit();
  const navigate = useNavigate();
  const { setOpen } = useSearch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    management: true,
    region: true,
    account: true,
  });
  const sidebarSections: SidebarSection[] = [
    {
      id: "general",
      label: "General",
      items: [{ type: "item", label: "ダッシュボード", to: "/", icon: LayoutDashboard, end: true }],
    },
    {
      id: "pages",
      label: "Pages",
      items: [
          {
            type: "group",
            id: "management",
            label: "管理",
            icon: Users,
            children: [
              { type: "item", label: "リード", to: "/leads", icon: MessageSquare, end: false },
              { type: "item", label: "生徒", to: "/students", icon: Users, end: false },
              { type: "item", label: "講師", to: "/teachers", icon: GraduationCap, end: false },
              { type: "item", label: "従業員", to: "/employees", icon: UserCircle2, end: false },
              { type: "item", label: "商品", to: "/products", icon: Building2, end: false },
          ],
        },
      ],
    },
    {
      id: "other",
      label: "Other",
      items: [
        {
          type: "group",
          id: "region",
          label: "地域",
          icon: MapPin,
          children: [
            { type: "item", label: "エリア", to: "/areas", icon: MapPin, end: false },
            { type: "item", label: "拠点", to: "/branches", icon: Building2, end: false },
          ],
        },
        {
          type: "group",
          id: "company-master",
          label: "会社マスタ",
          icon: Settings,
          children: [
            { type: "item", label: "時限", to: "/lesson-periods", icon: Settings, end: false },
            { type: "item", label: "開校テンプレート", to: "/opening-schedule-templates", icon: Settings, end: false },
          ],
        },
        {
          type: "group",
          id: "account",
          label: "アカウント",
          icon: Settings,
          children: [{ type: "item", label: "設定", to: "/settings/account", icon: Settings, end: false }],
        },
      ],
    },
  ];
  const flattenedItems = sidebarSections.flatMap((section) =>
    section.items.flatMap((entry) => (entry.type === "item" ? [entry] : entry.children)),
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("core-sidebar-collapsed");
    if (stored === "1") {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("core-sidebar-collapsed", isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleProfileAction = (key: React.Key) => {
    if (key === "logout") {
      submit(null, { action: "/logout", method: "post" });
      return;
    }
    if (key === "account") {
      navigate("/settings/account");
    }
  };

  // サイドバーの状態に応じてブランド表示を切り替える。
  const desktopBrand = isCollapsed ? (
    <div className="grid h-8 w-10 place-items-center">
      <ClerkLogo className="size-5 text-foreground" />
    </div>
  ) : (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-8 w-10 place-items-center shrink-0">
        <ClerkLogo className="size-5 text-foreground" />
      </div>
      <div className="min-w-0 overflow-hidden">
        <ClerkFullLogo className="h-6 w-auto" />
        <p className="text-muted-foreground pt-1 text-[11px]">B2B Console</p>
      </div>
    </div>
  );

  return (
    <Surface className="flex h-svh bg-background text-foreground" variant="default">
      <Surface
        className={cn(
          "hidden shrink-0 border-r border-border/60 transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex lg:flex-col",
          isCollapsed ? "w-20" : "w-72",
        )}
        variant="default"
      >
        <aside className={cn("flex-1", isCollapsed ? "w-20" : "w-72")}>
        <div className={cn("flex h-16 items-center border-b border-border/60", isCollapsed ? "justify-center px-2" : "px-5")}>
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
              isCollapsed ? "max-w-12 translate-x-0 opacity-100" : "max-w-56 translate-x-0 opacity-100",
            )}
          >
            {desktopBrand}
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-3">
          {(isCollapsed ? flattenedItems : []).map((item) => {
            const content = (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                    isCollapsed ? "justify-center" : "gap-2",
                    isActive
                      ? "bg-default/60 text-default-foreground font-medium"
                      : "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                  )
                }
                end={item.end}
                to={item.to}
              >
                <item.icon className="size-4 shrink-0" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out motion-reduce:transition-none",
                    isCollapsed ? "w-0 -translate-x-1 opacity-0" : "w-auto translate-x-0 opacity-100",
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );

            if (!isCollapsed) {
              return <div key={item.to}>{content}</div>;
            }

            return (
              <Tooltip delay={0} key={item.to}>
                <Tooltip.Trigger aria-label={item.label}>{content}</Tooltip.Trigger>
                <Tooltip.Content className="px-3 py-1.5" placement="right" showArrow>
                  <Tooltip.Arrow />
                  <p className="text-xs font-medium">{item.label}</p>
                </Tooltip.Content>
              </Tooltip>
            );
          })}
          {!isCollapsed
            ? sidebarSections.map((section) => (
                <div className="space-y-1" key={section.id}>
                  <p className="text-muted-foreground px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((entry) => {
                      if (entry.type === "item") {
                        return (
                          <NavLink
                            key={entry.to}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "bg-default/60 text-default-foreground font-medium"
                                  : "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                              )
                            }
                            end={entry.end}
                            to={entry.to}
                          >
                            <entry.icon className="size-4 shrink-0" />
                            <span>{entry.label}</span>
                          </NavLink>
                        );
                      }

                      const isExpanded = expandedGroups[entry.id];
                      return (
                        <div className="space-y-1" key={entry.id}>
                          <button
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                            )}
                            onClick={() => toggleGroup(entry.id)}
                            type="button"
                          >
                            <entry.icon className="size-4 shrink-0" />
                            <span className="flex-1 text-left">{entry.label}</span>
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </button>

                          {isExpanded ? (
                            <div className="space-y-1 pl-4">
                              {entry.children.map((child) => (
                                <NavLink
                                  key={child.to}
                                  className={({ isActive }) =>
                                    cn(
                                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                      isActive
                                        ? "bg-default/60 text-default-foreground font-medium"
                                        : "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                                    )
                                  }
                                  end={child.end}
                                  to={child.to}
                                >
                                  <child.icon className="size-4 shrink-0" />
                                  <span>{child.label}</span>
                                </NavLink>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            : null}
        </nav>
        </aside>
      </Surface>

      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200 ease-out motion-reduce:transition-none lg:hidden",
          isMobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
          <button
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileNavOpen(false)}
            type="button"
          />
          <Surface
            className={cn(
              "relative z-10 flex h-full w-72 flex-col border-r border-border/60 transition-transform duration-250 ease-out motion-reduce:transition-none",
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
            )}
            variant="default"
          >
            <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
              <div className="grid h-8 w-10 place-items-center shrink-0">
                <ClerkLogo className="size-5 text-foreground" />
              </div>
              <div className="min-w-0">
                <ClerkFullLogo className="h-6 w-auto" />
                <p className="text-muted-foreground pt-1 text-[11px]">B2B Console</p>
              </div>
            </div>
            <nav className="flex-1 space-y-2 p-3">
              {sidebarSections.map((section) => (
                <div className="space-y-1" key={`mobile-${section.id}`}>
                  <p className="text-muted-foreground px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    {section.label}
                  </p>
                  {section.items.map((entry) => {
                    if (entry.type === "item") {
                      return (
                        <NavLink
                          key={`mobile-${entry.to}`}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-default/60 text-default-foreground font-medium"
                                : "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                            )
                          }
                          end={entry.end}
                          onClick={() => setIsMobileNavOpen(false)}
                          to={entry.to}
                        >
                          <entry.icon className="size-4 shrink-0" />
                          {entry.label}
                        </NavLink>
                      );
                    }

                    const isExpanded = expandedGroups[entry.id];
                    return (
                      <div className="space-y-1" key={`mobile-${entry.id}`}>
                        <button
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                            "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                          )}
                          onClick={() => toggleGroup(entry.id)}
                          type="button"
                        >
                          <entry.icon className="size-4 shrink-0" />
                          <span className="flex-1 text-left">{entry.label}</span>
                          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>

                        {isExpanded ? (
                          <div className="space-y-1 pl-4">
                            {entry.children.map((child) => (
                              <NavLink
                                key={`mobile-${child.to}`}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isActive
                                      ? "bg-default/60 text-default-foreground font-medium"
                                      : "text-muted-foreground hover:bg-default/40 hover:text-foreground",
                                  )
                                }
                                end={child.end}
                                onClick={() => setIsMobileNavOpen(false)}
                                to={child.to}
                              >
                                <child.icon className="size-4 shrink-0" />
                                {child.label}
                              </NavLink>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </Surface>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Surface className="flex h-16 items-center gap-3 border-b border-border/60 px-4 backdrop-blur" variant="default">
          <Button
            className="lg:hidden"
            isIconOnly
            size="sm"
            type="button"
            variant="outline"
            onPress={() => setIsMobileNavOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <Button
            className="hidden lg:inline-flex"
            isIconOnly
            size="sm"
            type="button"
            variant="outline"
            onPress={() => setIsCollapsed((prev) => !prev)}
          >
            <PanelLeft className="size-4" />
          </Button>

          <SearchField className="w-full max-w-xl" name="global-search" variant="secondary">
            <Label className="sr-only">Search</Label>
            <SearchField.Group className="relative">
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder="Search"
                readOnly
                onClick={() => setOpen(true)}
                onFocus={(event) => {
                  event.currentTarget.blur();
                  setOpen(true);
                }}
              />
            
              <Kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                <Kbd.Content>Ctrl</Kbd.Content>
                <Kbd.Content>K</Kbd.Content>
              </Kbd>
            </SearchField.Group>
          </SearchField>

          <div className="ml-auto flex items-center gap-3">
            <ThemeSwitch />
            <Dropdown>
              <Dropdown.Trigger className="rounded-full">
                <Avatar size="sm">
                  <Avatar.Fallback>{user.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
                </Avatar>
              </Dropdown.Trigger>
              <Dropdown.Popover className="min-w-[220px]">
                <div className="space-y-2 px-3 pt-3 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <Chip color={user.isAdmin ? "accent" : "default"} size="sm" variant="soft">
                      {user.isAdmin ? "Admin" : "User"}
                    </Chip>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                </div>
                <Separator />
                <Dropdown.Menu onAction={handleProfileAction}>
                  <Dropdown.Item id="account" textValue="Account">
                    <Label>Account</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                    <Label>Log out</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </Surface>

        <Surface className="flex-1 overflow-auto bg-background p-4 md:p-6" variant="transparent">
          <Outlet />
        </Surface>
      </div>
    </Surface>
  );
}
