import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { getRuntimeConfig } from "./utils/runtime-config";

const startApp = () => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
};

// 起動前に runtime config を取り込み、CSR 側の接続先を確定させる。
getRuntimeConfig()
  .then((config) => {
    window.__runtimeConfig = config;
  })
  .catch((error) => {
    console.error("[frontend] failed to load runtime config", error);
  })
  .finally(() => {
    startApp();
  });
