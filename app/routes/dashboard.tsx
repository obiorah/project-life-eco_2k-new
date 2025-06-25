import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useStore } from "~/store/store";
import { useEffect } from "react";
import { UserDashboard } from "~/components/dashboard/UserDashboard";
import { AdminDashboard } from "~/components/dashboard/AdminDashboard";
import { getAuthSession, getUserProfile } from "~/lib/auth.server";
import type { UserProfile } from "~/types/user";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("[Loader - dashboard] Dashboard route loader executed.");
  const headers = new Headers();
  let userProfile: UserProfile | null = null;

  try {
    const session = await getAuthSession(request);
    if (!session) {
      console.log("[Loader - dashboard] No Supabase session found. Redirecting to /login.");
      throw redirect("/login", { headers });
    }

    const { userProfile: fetchedProfile, headers: profileHeaders } = await getUserProfile(request);
    userProfile = fetchedProfile;
    profileHeaders.forEach((value, key) => headers.append(key, value));

    if (!userProfile) {
      console.log("[Loader - dashboard] User profile not found for session. Redirecting to /login.");
      throw redirect("/login", { headers });
    }

    console.log("[Loader - dashboard] UserProfile fetched:", userProfile.id, "Role:", userProfile.role);

  } catch (err: any) {
    if (err instanceof Response && err.status === 302) {
      throw err; // Re-throw redirect responses
    }
    console.error("[Loader - dashboard] Error fetching user profile:", err);
    throw redirect("/login", { headers }); // Redirect on any other error
  }

  return json({ userProfile }, { headers });
}

export default function Dashboard() {
  const { userProfile } = useLoaderData<typeof loader>();
  const zustandSetCurrentUser = useStore((state) => state.setCurrentUser);
  const currentUser = useStore((state) => state.currentUser); // Keep this to read current state

  useEffect(() => {
    if (userProfile) {
      // Check if currentUser in Zustand is different from userProfile from loader
      // This prevents infinite updates if the data is already consistent
      const isZustandConsistent =
        currentUser &&
        currentUser.id === userProfile.id &&
        currentUser.email === (userProfile.email || '') &&
        currentUser.fullName === (userProfile.full_name || 'User') &&
        currentUser.balance === (userProfile.balance ?? 0) &&
        currentUser.role === (userProfile.role || 'User') &&
        (userProfile.created_at ? currentUser.createdAt === new Date(userProfile.created_at).toISOString().split('T')[0] : !currentUser.createdAt) &&
        currentUser.groupId === (userProfile.group_id || currentUser.groupId || 'group_placeholder_id') &&
        currentUser.groupName === (userProfile.group_name || currentUser.groupName || 'Group Placeholder') &&
        currentUser.avatarUrl === (userProfile.avatar_url || currentUser.avatarUrl || undefined);

      if (!isZustandConsistent) {
        zustandSetCurrentUser({
          id: userProfile.id,
          email: userProfile.email || '',
          fullName: userProfile.full_name || 'User',
          balance: userProfile.balance ?? 0,
          role: userProfile.role || 'User',
          createdAt: userProfile.created_at ? new Date(userProfile.created_at).toISOString().split('T')[0] : (currentUser?.createdAt || new Date().toISOString().split('T')[0]),
          status: currentUser?.status || 'active', // Preserve existing status if not provided by profile
          groupId: userProfile.group_id || currentUser?.groupId || 'group_placeholder_id',
          groupName: userProfile.group_name || currentUser?.groupName || 'Group Placeholder',
          avatarUrl: userProfile.avatar_url || currentUser?.avatarUrl || undefined,
        });
        console.log("[Dashboard Component] Updated currentUser in Zustand from loader data.");
      } else {
        console.log("[Dashboard Component] Zustand currentUser is consistent with loader data.");
      }
    }
  }, [userProfile, zustandSetCurrentUser]); // Removed currentUser from dependencies

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-700 dark:text-gray-300">You must be logged in to view the dashboard.</p>
          <a href="/login" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 md:p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        {currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? 'Admin Dashboard' : 'User Dashboard'}
      </h1>
      {currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? (
        <AdminDashboard />
      ) : (
        <UserDashboard currentUser={currentUser} />
      )}
    </div>
  );
}
