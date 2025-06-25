import React from 'react';
import { AdminTabs } from '~/components/admin/AdminTabs';
import type { User, Group, Transaction } from '~/types/admin';
import type { Navigation } from '@remix-run/react';

interface SuperAdminDashboardProps {
  users: User[];
  groups: Group[];
  transactions: Transaction[];
  actionData: any;
  navigation: Navigation;
}

export function SuperAdminDashboard({ users, groups, transactions, actionData, navigation }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* AdminTabs now only shows Users and Master tabs */}
      <AdminTabs
        users={users}
        groups={groups}
        transactions={transactions}
        actionData={actionData}
        navigation={navigation}
      />
    </div>
  );
}
