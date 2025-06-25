import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse, Form, useActionData } from "@remix-run/react";
import { getAuthSession, getUserProfile, getSupabaseWithSessionAndHeaders } from "~/lib/auth.server";
import type { UserProfile } from "~/types/user";
import { ChangePasswordModal } from "~/components/settings/ChangePasswordModal";

export const meta: MetaFunction = () => {
  return [
    { title: "Life Economy - Account Settings" },
    { name: "description", content: "Manage your account settings and preferences." },
  ];
};

// Loader updated to securely fetch user profile
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("[Server Loader - settings] Attempting to fetch user profile for settings page.");
  try {
    const { userProfile, headers } = await getUserProfile(request);

    if (!userProfile) {
      console.warn("[Server Loader - settings] No user profile found for authenticated session.");
      throw new Response("User profile not found.", { status: 404 });
    }

    console.log("[Server Loader - settings] User profile fetched successfully:", userProfile.id);
    return json({ userProfile }, { headers });
  } catch (err: any) {
    console.error("[Server Loader - settings] Error caught during profile fetch:", err);
    if (err instanceof Response) {
      throw err; // Re-throw Response objects directly (e.g., redirects, 404s)
    }
    throw new Response(err.message || "An unknown error occurred fetching profile", { status: 500 });
  }
}

// Action function for password change
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const intent = formData.get("intent"); // To differentiate actions if needed

  console.log(`[Server Action - settings] Received password change request.`);

  if (intent === "changePassword") {
    if (!password || !confirmPassword) {
      return json({ success: false, error: "Password fields cannot be empty." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return json({ success: false, error: "Passwords do not match." }, { status: 400 });
    }
    if (password.length < 6) {
      return json({ success: false, error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    try {
      const { supabase, headers } = await getSupabaseWithSessionAndHeaders({ request });

      console.log(`[Server Action - settings] Attempting to update password for current user.`);
      const { data, error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        console.error("[Server Action - settings] Supabase auth error updating password:", error);
        return json({ success: false, error: error.message || "Failed to update password." }, { status: 500 });
      }

      console.log("[Server Action - settings] Password updated successfully for user:", data?.user?.id);
      return json({ success: true, message: "Password updated successfully!" }, { headers });

    } catch (err: any) {
      console.error("[Server Action - settings] Unexpected error during password update:", err);
      return json({ success: false, error: err.message || "An unexpected error occurred." }, { status: 500 });
    }
  }

  // Handle other intents or unknown intents
  return json({ success: false, error: "Invalid action intent." }, { status: 400 });
}

// --- AccountSettings Component ---
export default function AccountSettings() {
  const { userProfile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Apply theme class to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Handle password update success/error from actionData
  useEffect(() => {
    if (actionData?.success) {
      // Password modal will handle its own success message and auto-close
      // No need to explicitly close it here, it's handled by ChangePasswordModal's useEffect
    }
  }, [actionData]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (!userProfile) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
        <p className="text-gray-700 dark:text-gray-300">Could not load user profile information.</p>
      </div>
    );
  }

  const memberSince = userProfile.created_at
    ? new Date(userProfile.created_at).toLocaleDateString()
    : "N/A";

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>

      {/* Profile Information Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Information</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Your account details and preferences
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              User ID
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{userProfile.id || 'N/A'}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Name
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{userProfile.full_name || 'N/A'}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Email
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{userProfile.email || 'N/A'}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Member Since
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">{memberSince}</p>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Security</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Manage your password and security settings
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your account password.
            </p>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Change password
            </button>
          </div>
          <hr className="dark:border-gray-700" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
            <button className="mt-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              Enable two-factor authentication {/* Still inactive */}
            </button>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Customize the look and feel of the application.
        </p>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</h3>
          <label htmlFor="theme-toggle" className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              id="theme-toggle"
              className="peer sr-only"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {theme === 'dark' ? 'On' : 'Off'}
            </span>
          </label>
        </div>
      </div>

      {/* Render the imported modal component */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        setIsOpen={setIsPasswordModalOpen}
        // userId is no longer needed as the action updates the current session user
      />
    </div>
  );
}

// Error Boundary remains the same - it catches errors thrown by the loader
export function ErrorBoundary() {
  const error = useRouteError();
  console.error("Settings Route Error Boundary caught error:", error);

  let errorMessage = "An unexpected error occurred loading settings.";
  let errorStatus = 500;
  let errorDetails = ""; // For potential extra info

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.data || error.statusText || "Error";
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || "";
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
     <div className="mx-auto max-w-4xl space-y-4 rounded-lg border border-red-300 bg-red-50 p-6 text-center shadow-sm dark:border-red-700 dark:bg-red-950">
       <h1 className="text-2xl font-bold text-red-700 dark:text-red-300">Account Settings Error</h1>
       <p className="text-red-600 dark:text-red-400">Status: {errorStatus}</p>
       <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
       {errorDetails && (
         <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded bg-red-100 p-2 text-left text-xs text-red-800 dark:bg-red-900/50 dark:text-red-200">
           <code>{errorDetails}</code>
         </pre>
       )}
       <p className="text-sm text-gray-600 dark:text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
     </div>
  );
}
