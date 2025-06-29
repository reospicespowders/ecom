'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function TestCustomerPage() {
  const { user, isSignedIn } = useUser();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCustomerCreation = async () => {
    if (!isSignedIn) {
      setResult({ error: 'User not signed in' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Customer Creation Test</h1>
      
      <div className="mb-4">
        <p><strong>User ID:</strong> {user?.id || 'Not signed in'}</p>
        <p><strong>Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
      </div>

      <Button 
        onClick={testCustomerCreation} 
        disabled={loading || !isSignedIn}
        className="mb-4"
      >
        {loading ? 'Testing...' : 'Test Customer Creation'}
      </Button>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 