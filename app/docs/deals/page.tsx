import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DealsDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Deals API</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track sales pipeline and opportunities
        </p>
      </div>

      {/* List Deals */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/deals
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            List All Deals
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve all deals with optional filtering.
          </p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Query Parameters:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>stage</code> - Filter by stage (lead, qualified, proposal, negotiation, closed_won, closed_lost)</li>
              <li><code>status</code> - Filter by status (open, won, lost)</li>
              <li><code>minValue</code> - Filter deals with value greater than or equal to</li>
              <li><code>maxValue</code> - Filter deals with value less than or equal to</li>
              <li><code>startDate</code> - Filter deals with expected close date on or after</li>
              <li><code>endDate</code> - Filter deals with expected close date on or before</li>
              <li><code>search</code> - Search by name</li>
              <li><code>contactId</code> - Filter by contact ID (UUID)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Create Deal */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/deals
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Create Deal
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create a new deal in the CRM system.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "name": "Enterprise License",
  "value": 50000,
  "stage": "proposal",
  "expectedCloseDate": "2025-12-31T18:00:00.000Z",
  "status": "open",
  "probability": 60,
  "description": "Annual enterprise license agreement",
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
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">name</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">1-255 characters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">value</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Must be positive</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">stage</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">lead, qualified, proposal, negotiation, closed_won, closed_lost</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">expectedCloseDate</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Valid ISO 8601 date format</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">status</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">string</td>
                      <td className="px-4 py-2"><Badge variant="default">Yes</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">open, won, or lost</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">probability</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2"><Badge variant="secondary">No</Badge></td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">0-100 (default: 0)</td>
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
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Enterprise License",
    "value": 50000,
    "stage": "proposal",
    "expectedCloseDate": "2025-12-31T18:00:00.000Z",
    "actualCloseDate": null,
    "status": "open",
    "probability": 60,
    "description": "Annual enterprise license agreement",
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

      {/* Get Single Deal */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/deals/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Get Single Deal
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve a specific deal by ID.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of deal
          </p>
        </div>
      </Card>

      {/* Update Deal */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">PUT</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/deals/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Update Deal
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Update an existing deal.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of deal
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            All fields are optional. Provide only fields you want to update.
          </p>
        </div>
      </Card>

      {/* Update Deal Stage */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-purple-500 hover:bg-purple-600">PATCH</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/deals/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Update Deal Stage
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Update the stage and status of a deal.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of deal
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Request Body
              </h4>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`{
  "stage": "closed_won",
  "status": "won"
}`}</code>
              </pre>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              When moving to <code>closed_won</code> stage, status automatically becomes <code>'won'</code>. When moving to <code>closed_lost</code> stage, status automatically becomes <code>'lost'</code>. For other stages, status becomes <code>'open'</code>.
            </p>
          </div>
        </div>
      </Card>

      {/* Delete Deal */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/deals/{'{id}'}
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Delete Deal
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Delete a deal from the system.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>URL Parameter:</strong> <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">id</code> (string) - UUID of deal
          </p>
        </div>
      </Card>
    </div>
  );
}
