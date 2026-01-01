import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TasksDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tasks API</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage follow-ups, deadlines, and priorities
        </p>
      </div>

      {/* List Tasks */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/tasks
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            List All Tasks
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve all tasks with optional filtering.
          </p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Query Parameters:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>status</code> - Filter by status (all, open, completed, overdue)</li>
              <li><code>priority</code> - Filter by priority (all, low, medium, high)</li>
              <li><code>startDate</code> - Filter tasks due on or after date</li>
              <li><code>endDate</code> - Filter tasks due on or before date</li>
              <li><code>search</code> - Search by title</li>
              <li><code>contactId</code> - Filter by contact ID (UUID)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Create Task */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/tasks
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Create Task
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create a new task in the CRM system.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "title": "Follow up call",
  "description": "Schedule follow-up call with client",
  "dueDate": "2025-12-31T18:00:00.000Z",
  "priority": "high",
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
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">title</td>
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
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">dueDate</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Valid ISO 8601 date format</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">priority</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">low, medium, or high</td>
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
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Follow up call",
    "description": "Schedule follow-up call with client",
    "dueDate": "2025-12-31T18:00:00.000Z",
    "priority": "high",
    "completed": false,
    "completedAt": null,
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

      {/* Get Single Task */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/tasks/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Get Single Task
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve a specific task by ID.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of task
          </p>
        </div>
      </Card>

      {/* Update Task */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">PUT</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/tasks/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Update Task
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Update an existing task.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of task
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            All fields are optional. Provide only fields you want to update.
          </p>
        </div>
      </Card>

      {/* Delete Task */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/tasks/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Delete Task
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Delete a task from the system.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of task
          </p>
        </div>
      </Card>

      {/* Toggle Task Completion */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-purple-500 hover:bg-purple-600">PATCH</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/tasks/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Toggle Task Completion
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Toggle completion status of a task.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of task
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "completed": true
}`}</code>
              </pre>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              When setting <code>completed</code> to <code>true</code>, <code>completedAt</code> timestamp is automatically set. When setting to <code>false</code>, <code>completedAt</code> is cleared.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
