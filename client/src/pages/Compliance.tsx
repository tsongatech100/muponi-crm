import { useEffect, useState } from 'react';
import { consentAPI, dsrAPI, contactsAPI } from '../services/api';
import type { Consent, DSRRequest, Contact } from '../types';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Compliance() {
  const [dsrRequests, setDsrRequests] = useState<DSRRequest[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadConsents(selectedContact);
    }
  }, [selectedContact]);

  async function loadData() {
    try {
      const [dsrRes, contactsRes] = await Promise.all([
        dsrAPI.getAll(),
        contactsAPI.getAll(),
      ]);
      setDsrRequests(dsrRes.requests);
      setContacts(contactsRes.contacts);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadConsents(contactId: string) {
    try {
      const response = await consentAPI.getByContact(contactId);
      setConsents(response.consents);
    } catch (error) {
      console.error('Failed to load consents:', error);
      setConsents([]);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
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
      <div className="flex items-center space-x-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">POPIA Compliance</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Subject Requests</h3>
          <div className="space-y-3">
            {dsrRequests.map((request) => (
              <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{request.requestNumber}</p>
                    <p className="text-sm text-gray-600">{request.type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {request.description && (
                  <p className="text-sm text-gray-700">{request.description}</p>
                )}
              </div>
            ))}
            {dsrRequests.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No DSR requests</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent Management</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Contact
            </label>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName} ({contact.email})
                </option>
              ))}
            </select>
          </div>

          {selectedContact && (
            <div className="space-y-2">
              {consents.map((consent) => (
                <div key={consent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {consent.granted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {consent.purpose.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {consent.granted ? 'Granted' : 'Withdrawn'} via {consent.source}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {consents.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No consent records</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">POPIA Compliance Features</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Consent tracking for all data processing purposes
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Data Subject Rights (access, rectify, delete, restrict)
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Automated data retention with legal hold protection
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Comprehensive audit logging for all data operations
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Data breach incident management and reporting
          </li>
        </ul>
      </div>
    </div>
  );
}
