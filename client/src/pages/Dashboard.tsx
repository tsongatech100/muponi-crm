import { useEffect, useState } from 'react';
import { contactsAPI, opportunitiesAPI, activitiesAPI, ncrAPI } from '../services/api';
import type { Contact, Opportunity, Activity, NCR } from '../types';
import { Users, CheckSquare, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [contactsRes, oppsRes, activitiesRes, ncrsRes] = await Promise.all([
        contactsAPI.getAll(),
        opportunitiesAPI.getAll(),
        activitiesAPI.getAll(),
        ncrAPI.getAll(),
      ]);
      setContacts(contactsRes.contacts);
      setOpportunities(oppsRes.opportunities);
      setActivities(activitiesRes.activities);
      setNcrs(ncrsRes.ncrs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const openNcrs = ncrs.filter(n => n.status === 'open').length;

  const opportunitiesByStage = [
    { name: 'Prospecting', value: opportunities.filter(o => o.stage === 'prospecting').length },
    { name: 'Qualification', value: opportunities.filter(o => o.stage === 'qualification').length },
    { name: 'Proposal', value: opportunities.filter(o => o.stage === 'proposal').length },
    { name: 'Negotiation', value: opportunities.filter(o => o.stage === 'negotiation').length },
    { name: 'Won', value: opportunities.filter(o => o.stage === 'closed_won').length },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pipeline Value</p>
              <p className="text-3xl font-bold text-gray-900">R{(totalValue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Activities</p>
              <p className="text-3xl font-bold text-gray-900">{pendingActivities}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Open NCRs</p>
              <p className="text-3xl font-bold text-gray-900">{openNcrs}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunities by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={opportunitiesByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={opportunitiesByStage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => entry.value > 0 ? `${entry.name}: ${entry.value}` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {opportunitiesByStage.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <CheckSquare className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.subject}</p>
                  <p className="text-xs text-gray-500">
                    {activity.type.toUpperCase()} • {activity.status}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No activities yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Open NCRs</h3>
          <div className="space-y-3">
            {ncrs.filter(n => n.status === 'open').slice(0, 5).map((ncr) => (
              <div key={ncr.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                  ncr.severity === 'critical' ? 'text-red-600' :
                  ncr.severity === 'high' ? 'text-orange-600' :
                  ncr.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ncr.title}</p>
                  <p className="text-xs text-gray-500">
                    {ncr.ncrNumber} • {ncr.severity.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
            {ncrs.filter(n => n.status === 'open').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No open NCRs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
