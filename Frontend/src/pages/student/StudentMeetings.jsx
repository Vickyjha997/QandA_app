import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { Calendar, Clock, Video, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/helpers';

export const StudentMeetings = () => {
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
      toast.success('Meeting cancelled');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to cancel meeting');
    }
  };

  const upcoming = meetings.filter(m => m.status === 'scheduled' && new Date(m.scheduledAt) > new Date());
  const past = meetings.filter(m => m.status !== 'scheduled' || new Date(m.scheduledAt) <= new Date());

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Meetings</h1>
        <Link to="/student/tutors" className="btn-primary flex items-center"><Plus className="h-5 w-5 mr-2" />Book Meeting</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2 text-green-500" />Upcoming ({upcoming.length})</h2>
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="card text-center py-8"><Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-600">No upcoming meetings</p></div>
            ) : (
              upcoming.map(m => (
                <div key={m._id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <span className="badge-primary">{m.subject}</span>
                    <span className="badge-success">{m.status}</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">{m.topic}</p>
                  <p className="text-sm text-gray-600 mb-2">Tutor: {m.tutorId?.name}</p>
                  <p className="text-sm text-gray-600 mb-3 flex items-center"><Clock className="h-4 w-4 mr-1" />{formatDateTime(m.scheduledAt.split('T')[0], m.scheduledAt.split('T')[1].substring(0, 5))}</p>
                  <div className="flex gap-2">
                    <a href={m.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 flex items-center justify-center"><Video className="h-4 w-4 mr-2" />Join</a>
                    <button onClick={() => handleCancel(m._id)} className="btn-danger flex items-center"><X className="h-4 w-4 mr-1" />Cancel</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center"><Clock className="h-5 w-5 mr-2 text-gray-500" />Past ({past.length})</h2>
          <div className="space-y-4">
            {past.length === 0 ? (
              <div className="card text-center py-8"><Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-600">No past meetings</p></div>
            ) : (
              past.map(m => (
                <div key={m._id} className="card opacity-75">
                  <span className="badge-primary mb-2">{m.subject}</span>
                  <p className="font-semibold text-gray-900 mb-1">{m.topic}</p>
                  <p className="text-sm text-gray-600">Tutor: {m.tutorId?.name}</p>
                  <p className="text-sm text-gray-600">{formatDateTime(m.scheduledAt.split('T')[0], m.scheduledAt.split('T')[1].substring(0, 5))}</p>
                  <span className={`badge mt-2 ${m.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{m.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};