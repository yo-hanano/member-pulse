import { isRouteErrorResponse, useRouteError } from "react-router";

import { BadRequestError } from "~/components/errors/bad-request-error";
import { ForbiddenError } from "~/components/errors/forbidden";
import { GeneralError } from "~/components/errors/general-error";
import { MaintenanceError } from "~/components/errors/maintenance-error";
import { NotFoundError } from "~/components/errors/not-found-error";
import { UnauthorisedError } from "~/components/errors/unauthorized-error";

export function RouteErrorBoundary() {
  const error = useRouteError();

  // ルートのHTTPステータスに応じて表示するエラー画面を切り替える。
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 400:
        return <BadRequestError />;
      case 401:
        return <UnauthorisedError />;
      case 403:
        return <ForbiddenError />;
      case 404:
        return <NotFoundError />;
      case 503:
        return <MaintenanceError />;
      default:
        return <GeneralError />;
    }
  }

  // Response以外の例外は汎用エラーにフォールバックする。
  return <GeneralError />;
}
