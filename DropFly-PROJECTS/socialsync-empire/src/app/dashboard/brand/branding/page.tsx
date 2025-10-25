'use client';

import { useEffect, useState } from 'react';

interface BrandVoiceConfig {
  company: {
    name: string;
    location: string;
    tagline: string;
  };
  brandVoice: {
    core: string;
    essence: string;
    principles: string[];
  };
  products: Array<{
    name: string;
    description: string;
    useCases: string[];
  }>;
  lastUpdated: string;
  version: string;
}

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandVoiceConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/brand-voice');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/brand-voice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Brand voice updated successfully!');
        setEditing(false);
        fetchConfig(); // Refresh to get new version
      } else {
        setMessage('❌ Failed to update brand voice');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage('❌ Error saving configuration');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateCompany = (field: keyof BrandVoiceConfig['company'], value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      company: { ...config.company, [field]: value }
    });
  };

  const updateBrandVoice = (field: keyof BrandVoiceConfig['brandVoice'], value: string | string[]) => {
    if (!config) return;
    setConfig({
      ...config,
      brandVoice: { ...config.brandVoice, [field]: value }
    });
  };

  const updatePrinciple = (index: number, value: string) => {
    if (!config) return;
    const newPrinciples = [...config.brandVoice.principles];
    newPrinciples[index] = value;
    updateBrandVoice('principles', newPrinciples);
  };

  const addPrinciple = () => {
    if (!config) return;
    updateBrandVoice('principles', [...config.brandVoice.principles, '']);
  };

  const removePrinciple = (index: number) => {
    if (!config) return;
    const newPrinciples = config.brandVoice.principles.filter((_, i) => i !== index);
    updateBrandVoice('principles', newPrinciples);
  };

  const updateProduct = (index: number, field: string, value: string) => {
    if (!config) return;
    const newProducts = [...config.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setConfig({ ...config, products: newProducts });
  };

  const addProduct = () => {
    if (!config) return;
    setConfig({
      ...config,
      products: [...config.products, { name: '', description: '', useCases: [] }]
    });
  };

  const removeProduct = (index: number) => {
    if (!config) return;
    const newProducts = config.products.filter((_, i) => i !== index);
    setConfig({ ...config, products: newProducts });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading brand configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Voice Configuration</h1>
              <p className="text-gray-600">
                Manage your brand identity, voice, products, and content strategy
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Version {config.version} • Last updated: {config.lastUpdated}
              </p>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Branding
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchConfig();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
          {message && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
              {message}
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={config.company.name}
                onChange={(e) => updateCompany('name', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={config.company.location}
                onChange={(e) => updateCompany('location', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <textarea
                value={config.company.tagline}
                onChange={(e) => updateCompany('tagline', e.target.value)}
                disabled={!editing}
                rows={2}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Brand Voice */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Brand Voice</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Core Voice</label>
              <input
                type="text"
                value={config.brandVoice.core}
                onChange={(e) => updateBrandVoice('core', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                placeholder="e.g., Professional Expert + Friendly Teacher + Urban Authenticity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Essence</label>
              <input
                type="text"
                value={config.brandVoice.essence}
                onChange={(e) => updateBrandVoice('essence', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                placeholder="e.g., Your neighbor who got smart about AI..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Principles
              </label>
              {config.brandVoice.principles.map((principle, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={principle}
                    onChange={(e) => updatePrinciple(index, e.target.value)}
                    disabled={!editing}
                    className="flex-1 px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                  {editing && (
                    <button
                      onClick={() => removePrinciple(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {editing && (
                <button
                  onClick={addPrinciple}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  + Add Principle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Products & Services</h2>
          {config.products.map((product, index) => (
            <div key={index} className="mb-6 p-4 border rounded-md">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    disabled={!editing}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    disabled={!editing}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
                {editing && (
                  <button
                    onClick={() => removeProduct(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove Product
                  </button>
                )}
              </div>
            </div>
          ))}
          {editing && (
            <button
              onClick={addProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Add Product
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 How to Use This</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Click "Edit Branding" to modify any section</li>
            <li>• All content generation will automatically use your updated brand voice</li>
            <li>• Changes are saved to config/brand-voice.json</li>
            <li>• Version number auto-increments with each save</li>
            <li>• Your partner can also update this when they have access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
