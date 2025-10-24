import { useEffect, useState } from 'react';
import { ncrAPI } from '../services/api';
import type { NCR as NCRType } from '../types';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function NCR() {
  const [ncrs, setNcrs] = useState<NCRType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNCRs();
  }, []);

  async function loadNCRs() {
    try {
      const response = await ncrAPI.getAll();
      setNcrs(response.ncrs);
    } catch (error) {
      console.error('Failed to load NCRs:', error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      pending_verification: 'bg-blue-100 text-blue-700',
      closed: 'bg-green-100 text-green-700',
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
      <h2 className="text-2xl font-bold text-gray-900">Non-Conformance Reports</h2>

      <div className="grid grid-cols-1 gap-4">
        {ncrs.map((ncr) => (
          <div key={ncr.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  ncr.severity === 'critical' ? 'text-red-600' :
                  ncr.severity === 'high' ? 'text-orange-600' :
                  ncr.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ncr.title}</h3>
                    <span className="text-sm text-gray-500">{ncr.ncrNumber}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{ncr.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(ncr.severity)}`}>
                  {ncr.severity.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ncr.status)}`}>
                  {ncr.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="ml-9 space-y-2 text-sm">
              <div className="flex items-center space-x-4 text-gray-600">
                <span><strong>Department:</strong> {ncr.department}</span>
                {ncr.dueDate && (
                  <span><strong>Due:</strong> {format(new Date(ncr.dueDate), 'MMM d, yyyy')}</span>
                )}
              </div>

              {ncr.rootCause && (
                <div className="pt-3 border-t">
                  <p className="text-gray-700"><strong>Root Cause:</strong> {ncr.rootCause}</p>
                </div>
              )}

              {ncr.correctiveAction && (
                <div>
                  <p className="text-gray-700"><strong>Corrective Action:</strong> {ncr.correctiveAction}</p>
                </div>
              )}

              {ncr.preventiveAction && (
                <div>
                  <p className="text-gray-700"><strong>Preventive Action:</strong> {ncr.preventiveAction}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {ncrs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No NCRs found</p>
        </div>
      )}
    </div>
  );
}
