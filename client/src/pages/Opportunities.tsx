import { useEffect, useState } from 'react';
import { opportunitiesAPI, contactsAPI } from '../services/api';
import type { Opportunity, Contact } from '../types';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [oppsRes, contactsRes] = await Promise.all([
        opportunitiesAPI.getAll(),
        contactsAPI.getAll(),
      ]);
      setOpportunities(oppsRes.opportunities);
      setContacts(contactsRes.contacts);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      prospecting: 'bg-blue-100 text-blue-700',
      qualification: 'bg-purple-100 text-purple-700',
      proposal: 'bg-yellow-100 text-yellow-700',
      negotiation: 'bg-orange-100 text-orange-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-red-100 text-red-700',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Opportunities</h2>
        {hasRole('ADMIN', 'MANAGER', 'AGENT') && (
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5 mr-2" />
            Add Opportunity
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(opp.stage)}`}>
                    {opp.stage.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Contact: {getContactName(opp.contactId)}</p>
                {opp.description && (
                  <p className="text-sm text-gray-700 mb-4">{opp.description}</p>
                )}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>R{opp.value.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{opp.probability}% probability</span>
                  </div>
                  {opp.expectedCloseDate && (
                    <div className="text-gray-600">
                      Expected: {format(new Date(opp.expectedCloseDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No opportunities found</p>
        </div>
      )}
    </div>
  );
}
