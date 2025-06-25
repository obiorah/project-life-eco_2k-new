import { Link } from "@remix-run/react";

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}


export function AccessDenied({ requiredRole = "authorized personnel" }: { requiredRole?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6">
      <AlertTriangleIcon className="w-16 h-16 text-destructive dark:text-destructive-foreground mb-4" />
      <h1 className="text-3xl font-bold text-destructive dark:text-destructive-foreground mb-2">Access Denied</h1>
      <p className="text-lg text-muted-foreground dark:text-muted-foreground mb-6">
        You do not have the required permissions ({requiredRole}) to view this page.
      </p>
      <Link
        to="/" // Link to the dashboard or home page
        className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" // Basic button styling
      >
        Go to Homepage
      </Link>
    </div>
  );
}
