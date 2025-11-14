import { useState, useEffect } from 'react';
import { meetingService } from '../../services/meetingService';
import { Calendar, Clock, Video, X, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/helpers';

export const TutorMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await meetingService.getMyMeetings();
      setMeetings(data.meetings || []);
    } catch (error) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (meetingId) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      await meetingService.cancelMeeting(meetingId);
      toast.success('Meeting cancelled successfully');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to cancel meeting');
    }
  };

  const upcoming = meetings.filter(
    m => m.status === 'scheduled' && new Date(m.scheduledAt) > new Date()
  );
  const past = meetings.filter(
    m => m.status !== 'scheduled' || new Date(m.scheduledAt) <= new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-3 rounded-xl mr-4">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Meetings</h1>
              <p className="text-gray-600 mt-1">Manage your scheduled sessions</p>
            </div>
          </div>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Meetings */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming ({upcoming.length})
              </h2>
            </div>

            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No upcoming meetings</p>
                  <p className="text-gray-500 text-sm mt-2">New bookings will appear here</p>
                </div>
              ) : (
                upcoming.map(m => (
                  <div
                    key={m._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-green-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                        {m.subject}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {m.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-gray-900 mb-4">{m.topic}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700 bg-gray-50 rounded-lg p-3">
                        <User className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="font-medium">Student: {m.studentId?.name}</span>
                      </div>

                      <div className="flex items-center text-gray-700 bg-gray-50 rounded-lg p-3">
                        <Clock className="h-5 w-5 mr-3 text-purple-500" />
                        <span className="font-medium">
                          {formatDateTime(
                            m.scheduledAt.split('T')[0],
                            m.scheduledAt.split('T')[1].substring(0, 5)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={m.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all transform hover:scale-[1.02] shadow-md"
                      >
                        <Video className="h-5 w-5 mr-2" />
                        Join Meeting
                      </a>
                      <button
                        onClick={() => handleCancel(m._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center transition-all shadow-md"
                      >
                        <X className="h-5 w-5 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Meetings */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Past ({past.length})
              </h2>
            </div>

            <div className="space-y-4">
              {past.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No past meetings</p>
                  <p className="text-gray-500 text-sm mt-2">Completed sessions will appear here</p>
                </div>
              ) : (
                past.map(m => (
                  <div
                    key={m._id}
                    className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-bold">
                        {m.subject}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          m.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-3">{m.topic}</h3>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Student: {m.studentId?.name}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDateTime(
                          m.scheduledAt.split('T')[0],
                          m.scheduledAt.split('T')[1].substring(0, 5)
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
