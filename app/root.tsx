import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { Header } from "~/components/Header";
import { getAuthSession, getUserProfile } from "~/lib/auth.server";
import { getSession, commitSession } from "~/lib/session.server";
import type { UserProfile } from "~/types/user";
import { useStore } from "~/store/store";
import type { User as AdminUser, UserRole } from "~/types/admin";
import { getBrowserEnvironment } from "~/lib/supabase";

import "./tailwind.css";

export type AppUser = UserProfile;

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("--- [Server Loader - root] ROOT LOADER CALLED ---");

  let userProfile: UserProfile | null = null;
  let sessionData: any | null = null;
  let error: string | null = null;
  const headers = new Headers();
  const url = new URL(request.url);
  const pathname = url.pathname;

  const publicPaths = ["/login", "/signup", "/reset-password", "/"];
  const isPublicPath = publicPaths.includes(pathname);

  try {
    const session = await getAuthSession(request);

    if (session) {
      try {
        const { userProfile: fetchedProfile, headers: profileHeaders } = await getUserProfile(request);
        userProfile = fetchedProfile;
        profileHeaders.forEach((value, key) => headers.append(key, value));

        sessionData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          user: session.user,
        };
      } catch (profileErr) {
        console.error("Error fetching user profile:", profileErr);
        if (!isPublicPath) {
          throw redirect("/login", { headers });
        }
      }
    } else if (!isPublicPath) {
      throw redirect("/login", { headers });
    }
  } catch (err: any) {
    if (err instanceof Response) {
      throw err;
    }
    console.error("Root loader error:", err);
    error = `Root loader failed: ${err.message || "An unknown error occurred"}`;
    if (!isPublicPath) {
      throw redirect("/login", { headers });
    }
  }

  const session = await getSession(request.headers.get("Cookie"));
  headers.append("Set-Cookie", await commitSession(session));

  const ENV = getBrowserEnvironment();

  return json({
    userProfile,
    session: sessionData,
    error,
    ENV,
  }, { headers });
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const { userProfile, ENV } = loaderData || {};
  const zustandSetCurrentUser = useStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (ENV) {
      window.ENV = ENV;
    }

    if (userProfile) {
      const userForStore: AdminUser = {
        id: userProfile.id,
        email: userProfile.email || '',
        fullName: userProfile.full_name || 'User',
        balance: userProfile.balance ?? 0,
        role: (userProfile.role as UserRole) || 'User',
        createdAt: userProfile.created_at ? new Date(userProfile.created_at).toISOString().split('T')[0] : '',
        groupId: userProfile.group_id || '',
        groupName: userProfile.group_name || '',
        avatarUrl: userProfile.avatar_url || '',
      };
      zustandSetCurrentUser(userForStore);
    }
  }, [userProfile, ENV, zustandSetCurrentUser]);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-950">
        <div className="flex h-full flex-col">
          <Header user={userProfile} />
          <main className="flex-1 overflow-auto">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        {ENV && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(ENV)};`,
            }}
          />
        )}
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "Unknown Error";

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50 dark:bg-gray-950">
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{errorMessage}</p>
          <a
            href="/"
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Return Home
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}