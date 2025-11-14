import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { Calendar, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../../utils/helpers';

export const BookMeeting = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [subject]);

  const fetchSlots = async () => {
    try {
      const data = await meetingService.getAvailableSlots(subject);
      setSlots(data.slots || []);
    } catch (error) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !topic) return;

    try {
      await meetingService.scheduleMeeting({
        subject,
        topic,
        availabilitySlotId: selectedSlot._id
      });
      toast.success('Meeting booked successfully!');
      navigate('/student/meetings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Book Meeting</h1>
      <p className="text-gray-600 mb-8">Subject: <span className="font-semibold text-primary-600">{subject}</span></p>

      {slots.length === 0 ? (
        <div className="card text-center py-12"><Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 text-lg">No available slots for {subject}</p><p className="text-gray-500 mt-2">Check back later or try another subject</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Available Time Slots</h2>
            <div className="space-y-3">
              {slots.map(slot => (
                <button key={slot._id} onClick={() => setSelectedSlot(slot)} className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedSlot?._id === slot._id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{formatDate(slot.date)}</span>
                    <span className="text-sm text-gray-600">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center"><User className="h-4 w-4 mr-1" />Tutor: {slot.tutorId?.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card h-fit">
            <h2 className="text-xl font-bold mb-4">Meeting Details</h2>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="label">Selected Time</label>
                <div className="input bg-gray-50">
                  {selectedSlot ? `${formatDate(selectedSlot.date)} at ${formatTime(selectedSlot.startTime)}` : 'Select a time slot'}
                </div>
              </div>
              <div>
                <label className="label">Meeting Topic *</label>
                <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} className="input" placeholder="What do you want to discuss?" />
              </div>
              <button type="submit" disabled={!selectedSlot} className="w-full btn-primary">Book Meeting</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};