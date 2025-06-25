import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { PlusCircleIcon, MinusCircleIcon, UserPlusIcon, UserMinusIcon } from 'lucide-react';
import { AddActivityTab } from './economy/AddActivityTab';
import { AddExpenseTab } from './economy/AddExpenseTab';
import { AssignActivityTab } from './economy/AssignActivityTab';
import { AssignExpenseTab } from './economy/AssignExpenseTab';

export function EconomyTab() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const subTabs = [
    {
      name: 'Add Activity',
      icon: <PlusCircleIcon className="h-5 w-5 mr-2" />,
      component: <AddActivityTab />,
    },
    {
      name: 'Add Expense',
      icon: <MinusCircleIcon className="h-5 w-5 mr-2" />,
      component: <AddExpenseTab />,
    },
    {
      name: 'Assign Activity',
      icon: <UserPlusIcon className="h-5 w-5 mr-2" />,
      component: <AssignActivityTab />,
    },
    {
      name: 'Assign Expense',
      icon: <UserMinusIcon className="h-5 w-5 mr-2" />,
      component: <AssignExpenseTab />,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Economy Settings</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Manage activities, expenses, and their assignments within the system's economy.
      </p>

      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 mb-4">
          {subTabs.map((tab) => (
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
          {subTabs.map((tab, idx) => (
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
