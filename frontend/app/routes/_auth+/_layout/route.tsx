import { Link, Surface } from "@heroui/react";
import { GalleryVerticalEnd } from "lucide-react";
import { Outlet, useLocation } from "react-router";

export default function AuthLayout() {
  const location = useLocation();
  const isWideAuthPage = ["/login", "/password/reset"].includes(location.pathname);

  return (
    <div className="grid min-h-svh lg:grid-cols-[2fr_4fr]">
      {/* ギャラリー画像を左側に */}
      <Surface className="relative hidden items-center justify-center lg:flex" variant="secondary">
        <img src="/logo_only.png" alt="Image" className="h-48 w-48 object-contain" />
      </Surface>
      {/* Form（Outlet）を右側に */}
      <Surface className="flex flex-col gap-4 p-6 md:p-10" variant="default">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link className="flex items-center gap-2 font-medium no-underline hover:no-underline" href="/">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CXI System Inc.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className={isWideAuthPage ? "w-full max-w-md" : "w-full max-w-xs"}>
            <Outlet />
          </div>
        </div>
      </Surface>
    </div>
  );
}
