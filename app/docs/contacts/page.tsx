import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ContactsDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Contacts API</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage customer contacts in the CRM system
        </p>
      </div>

      {/* Create Contact */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/contacts
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Create Contact
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create a new contact in the CRM system.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1-555-0123",
  "status": "lead"
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
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">firstName</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">1-50 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">lastName</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">1-50 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">email</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Valid email, must be unique</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">phoneNumber</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">10-20 characters, must be unique</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">status</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Must be "lead" or "customer"</td>
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead",
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

      {/* List Contacts */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/contacts
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            List All Contacts
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve all contacts in the system.
          </p>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1-555-0123",
      "status": "lead",
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z"
    }
  ],
  "error": null
}`}</code>
          </pre>
        </div>
      </Card>

      {/* Get Single Contact */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/contacts/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Get Single Contact
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve a specific contact by ID.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of the contact
          </p>
        </div>
      </Card>

      {/* Update Contact */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">PUT</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/contacts/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Update Contact
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Update an existing contact.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of the contact
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Request body is the same as Create Contact (all fields optional except email uniqueness check).
          </p>
        </div>
      </Card>

      {/* Delete Contact */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/contacts/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Delete Contact
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Delete a contact from the system. This will also delete all associated activities, tasks, and deals.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of the contact
          </p>
        </div>
      </Card>
    </div>
  );
}
