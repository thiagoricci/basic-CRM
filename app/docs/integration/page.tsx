import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IntegrationDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Integration Examples</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Code samples and guides for integrating with the CRM API
        </p>
      </div>

      {/* JavaScript / Node.js */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            JavaScript / Node.js
          </h3>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`const API_BASE_URL = 'http://localhost:3000/api';

async function createContact(contactData) {
  const response = await fetch(\`\${API_BASE_URL}/contacts\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data;
}

// Usage
const newContact = await createContact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0123',
  status: 'lead',
});

console.log('Created contact:', newContact);`}</code>
          </pre>
        </div>
      </Card>

      {/* Python */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Python
          </h3>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`import requests
import json

API_BASE_URL = 'http://localhost:3000/api'

def create_contact(contact_data):
    response = requests.post(
        f'{API_BASE_URL}/contacts',
        headers={'Content-Type': 'application/json'},
        json=contact_data
    )
    result = response.json()
    
    if result.get('error'):
        raise Exception(result['error'])
    
    return result['data']

# Usage
new_contact = create_contact({
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john.doe@example.com',
    'phoneNumber': '+1-555-0123',
    'status': 'lead'
})

print('Created contact:', new_contact)`}</code>
          </pre>
        </div>
      </Card>

      {/* PHP */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            PHP
          </h3>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`<?php

$API_BASE_URL = 'http://localhost:3000/api';

function createContact($contactData) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $API_BASE_URL . '/contacts');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($contactData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);

    $response = curl_exec($ch);
    $result = json_decode($response, true);

    curl_close($ch);

    if ($result['error']) {
        throw new Exception($result['error']);
    }

    return $result['data'];
}

// Usage
$newContact = createContact([
    'firstName' => 'John',
    'lastName' => 'Doe',
    'email' => 'john.doe@example.com',
    'phoneNumber' => '+1-555-0123',
    'status' => 'lead'
]);

print_r($newContact);
?>`}</code>
          </pre>
        </div>
      </Card>

      {/* Ruby */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Ruby
          </h3>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`require 'net/http'
require 'json'
require 'uri'

API_BASE_URL = 'http://localhost:3000/api'

def create_contact(contact_data)
  uri = URI("#{API_BASE_URL}/contacts")

  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
  request.body = contact_data.to_json

  response = http.request(request)
  result = JSON.parse(response.body)

  raise result['error'] if result['error']

  result['data']
end

# Usage
new_contact = create_contact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0123',
  status: 'lead'
})

puts new_contact.inspect`}</code>
          </pre>
        </div>
      </Card>

      {/* cURL */}
      <Card className="overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            cURL
          </h3>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`# Create a contact
curl -X POST http://localhost:3000/api/contacts \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0123",
    "status": "lead"
  }'

# List all contacts
curl http://localhost:3000/api/contacts

# Get specific contact
curl http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000

# Update contact
curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000 \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "status": "customer"
  }'

# Delete contact
curl -X DELETE http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000`}</code>
          </pre>
        </div>
      </Card>

      {/* Error Handling Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Error Handling Best Practices</h2>
        
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Retry Logic</h3>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`async function createContactWithRetry(contactData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createContact(contactData);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Duplicate Email Handling</h3>
              <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
                <code>{`async function createContactSafe(contactData) {
  try {
    return await createContact(contactData);
  } catch (error) {
    if (error.message === 'Email already exists') {
      // Option 1: Update existing contact
      console.log('Contact already exists, updating...');
      return await updateContactByEmail(contactData.email, contactData);

      // Option 2: Skip silently
      // console.log('Contact already exists, skipping...');
      // return null;

      // Option 3: Throw error
      // throw error;
    }
    throw error;
  }
}`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
