import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CompaniesDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Companies API</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage company accounts in CRM system
        </p>
      </div>

      {/* List Companies */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/companies
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            List All Companies
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve all companies in the system with optional filtering.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Query Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Parameter</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">search</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Search by company name (case-insensitive)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">industry</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Filter by industry</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">page</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Page number (default: 1)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">limit</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Items per page (default: 20)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Success Response (200 OK)
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-4466554400000",
      "name": "Acme Corporation",
      "industry": "Technology",
      "website": "https://acme.com",
      "phone": "+1-555-0000",
      "address": "123 Tech Street, San Francisco, CA 94102",
      "employeeCount": 500,
      "revenue": 50000000,
      "createdAt": "2025-12-30T18:30:00.000Z",
      "updatedAt": "2025-12-30T18:30:00.000Z"
    }
  ],
  "error": null
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </Card>

      {/* Create Company */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/companies
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Create Company
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create a new company in the CRM system.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "name": "Acme Corporation",
  "industry": "Technology",
  "website": "https://acme.com",
  "phone": "+1-555-0000",
  "address": "123 Tech Street, San Francisco, CA 94102",
  "employeeCount": 500,
  "revenue": 50000000
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
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">name</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">1-255 characters, must be unique</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">industry</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Max 100 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">website</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Valid URL format</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">phone</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">10-20 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">address</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Max 500 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">employeeCount</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Positive integer</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">revenue</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Positive number</td>
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
    "id": "550e8400-e29b-41d4-a716-4466554400000",
    "name": "Acme Corporation",
    "industry": "Technology",
    "website": "https://acme.com",
    "phone": "+1-555-0000",
    "address": "123 Tech Street, San Francisco, CA 94102",
    "employeeCount": 500,
    "revenue": 50000000,
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

      {/* Get Single Company */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/companies/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Get Single Company
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve a specific company by ID with its contacts and deals.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of company
          </p>
        </div>
      </Card>

      {/* Update Company */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">PUT</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/companies/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Update Company
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Update an existing company.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of company
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            All fields are optional. Provide only fields you want to update.
          </p>
        </div>
      </Card>

      {/* Delete Company */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/companies/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Delete Company
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Delete a company from the system.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of company
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 text-amber-900 dark:text-amber-100 uppercase tracking-wide">
              Important: Cascade Delete Behavior
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              When a company is deleted, all associated contacts and deals will have their <code className="px-1 bg-amber-100 dark:bg-amber-800 rounded">companyId</code> set to <code className="px-1 bg-amber-100 dark:bg-amber-800 rounded">null</code>. The contacts and deals themselves are NOT deleted, only unlinked from the company.
            </p>
          </div>
        </div>
      </Card>

      {/* Linking Contacts to Companies */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Linking Contacts to Companies
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            To link a contact to a company, include the <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">companyId</code> field when creating or updating a contact.
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Create Contact with Company</h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`curl -X POST http://localhost:3000/api/contacts \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "status": "lead",
    "jobTitle": "Software Engineer",
    "companyId": "550e8400-e29b-41d4-a716-4466554400000"
  }'`}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Link Existing Contact to Company</h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440001 \\
  -H "Content-Type: application/json" \\
  -d '{
    "companyId": "550e8400-e29b-41d4-a716-4466554400000"
  }'`}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Unlink Contact from Company</h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440001 \\
  -H "Content-Type: application/json" \\
  -d '{
    "companyId": ""
  }'`}</code>
              </pre>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              <strong>Note:</strong> When you set <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">companyId</code> to an empty string or <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">null</code>, the contact will be unlinked from its current company.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
