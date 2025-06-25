import type { Group, User } from "~/types/admin";
import { GroupsManagement } from "./GroupsManagement";
import { EssenceSettings } from "./EssenceSettings";
import { BackupRestore } from "./BackupRestore";

// Accept groups and users as props
interface MasterTabContentProps {
  groups: Group[];
  users: User[];
}

export function MasterTabContent({ groups, users }: MasterTabContentProps) {
  return (
    <div className="p-4 border rounded-b-md dark:border-gray-700 bg-gray-50 dark:bg-gray-950 space-y-6">
       {/* Pass the props down to GroupsManagement */}
       <GroupsManagement groups={groups} users={users} />
       <EssenceSettings />
       <BackupRestore />
    </div>
  );
}
