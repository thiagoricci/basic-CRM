import { Card } from '@/components/ui/card';

export default function WebhooksDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Webhooks</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Automate workflows with external integrations
        </p>
      </div>

      {/* Zapier */}
      <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Zapier Integration
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>Create a Zap with your trigger app (e.g., Typeform, Google Forms)</li>
          <li>Add "Webhooks by Zapier" as action</li>
          <li>Choose "POST" method</li>
          <li>URL: <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">http://your-domain.com/api/contacts</code></li>
          <li>Headers: <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">Content-Type: application/json</code></li>
          <li>Payload: Map form fields to JSON structure</li>
        </ol>
        <div>
          <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Example Zapier payload mapping:
          </h4>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`{
  "firstName": "{{First Name}}",
  "lastName": "{{Last Name}}",
  "email": "{{Email}}",
  "phoneNumber": "{{Phone Number}}",
  "status": "lead"
}`}</code>
          </pre>
        </div>
      </Card>

      {/* Make.com */}
      <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Make.com (Integromat) Integration
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>Create a new scenario</li>
          <li>Add "Webhooks" module → "Make a webhook request"</li>
          <li>Method: POST</li>
          <li>URL: <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">http://your-domain.com/api/contacts</code></li>
          <li>Headers: <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">Content-Type: application/json</code></li>
          <li>Body: JSON structure with mapped variables</li>
        </ol>
      </Card>

      {/* n8n */}
      <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          n8n Workflow
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>Create a new workflow</li>
          <li>Add "Webhook" trigger node</li>
          <li>Set method to POST</li>
          <li>Add "HTTP Request" node</li>
          <li>Configure:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Method: POST</li>
              <li>URL: <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">http://your-domain.com/api/contacts</code></li>
              <li>Authentication: None</li>
              <li>Body Content Type: JSON</li>
            </ul>
          </li>
          <li>Map webhook data to body parameters</li>
        </ol>
        <div>
          <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Example body parameters:
          </h4>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`firstName: {{$json.firstName}}
lastName: {{$json.lastName}}
email: {{$json.email}}
phoneNumber: {{$json.phoneNumber}}
status: {{$json.status}}`}</code>
          </pre>
        </div>
      </Card>

      {/* Custom Webhook Handler */}
      <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Custom Webhook Handler (Node.js Example)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a custom webhook handler to transform and forward data to the CRM API.
        </p>
        <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
          <code>{`// webhook-handler.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/contact', async (req, res) => {
  try {
    // Transform incoming webhook data to CRM format
    const contactData = {
      firstName: req.body.first_name || req.body.firstName,
      lastName: req.body.last_name || req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phone || req.body.phoneNumber,
      status: req.body.status || 'lead',
    };

    // Forward to CRM API
    const response = await fetch('http://localhost:3000/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const result = await response.json();

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, contact: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(4000, () => {
  console.log('Webhook handler running on port 4000');
});`}</code>
        </pre>
      </Card>
    </div>
  );
}
