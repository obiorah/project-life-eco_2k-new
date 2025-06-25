import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { UsersTabContent } from './UsersTabContent';
import { MasterTabContent } from './MasterTabContent';
import type { User, Group, Transaction } from '~/types/admin';
import type { Navigation } from '@remix-run/react';
import { UsersRoundIcon, SettingsIcon } from 'lucide-react';

interface AdminTabsProps {
  users: User[];
  groups: Group[];
  transactions: Transaction[];
  actionData: any; // The action data from the admin route
  navigation: Navigation; // The navigation object from Remix
}

export function AdminTabs({ users, groups, transactions, actionData, navigation }: AdminTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define the tabs with icons
  const tabs = [
    {
      name: 'Users',
      icon: <UsersRoundIcon className="h-5 w-5 mr-2" />,
      component: <UsersTabContent users={users} groups={groups} navigation={navigation} actionData={actionData} />
    },
    {
      name: 'Master',
      icon: <SettingsIcon className="h-5 w-5 mr-2" />,
      component: <MasterTabContent groups={groups} users={users} />
    },
  ];

  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5
                ring-blue-500 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                ${selected
                  ? 'bg-white text-blue-700 shadow dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                }`
              }
            >
              {tab.icon}
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={`rounded-xl bg-white p-3 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 dark:bg-gray-900`}
            >
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
