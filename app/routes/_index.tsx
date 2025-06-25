import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node"; // Import redirect
import { useStore } from "~/store/store";
import { useEffect } from "react";
import { getAuthSession } from "~/lib/auth.server"; // Import getAuthSession

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("[Loader - _index] Index route loader executed.");
  const headers = new Headers();
  const session = await getAuthSession(request);

  // If a session exists, redirect to the dashboard
  if (session) {
    console.log("[Loader - _index] Session found, redirecting to /dashboard.");
    throw redirect("/dashboard", { headers });
  }

  // Otherwise, return an empty object for the welcome page
  return json({});
}

export default function Index() {
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    console.log("[Index Component] Current user from Zustand:", currentUser);
  }, [currentUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <h1 className="mb-6 text-center text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Life Economy!
        </h1>
        {currentUser ? (
          <div className="text-center text-lg text-gray-700 dark:text-gray-300">
            <p>You are logged in as <span className="font-semibold">{currentUser.fullName || currentUser.email}</span>.</p>
            <p>Your current balance is: <span className="font-semibold">${currentUser.balance.toFixed(2)}</span></p>
            <p className="mt-4">Explore the features and manage your life's economy.</p>
          </div>
        ) : (
          <div className="text-center text-lg text-gray-700 dark:text-gray-300">
            <p>Please sign in to access your dashboard and manage your economy.</p>
            <p className="mt-4">
              <a
                href="/login"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
              >
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
