import { Anchor, Box, Center, Image, Stack, Text, ThemeIcon } from "@mantine/core";
import { Activity } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";

export default function AuthLayout() {
  const location = useLocation();
  const isWideAuthPage = ["/login", "/password/reset"].includes(location.pathname);

  return (
    <Box className="min-h-svh" bg="var(--mantine-color-body)">
      <Box className="grid min-h-svh lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.45fr)]">
        {/* ブランド面はログイン前の安心感を作るため、ロゴと用途を絞って表示する。 */}
        <Box
          className="relative hidden overflow-hidden lg:block"
          bg="teal.8"
          c="white"
          px="xl"
          py="xl"
        >
          <Box
            className="absolute inset-0 opacity-20"
            bg="linear-gradient(135deg, #12b886 0%, #0b7285 48%, #1c7ed6 100%)"
          />
          <Center className="relative min-h-full">
            <Stack align="center" gap="lg">
              <Image alt="MemberPulse" fit="contain" h={150} src="/logo_only.png" w={150} />
              <Stack align="center" gap={6} maw={360} ta="center">
                <Text fw={700} fz="xl">
                  MemberPulse
                </Text>
                <Text c="teal.0" fz="sm">
                  月謝制スタジオの月次レビューを、数字から静かに整える。
                </Text>
              </Stack>
            </Stack>
          </Center>
        </Box>

        {/* Outlet の幅だけを route 種別で変え、ログインと復旧系のフォーム密度を保つ。 */}
        <Box className="flex min-h-svh flex-col px-6 py-6 sm:px-10">
          <Box className="flex justify-center sm:justify-start">
            <Anchor component={Link} to="/" c="dark" fw={700} underline="never">
              <span className="inline-flex items-center gap-2">
                <ThemeIcon color="teal" radius="sm" size="sm" variant="filled">
                  <Activity size={16} />
                </ThemeIcon>
                MemberPulse
              </span>
            </Anchor>
          </Box>
          <Center className="flex-1 py-10">
            <Box w="100%" maw={isWideAuthPage ? 440 : 360}>
              <Outlet />
            </Box>
          </Center>
        </Box>
      </Box>
    </Box>
  );
}
