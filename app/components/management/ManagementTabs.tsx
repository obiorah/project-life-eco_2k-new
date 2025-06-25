import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { CurrencyTab } from './CurrencyTab';
import { BehaviourTab } from './BehaviourTab';
import { EconomyTab } from './EconomyTab';
import { DollarSignIcon, ScaleIcon, TrendingUpIcon } from 'lucide-react';
import type { UserRole } from '~/types/admin';

interface ManagementTabsProps {
  userRole: UserRole;
}

export function ManagementTabs({ userRole }: ManagementTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define the tabs with icons
  const tabs = [
    {
      name: 'Currency',
      icon: <DollarSignIcon className="h-5 w-5 mr-2" />,
      component: <CurrencyTab />,
      roles: ['Super Admin'], // Only Super Admin can access Currency tab
    },
    {
      name: 'Behaviour',
      icon: <ScaleIcon className="h-5 w-5 mr-2" />,
      component: <BehaviourTab />,
      roles: ['Admin', 'Super Admin'],
    },
    {
      name: 'Economy',
      icon: <TrendingUpIcon className="h-5 w-5 mr-2" />,
      component: <EconomyTab />,
      roles: ['Admin', 'Super Admin'],
    },
  ];

  // Filter tabs based on user role
  const accessibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {accessibleTabs.map((tab) => (
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
          {accessibleTabs.map((tab, idx) => (
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
