import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Life Economy - Reports" },
    { name: "description", content: "View various system reports and analytics." },
  ];
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>
      <p className="text-gray-700 dark:text-gray-300">
        This page will display various system reports and analytics.
      </p>
      <p className="mt-4 text-gray-500 dark:text-gray-400">
        (Content for Reports will be implemented here.)
      </p>
    </div>
  );
}
