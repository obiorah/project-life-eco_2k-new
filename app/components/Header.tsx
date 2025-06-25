import { Link, Form, useLocation } from "@remix-run/react";
import type { UserProfile } from "~/types/user";
import { useStore } from "~/store/store";
import { useEffect, useState } from "react"; // Import useState
import { Dialog } from '@headlessui/react'; // Import Dialog from Headless UI
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Import icons

interface HeaderProps {
  user: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
  const currentUser = useStore((state) => state.currentUser);
  const zustandSetCurrentUser = useStore((state) => state.setCurrentUser);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu

  // This useEffect ensures that if the user prop changes (e.g., after login/logout),
  // the Zustand store is updated to reflect the latest user state.
  useEffect(() => {
    if (user) {
      // Only update if the user object from props is different from the store
      if (!currentUser || currentUser.id !== user.id) {
        zustandSetCurrentUser({
          id: user.id,
          email: user.email || '',
          fullName: user.full_name || 'User',
          balance: user.balance ?? 0,
          role: user.role || 'User',
          createdAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: 'active', // Assuming active status from profile
          groupId: user.group_id || 'group_placeholder_id',
          groupName: 'Group Placeholder', // Not fetched in root loader, placeholder
          avatarUrl: undefined, // Not fetched in root loader, placeholder
        });
      }
    } else {
      // If user prop is null, clear the Zustand store
      if (currentUser) {
        zustandSetCurrentUser(null);
      }
    }
  }, [user, currentUser, zustandSetCurrentUser]);

  // Define navigation links with role-based visibility
  const navigation = [
    {
      name: 'Dashboard',
      href: (user?.role === 'Admin' || user?.role === 'Super Admin') ? '/admin' : '/dashboard',
      roles: ['User', 'Admin', 'Super Admin']
    },
    { name: 'Transfer', href: '/transfer', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Transactions', href: '/transactions', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Market', href: '/market', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Management', href: '/management', roles: ['Admin', 'Super Admin'] },
    { name: 'Admin', href: '/admin', roles: ['Super Admin'] }, // Ensure this points to /admin
    { name: 'Reports', href: '/reports', roles: ['Admin', 'Super Admin'] },
    { name: 'Settings', href: '/settings', roles: ['User', 'Admin', 'Super Admin'] },
  ];

  // Filter navigation links based on user's role
  const filteredNavigation = user
    ? navigation.filter(item => item.roles.includes(user.role || 'User'))
    : [];

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Life Economy</span>
            <img
              className="h-8 w-auto"
              src="https://www.svgrepo.com/show/493600/economy-growth.svg"
              alt="Life Economy Logo"
            />
          </Link>
        </div>
        <div className="flex lg:hidden"> {/* Mobile menu button */}
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12"> {/* Desktop navigation */}
          {user && filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 ${
                location.pathname.startsWith(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
              } hover:text-indigo-600 dark:hover:text-indigo-400`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4"> {/* Desktop auth buttons */}
          {user ? (
            <>
              <span className="text-gray-900 dark:text-white text-sm font-medium">
                Welcome, {user.full_name || user.email || 'User'}!
              </span>
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
                >
                  Sign Out
                </button>
              </Form>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Dialog */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-100/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Life Economy</span>
              <img
                className="h-8 w-auto"
                src="https://www.svgrepo.com/show/493600/economy-growth.svg"
                alt="Life Economy Logo"
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-400/10">
              <div className="space-y-2 py-6">
                {user && filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                      location.pathname.startsWith(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                    } hover:bg-gray-50 dark:hover:bg-gray-800`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <>
                    <span className="block -mx-3 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                      Welcome, {user.full_name || user.email || 'User'}!
                    </span>
                    <Form action="/logout" method="post">
                      <button
                        type="submit"
                        className="mt-4 w-full inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Out
                      </button>
                    </Form>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
