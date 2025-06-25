import type { ActionFunctionArgs } from "@remix-run/node";
import { signOut } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  return signOut(request);
}

// Adding a default export to help Remix HMR
export default function LogoutRoute() {
  return null;
}
