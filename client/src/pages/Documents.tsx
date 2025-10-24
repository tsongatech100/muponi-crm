import { useEffect, useState } from 'react';
import { documentsAPI } from '../services/api';
import type { Document } from '../types';
import { FileText } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      obsolete: 'bg-red-100 text-red-700',
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
      <h2 className="text-2xl font-bold text-gray-900">ISO 9001 Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                  <p className="text-sm text-gray-500">{doc.documentNumber} • v{doc.version}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                {doc.status.toUpperCase()}
              </span>
            </div>

            {doc.description && (
              <p className="text-sm text-gray-700 mb-3">{doc.description}</p>
            )}

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{doc.type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-medium">{doc.department}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No documents found</p>
        </div>
      )}
    </div>
  );
}
