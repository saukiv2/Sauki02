'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ApiProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  lastChecked: Date | null;
  config: {
    apiKeyExists: boolean;
    secretKeyExists: boolean;
    additionalConfig?: Record<string, boolean>;
  };
  testUrl?: string;
  docs?: string;
}

const PROVIDERS: ApiProvider[] = [
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    status: 'active',
    category: 'Payment Gateway',
    lastChecked: new Date(),
    config: {
      apiKeyExists: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      secretKeyExists: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      additionalConfig: {
        webhookEnabled: true,
      },
    },
    testUrl: 'https://dashboard.flutterwave.com',
    docs: 'https://developer.flutterwave.com/docs',
  },
  {
    id: 'interswitch',
    name: 'Interswitch',
    status: 'active',
    category: 'Payment Gateway',
    lastChecked: new Date(),
    config: {
      apiKeyExists: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      secretKeyExists: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
    },
    testUrl: 'https://sandbox.interswitchng.com',
    docs: 'https://developer.interswitchng.com',
  },
  {
    id: 'amigo',
    name: 'Amigo Data',
    status: 'active',
    category: 'Data Provider',
    lastChecked: new Date(),
    config: {
      apiKeyExists: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      secretKeyExists: false,
    },
    testUrl: 'https://api.amigosms.com',
    docs: 'https://amigosms.com/documentation',
  },
  {
    id: 'firebase',
    name: 'Firebase',
    status: 'active',
    category: 'Notifications',
    lastChecked: new Date(),
    config: {
      apiKeyExists: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
      secretKeyExists: true,
      additionalConfig: {
        projectId: true,
        cloudMessaging: true,
      },
    },
    docs: 'https://firebase.google.com/docs',
  },
];

export default function CustomApisPage() {
  const [providers, setProviders] = useState<ApiProvider[]>(PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  async function handleTest(provider: ApiProvider) {
    setTestingId(provider.id);
    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setProviders((list) =>
        list.map((p) =>
          p.id === provider.id
            ? { ...p, status: 'active', lastChecked: new Date() }
            : p
        )
      );
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTestingId(null);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'inactive':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="danger">Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return null;
    }
  };

  const categories = ['Payment Gateway', 'Data Provider', 'Notifications'];
  const groupedProviders = categories.map((cat) => ({
    category: cat,
    providers: providers.filter((p) => p.category === cat),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Custom API Configuration</h1>
        <p className="text-gray-600 mt-1">
          View and manage third-party API providers and integrations
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Total Providers</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{providers.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {providers.filter((p) => p.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {providers.filter((p) => p.status === 'inactive').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {providers.filter((p) => p.status === 'pending').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Providers by Category */}
      {groupedProviders.map(
        (group) =>
          group.providers.length > 0 && (
            <div key={group.category} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">{group.category}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.providers.map((provider) => (
                  <Card key={provider.id} className="hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(provider.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {provider.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {provider.category}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(provider.status)}
                      </div>

                      {/* Config Summary */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">API Key:</span>
                          <span
                            className={
                              provider.config.apiKeyExists
                                ? 'text-green-600 font-medium'
                                : 'text-red-600'
                            }
                          >
                            {provider.config.apiKeyExists ? '✓ Configured' : '✗ Missing'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Secret Key:</span>
                          <span
                            className={
                              provider.config.secretKeyExists
                                ? 'text-green-600 font-medium'
                                : 'text-red-600'
                            }
                          >
                            {provider.config.secretKeyExists
                              ? '✓ Configured'
                              : '✗ Missing'}
                          </span>
                        </div>
                      </div>

                      {/* Last Checked */}
                      {provider.lastChecked && (
                        <div className="text-xs text-gray-500 mb-4">
                          Last checked:{' '}
                          {new Date(provider.lastChecked).toLocaleString()}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleTest(provider)}
                          isLoading={testingId === provider.id}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={13} />
                          Test Connection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowDetails(true);
                          }}
                          className="flex-1"
                        >
                          Details
                        </Button>
                        {provider.testUrl && (
                          <a
                            href={provider.testUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              title="Open provider dashboard"
                            >
                              <ExternalLink size={13} />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={selectedProvider?.name}
        size="md"
      >
        {selectedProvider && (
          <div className="space-y-4">
            {/* Status & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-medium uppercase">Status</p>
                <div className="mt-1">{getStatusBadge(selectedProvider.status)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium uppercase">Category</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {selectedProvider.category}
                </p>
              </div>
            </div>

            {/* Configuration Details */}
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase mb-2">
                Configuration
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">API Key</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {showSecrets['apiKey']
                        ? 'sk_live_xxx...xxx'
                        : '••••••••••••'}
                    </code>
                    <button
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          apiKey: !prev.apiKey,
                        }))
                      }
                    >
                      {showSecrets['apiKey'] ? (
                        <EyeOff size={14} className="text-gray-400" />
                      ) : (
                        <Eye size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">Secret Key</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {showSecrets['secretKey']
                        ? 'sk_secret_xxx...xxx'
                        : '••••••••••••'}
                    </code>
                    <button
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          secretKey: !prev.secretKey,
                        }))
                      }
                    >
                      {showSecrets['secretKey'] ? (
                        <EyeOff size={14} className="text-gray-400" />
                      ) : (
                        <Eye size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Checked */}
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase">
                Last Checked
              </p>
              <p className="text-sm text-gray-900 mt-1">
                {selectedProvider.lastChecked
                  ? new Date(selectedProvider.lastChecked).toLocaleString()
                  : 'Never'}
              </p>
            </div>

            {/* Documentation Link */}
            {selectedProvider.docs && (
              <div className="pt-2">
                <a
                  href={selectedProvider.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  View Documentation
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* Close Button */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
