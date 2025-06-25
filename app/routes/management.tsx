import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserProfile } from "~/lib/auth.server";
import { ManagementTabs } from "~/components/management/ManagementTabs";
import type { UserRole } from "~/types/admin";

export const meta: MetaFunction = () => {
  return [
    { title: "Life Economy - Management" },
    { name: "description", content: "Manage users, groups, and system settings." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { userProfile } = await getUserProfile(request);

  if (!userProfile) {
    throw redirect("/login");
  }

  const allowedRoles: UserRole[] = ['Admin', 'Super Admin'];
  if (!allowedRoles.includes(userProfile.role as UserRole)) {
    // Redirect to dashboard or show an unauthorized message
    throw redirect("/dashboard");
  }

  return json({ userRole: userProfile.role });
}

export default function ManagementPage() {
  const { userRole } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Management</h1>
      <ManagementTabs userRole={userRole as UserRole} />
    </div>
  );
}
