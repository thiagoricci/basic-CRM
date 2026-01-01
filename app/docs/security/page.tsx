import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SecurityDocs() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Security</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Best practices and guidelines for secure API usage
        </p>
      </div>

      {/* Current State */}
      <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Current State (MVP)
          </h3>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li><strong>No authentication:</strong> All endpoints are publicly accessible</li>
            <li><strong>No rate limiting:</strong> Unlimited requests allowed</li>
            <li><strong>No input sanitization:</strong> Relies on Zod validation only</li>
            <li><strong>HTTPS:</strong> Recommended for production</li>
          </ul>
        </div>
      </Card>

      {/* Recommendations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Recommendations for Production
        </h2>

        {/* API Key Authentication */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            1. Add API Key Authentication
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Implement API key authentication to restrict access to authorized clients only.
          </p>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`// Middleware example
const API_KEYS = ['your-secret-key-1', 'your-secret-key-2'];

function validateApiKey(req) {
  const apiKey = req.headers['x-api-key'];
  return API_KEYS.includes(apiKey);
}

// Usage in API route
if (!validateApiKey(request)) {
  return NextResponse.json(
    { data: null, error: 'Invalid API key' },
    { status: 401 }
  );
}`}</code>
          </pre>
        </Card>

        {/* Rate Limiting */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            2. Implement Rate Limiting
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Prevent abuse by limiting the number of requests per time window.
          </p>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`// Using express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Apply to all API routes
app.use('/api', limiter);`}</code>
          </pre>
        </Card>

        {/* HTTPS */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            3. Enable HTTPS
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Use SSL certificates and enforce HTTPS for all API communications.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li>Use SSL certificates (Let's Encrypt is free)</li>
            <li>Enforce HTTPS redirects in your web server configuration</li>
            <li>Update API base URL to use <code className="px-1 bg-slate-100 dark:bg-slate-800 rounded">https://</code></li>
            <li>Set HSTS headers for additional security</li>
          </ul>
        </Card>

        {/* Request Logging */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            4. Add Request Logging
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Log all API requests for monitoring and debugging.
          </p>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`// Middleware example
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.path}\`);
  next();
});

// Log format includes:
// - Timestamp
// - HTTP method
// - Request path
// - IP address (add req.ip)
// - User agent (add req.headers['user-agent'])`}</code>
          </pre>
        </Card>

        {/* Input Validation */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            5. Input Validation
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Always validate and sanitize input on both client and server side.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
            <li>Use Zod schemas for type-safe validation</li>
            <li>Validate all required fields before processing</li>
            <li>Sanitize user input to prevent injection attacks</li>
            <li>Validate email formats and uniqueness</li>
            <li>Check phone number formats</li>
            <li>Validate UUIDs for ID parameters</li>
          </ul>
        </Card>

        {/* CORS Configuration */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            6. Configure CORS
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Configure Cross-Origin Resource Sharing for frontend applications.
          </p>
          <pre className="overflow-x-auto bg-slate-900 text-slate-100 p-4 rounded-lg text-sm">
            <code>{`// In Next.js API route
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://your-frontend-domain.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Add to all API routes
headers: {
  'Access-Control-Allow-Origin': 'https://your-frontend-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}`}</code>
          </pre>
        </Card>

        {/* Error Handling */}
        <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            7. Proper Error Handling
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Return appropriate HTTP status codes and error messages.
          </p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>400 Bad Request:</strong> Invalid input or validation errors</p>
            <p><strong>401 Unauthorized:</strong> Invalid or missing API key</p>
            <p><strong>403 Forbidden:</strong> Insufficient permissions</p>
            <p><strong>404 Not Found:</strong> Resource does not exist</p>
            <p><strong>429 Too Many Requests:</strong> Rate limit exceeded</p>
            <p><strong>500 Internal Server Error:</strong> Server error occurred</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
