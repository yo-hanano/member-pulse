import {
  Chip,
  Description,
  Input,
  Label,
  ListBox,
  Modal,
  Separator,
  Surface,
} from "@heroui/react";
import { ArrowRight, Search } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSearch } from "~/context/search-context";
import { useTheme } from "~/context/theme-context";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  action: () => void;
};

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const commandItems = useMemo<CommandItem[]>(
    () => [
      {
        id: "/",
        label: "ダッシュボード",
        description: "概要と主要な指標を確認",
        keywords: ["home", "overview", "top", "ダッシュボード", "ホーム"],
        action: () => navigate("/"),
      },
      {
        id: "/leads",
        label: "リード",
        description: "リード一覧と対応状況を確認",
        keywords: ["lead", "inquiry", "リード", "contact"],
        action: () => navigate("/leads"),
      },
      {
        id: "/employees",
        label: "従業員",
        description: "従業員一覧と権限を確認",
        keywords: ["staff", "member", "admin", "従業員", "employee"],
        action: () => navigate("/employees"),
      },
      {
        id: "/products",
        label: "商品",
        description: "商品カタログを管理",
        keywords: ["item", "inventory", "stock", "商品", "product"],
        action: () => navigate("/products"),
      },
      {
        id: "theme:light",
        label: "Light Theme",
        description: "明るい配色に切り替え",
        keywords: ["theme", "light", "appearance", "テーマ", "ライト"],
        action: () => setTheme("light"),
      },
      {
        id: "theme:dark",
        label: "Dark Theme",
        description: "暗い配色に切り替え",
        keywords: ["theme", "dark", "appearance", "テーマ", "ダーク"],
        action: () => setTheme("dark"),
      },
      {
        id: "theme:system",
        label: "System Theme",
        description: "OS 設定に追従",
        keywords: ["theme", "system", "appearance", "テーマ", "システム"],
        action: () => setTheme("system"),
      },
    ],
    [navigate, setTheme],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filteredItems = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) {
      return commandItems;
    }

    return commandItems.filter((item) => {
      const target = `${item.label} ${item.description} ${item.keywords.join(" ")}`.toLowerCase();
      return target.includes(q);
    });
  }, [commandItems, deferredQuery]);

  const handleAction = (key: React.Key) => {
    const selected = commandItems.find((item) => item.id === String(key));
    if (!selected) {
      return;
    }

    setOpen(false);
    selected.action();
  };

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
      <Modal.Container placement="top" size="md">
        <Modal.Dialog className="mt-20 overflow-hidden sm:max-w-[640px]">
          <Modal.Body className="gap-0 p-0">
            <Surface className="p-3" variant="secondary">
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  aria-label="コマンド検索"
                  autoFocus
                  className="w-full pl-9 pr-9"
                  placeholder="コマンドまたはキーワードで検索..."
                  value={query}
                  variant="secondary"
                  onChange={(event) => {
                    const value = event.target.value;
                    startTransition(() => setQuery(value));
                  }}
                />
              </div>
            </Surface>
            <Separator />
            <ListBox
              aria-label="コマンド候補"
              className="max-h-80 overflow-auto p-2"
              selectionMode="none"
              onAction={handleAction}
            >
              {filteredItems.length === 0 ? (
                <ListBox.Item id="no-results" isDisabled textValue="検索結果なし">
                  <Label>該当する項目がありません。</Label>
                </ListBox.Item>
              ) : (
                filteredItems.map((item) => (
                  <ListBox.Item id={item.id} key={item.id} textValue={item.label}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Label className="block text-sm font-medium leading-tight">{item.label}</Label>
                          {item.id === `theme:${theme}` ? (
                            <Chip color="accent" size="sm" variant="soft">
                              Active
                            </Chip>
                          ) : null}
                        </div>
                        <Description className="mt-0.5 block text-xs text-muted-foreground leading-tight">
                          {item.description}
                        </Description>
                      </div>
                      <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                    </div>
                  </ListBox.Item>
                ))
              )}
            </ListBox>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
