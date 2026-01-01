import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ActivitiesDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Activities API</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track interactions and events with contacts
        </p>
      </div>

      {/* List Activities */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/activities
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            List All Activities
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve all activities with optional filtering and pagination.
          </p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Query Parameters:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>contactId</code> - Filter by contact ID (UUID)</li>
              <li><code>type</code> - Filter by type (call, email, meeting, note)</li>
              <li><code>search</code> - Search in subject, description, or contact name</li>
              <li><code>fromDate</code> - Filter activities created on or after date</li>
              <li><code>toDate</code> - Filter activities created on or before date</li>
              <li><code>page</code> - Page number (default: 1)</li>
              <li><code>limit</code> - Items per page (default: 20)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Create Activity */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/activities
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Create Activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create a new activity in the CRM system.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "type": "call",
  "subject": "Initial consultation",
  "description": "Discussed project requirements",
  "contactId": "550e8400-e29b-41d4-a716-446655440000"
}`}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Field Validation
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Field</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Required</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">type</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">call, email, meeting, or note</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">subject</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">1-255 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">description</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Max 1000 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">contactId</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Valid UUID of existing contact</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Success Response (201 Created)
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "call",
    "subject": "Initial consultation",
    "description": "Discussed project requirements",
    "contactId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T18:30:00.000Z",
    "updatedAt": "2025-12-30T18:30:00.000Z"
  },
  "error": null
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </Card>

      {/* Get Single Activity */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/activities/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Get Single Activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve a specific activity by ID.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of activity
          </p>
        </div>
      </Card>

      {/* Update Activity */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">PUT</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/activities/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Update Activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Update an existing activity.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of activity
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Only <code>subject</code> and <code>description</code> can be updated. <code>type</code> and <code>contactId</code> cannot be changed.
          </p>
        </div>
      </Card>

      {/* Delete Activity */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/activities/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Delete Activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Delete an activity from the system.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of activity
          </p>
        </div>
      </Card>
    </div>
  );
}
