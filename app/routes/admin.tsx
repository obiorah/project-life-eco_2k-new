import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation } from "@remix-run/react"; // Import useNavigation
import { SuperAdminDashboard } from "~/components/dashboard/SuperAdminDashboard";
import { useStore } from "~/store/store";
import { useEffect } from "react";
import supabaseAdmin from "~/lib/supabase-admin";
import type { User, Group, Transaction } from "~/types/admin";

export const meta: MetaFunction = () => {
  return [
    { title: "Life Economy - Admin" },
    { name: "description", content: "Super Admin exclusive area for critical system operations." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let users: User[] = [];
  let groups: Group[] = [];
  let transactions: Transaction[] = [];

  const { data: usersData, error: usersError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, balance, role, created_at, group_id, is_suspended');
  if (usersError) {
    console.error("Error fetching users:", usersError);
  } else {
    users = usersData as User[];
  }

  const { data: groupsData, error: groupsError } = await supabaseAdmin
    .from('groups')
    .select('id, name, description, created_at');
  if (groupsError) {
    console.error("Error fetching groups:", groupsError);
  } else {
    groups = groupsData as Group[];
  }

  const { data: transactionsData, error: transactionsError } = await supabaseAdmin
    .from('transactions')
    .select('*');
  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError);
  } else {
    transactions = transactionsData as Transaction[];
  }

  return json({
    users,
    groups,
    transactions,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("_intent");

  switch (intent) {
    case "suspend-user": {
      const userId = formData.get("userId") as string;
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_suspended: true })
        .eq('id', userId);

      if (error) {
        console.error("Error suspending user:", error);
        return json({ success: false, message: "Failed to suspend user.", intent: "suspend-user" }, { status: 500 });
      }
      return json({ success: true, message: "User suspended successfully.", intent: "suspend-user" });
    }
    case "restore-user": {
      const userId = formData.get("userId") as string;
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_suspended: false })
        .eq('id', userId);

      if (error) {
        console.error("Error restoring user:", error);
        return json({ success: false, message: "Failed to restore user.", intent: "restore-user" }, { status: 500 });
      }
      return json({ success: true, message: "User restored successfully.", intent: "restore-user" });
    }
    case "change-user-role": {
      const userId = formData.get("userId") as string;
      const newRole = formData.get("newRole") as string;
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error("Error changing user role:", error);
        return json({ success: false, message: "Failed to change user role.", intent: "change-user-role" }, { status: 500 });
      }
      return json({ success: true, message: `User role changed to ${newRole} successfully.`, intent: "change-user-role" });
    }
    case "delete-user": {
      const userId = formData.get("userId") as string;
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error("Error deleting user:", error);
        return json({ success: false, message: "Failed to delete user.", intent: "delete-user" }, { status: 500 });
      }
      return json({ success: true, message: "User deleted successfully.", intent: "delete-user" });
    }
    case "create-user": {
      const email = formData.get("email") as string;
      const fullName = formData.get("fullName") as string;
      const role = formData.get("role") as string;
      const groupId = formData.get("groupId") as string;
      const password = formData.get("password") as string;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Disable email confirmation
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        return json({ success: false, message: authError.message, intent: "create-user" }, { status: 400 });
      }

      // Create profile entry
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email,
          full_name: fullName,
          role,
          group_id: groupId === '' ? null : groupId, // Handle empty group_id
          balance: 0, // Default balance
          is_suspended: false, // Default status
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Optionally, delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user?.id as string);
        return json({ success: false, message: profileError.message, intent: "create-user" }, { status: 500 });
      }

      return json({ success: true, message: "User created successfully.", intent: "create-user" });
    }
    case "update-user": {
      const userId = formData.get("userId") as string;
      const fullName = formData.get("fullName") as string;
      const role = formData.get("role") as string;
      const groupId = formData.get("groupId") as string;
      const balance = parseFloat(formData.get("balance") as string);

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          role,
          group_id: groupId === '' ? null : groupId,
          balance,
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user:", error);
        return json({ success: false, message: "Failed to update user.", intent: "update-user" }, { status: 500 });
      }
      return json({ success: true, message: "User updated successfully.", intent: "update-user" });
    }
    case "change-password": {
      const userId = formData.get("userId") as string;
      const newPassword = formData.get("newPassword") as string;

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        console.error("Error changing password:", error);
        return json({ success: false, message: error.message, intent: "change-password" }, { status: 500 });
      }
      return json({ success: true, message: "Password changed successfully.", intent: "change-password" });
    }
    case "create-group": {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      const { error } = await supabaseAdmin
        .from('groups')
        .insert({ name, description });

      if (error) {
        console.error("Error creating group:", error);
        return json({ success: false, message: "Failed to create group.", intent: "create-group" }, { status: 500 });
      }
      return json({ success: true, message: "Group created successfully.", intent: "create-group" });
    }
    case "update-group": {
      const groupId = formData.get("groupId") as string;
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      const { error } = await supabaseAdmin
        .from('groups')
        .update({ name, description })
        .eq('id', groupId);

      if (error) {
        console.error("Error updating group:", error);
        return json({ success: false, message: "Failed to update group.", intent: "update-group" }, { status: 500 });
      }
      return json({ success: true, message: "Group updated successfully.", intent: "update-group" });
    }
    case "delete-group": {
      const groupId = formData.get("groupId") as string;
      const { error } = await supabaseAdmin
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error("Error deleting group:", error);
        return json({ success: false, message: "Failed to delete group.", intent: "delete-group" }, { status: 500 });
      }
      return json({ success: true, message: "Group deleted successfully.", intent: "delete-group" });
    }
    default:
      return json({ success: false, message: "Invalid intent.", intent: "unknown" }, { status: 400 });
  }
}

export default function AdminPage() {
  const { users, groups, transactions } = useLoaderData<typeof loader>();
  const { setUsers, setGroups, setTransactions } = useStore();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation(); // Get navigation object

  useEffect(() => {
    if (users) {
      setUsers(users);
    }
    if (groups) {
      setGroups(groups);
    }
    if (transactions) {
      setTransactions(transactions);
    }
  }, [users, groups, transactions, setUsers, setGroups, setTransactions]);

  useEffect(() => {
    if (actionData?.success) {
      console.log(actionData.message);
    } else if (actionData?.message) {
      console.error(actionData.message);
    }
  }, [actionData]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Console</h1>
      {/* Pass actionData and navigation to SuperAdminDashboard */}
      <SuperAdminDashboard
        users={users}
        groups={groups}
        transactions={transactions}
        actionData={actionData}
        navigation={navigation}
      />
    </div>
  );
}
