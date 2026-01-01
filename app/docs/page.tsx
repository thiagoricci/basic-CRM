import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Users, FileText, CheckSquare, Briefcase, LayoutDashboard, Code2, Webhook, Shield, Building2 } from 'lucide-react';

const quickLinks = [
  { href: '/docs/contacts', label: 'Contacts API', icon: Users, description: 'Manage customer contacts' },
  { href: '/docs/activities', label: 'Activities API', icon: FileText, description: 'Track interactions and events' },
  { href: '/docs/tasks', label: 'Tasks API', icon: CheckSquare, description: 'Manage follow-ups and deadlines' },
  { href: '/docs/deals', label: 'Deals API', icon: Briefcase, description: 'Track sales pipeline' },
  { href: '/docs/companies', label: 'Companies API', icon: Building2, description: 'Manage company accounts' },
  { href: '/docs/dashboard', label: 'Dashboard API', icon: LayoutDashboard, description: 'Analytics and insights' },
  { href: '/docs/integration', label: 'Integration Examples', icon: Code2, description: 'Code samples and guides' },
  { href: '/docs/webhooks', label: 'Webhooks', icon: Webhook, description: 'Automate workflows' },
  { href: '/docs/security', label: 'Security', icon: Shield, description: 'Best practices and guidelines' },
];

export default function DocsOverview() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          API Documentation
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Integrate your external tools and webhooks with the CRM Contact Manager
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">REST API</Badge>
          <Badge variant="secondary">JSON</Badge>
          <Badge variant="secondary">v1.0.0</Badge>
        </div>
      </div>

      {/* Quick Start */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quick Start</h2>
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Base URL</h3>
              <code className="block w-full px-4 py-3 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono">
                http://localhost:3000/api
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Authentication</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Currently no authentication (MVP phase). All endpoints are publicly accessible.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Create a Contact Example</h3>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`curl -X POST http://localhost:3000/api/contacts \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead"
  }'`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </section>

      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group"
              >
                <Card className="p-6 h-full transition-all duration-200 hover:shadow-lg hover:border-primary bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                        {link.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Response Format */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Response Format</h2>
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              All API responses follow a consistent format with a <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">data</code> field and an <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">error</code> field.
            </p>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Success Response</h3>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "data": {
    // Your data here
  },
  "error": null
}`}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Error Response</h3>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "data": null,
  "error": "Error message here"
}`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </section>

      {/* HTTP Status Codes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">HTTP Status Codes</h2>
        <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="px-6 py-4 text-sm">
                  <Badge className="bg-green-500 hover:bg-green-600">200</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  OK - Request successful
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm">
                  <Badge className="bg-blue-500 hover:bg-blue-600">201</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  Created - Resource successfully created
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="destructive">400</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  Bad Request - Invalid input or validation error
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="destructive">404</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  Not Found - Resource does not exist
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm">
                  <Badge variant="destructive">500</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  Internal Server Error - Server error occurred
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
