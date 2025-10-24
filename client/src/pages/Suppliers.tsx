import { useEffect, useState } from 'react';
import { suppliersAPI } from '../services/api';
import type { Supplier } from '../types';
import { Package, Star } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.suppliers);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">{supplier.code}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                {supplier.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Category:</strong> {supplier.category}
              </p>
              {supplier.contactPerson && (
                <p className="text-sm text-gray-700">
                  <strong>Contact:</strong> {supplier.contactPerson}
                </p>
              )}
              {supplier.email && (
                <p className="text-sm text-gray-700 truncate">
                  <strong>Email:</strong> {supplier.email}
                </p>
              )}
            </div>

            {supplier.evaluationScore !== null && supplier.evaluationScore !== undefined && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Evaluation Score</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {supplier.evaluationScore.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No suppliers found</p>
        </div>
      )}
    </div>
  );
}
