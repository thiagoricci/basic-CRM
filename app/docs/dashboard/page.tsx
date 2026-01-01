import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard API</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Retrieve analytics and insights
        </p>
      </div>

      {/* Get Dashboard Data */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
            <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
              /api/dashboard
            </code>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            Get Dashboard Data
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Retrieve dashboard analytics and recent data.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Response Fields
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Field</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">totalContacts</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Total number of contacts in system</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">totalLeads</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Number of contacts with status "lead"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">totalCustomers</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Number of contacts with status "customer"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">conversionRate</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Percentage of customers (customers / total * 100)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">contacts</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">array</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Last 5 contacts created</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">recentActivities</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">array</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Last 5 activities created</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">growthData</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">array</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Contact growth data for last 30 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">tasksDueToday</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Number of tasks due today (not completed)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">upcomingTasks</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">array</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Next 5 upcoming tasks (not completed, ordered by due date)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">totalDeals</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Total number of deals in system</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">totalDealValue</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Total value of all deals</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">wonDeals</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Number of deals with status "won"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">lostDeals</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Number of deals with status "lost"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">winRate</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">number</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Win rate percentage (won / (won + lost) * 100)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">recentDeals</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">array</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Last 5 deals created</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-slate-900 dark:text-slate-100">pipelineData</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">array</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Deal count and total value by stage</td>
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
  "data": {
    "totalContacts": 150,
    "totalLeads": 100,
    "totalCustomers": 50,
    "conversionRate": 33.33,
    "contacts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "status": "lead",
        "createdAt": "2025-12-30T18:30:00.000Z"
      }
    ],
    "recentActivities": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "type": "call",
        "subject": "Initial consultation",
        "createdAt": "2025-12-30T18:30:00.000Z",
        "contact": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "growthData": [
      {
        "date": "Dec 1",
        "count": 5
      },
      {
        "date": "Dec 2",
        "count": 3
      }
    ],
    "tasksDueToday": 5,
    "upcomingTasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "title": "Follow up call",
        "dueDate": "2025-12-31T18:00:00.000Z",
        "priority": "high",
        "completed": false,
        "contactId": "550e8400-e29b-41d4-a716-446655440000",
        "contact": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "totalDeals": 20,
    "totalDealValue": 150000,
    "wonDeals": 8,
    "lostDeals": 3,
    "winRate": 72.73,
    "recentDeals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Enterprise License",
        "value": 50000,
        "stage": "proposal",
        "status": "open",
        "createdAt": "2025-12-30T18:30:00.000Z",
        "contact": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pipelineData": [
      {
        "stage": "lead",
        "count": 5,
        "value": 25000
      },
      {
        "stage": "qualified",
        "count": 3,
        "value": 30000
      },
      {
        "stage": "proposal",
        "count": 4,
        "value": 45000
      },
      {
        "stage": "negotiation",
        "count": 2,
        "value": 25000
      },
      {
        "stage": "closed_won",
        "count": 8,
        "value": 100000
      },
      {
        "stage": "closed_lost",
        "count": 3,
        "value": 15000
      }
    ]
  },
  "error": null
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
