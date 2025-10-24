import { useEffect, useState } from 'react';
import { activitiesAPI } from '../services/api';
import type { Activity } from '../types';
import { CheckSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const response = await activitiesAPI.getAll();
      setActivities(response.activities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    return type.toUpperCase();
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
      <h2 className="text-2xl font-bold text-gray-900">Activities</h2>

      <div className="grid grid-cols-1 gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-900">{activity.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status.toUpperCase()}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-700 mb-3 ml-8">{activity.description}</p>
                )}
                <div className="flex items-center space-x-6 text-sm ml-8">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {getTypeIcon(activity.type)}
                  </span>
                  {activity.dueDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Due: {format(new Date(activity.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No activities found</p>
        </div>
      )}
    </div>
  );
}
