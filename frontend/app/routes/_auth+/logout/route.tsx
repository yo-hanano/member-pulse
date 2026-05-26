import { redirect } from "react-router";

export const clientAction = async () => {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => null);

  return redirect("/login");
};

export const clientLoader = async () => {
  return redirect("/login");
};

export default function LogoutRoute() {
  return null;
}
