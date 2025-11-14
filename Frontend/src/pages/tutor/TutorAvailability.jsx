import { useState, useEffect } from 'react';
import { availabilityService } from '../../services/availabilityService';
import { Calendar, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../../utils/helpers';

export const TutorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSlots, setNewSlots] = useState([{ date: '', startTime: '', endTime: '', duration: 60 }]);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const data = await availabilityService.getMySlots();
      setSlots(data.availability || []);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    setNewSlots([...newSlots, { date: '', startTime: '', endTime: '', duration: 60 }]);
  };

  const handleRemoveSlot = (index) => {
    if (newSlots.length === 1) {
      toast.error('At least one slot is required');
      return;
    }
    setNewSlots(newSlots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...newSlots];
    updated[index][field] = value;
    setNewSlots(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await availabilityService.setAvailability(newSlots);
      toast.success('Availability set successfully!');
      setShowModal(false);
      setNewSlots([{ date: '', startTime: '', endTime: '', duration: 60 }]);
      fetchSlots();
    } catch (error) {
      toast.error('Failed to set availability');
    }
  };

  const handleDelete = async (slotId) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await availabilityService.deleteSlot(slotId);
      toast.success('Slot deleted');
      fetchSlots();
    } catch (error) {
      toast.error('Failed to delete slot');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl mr-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
              <p className="text-gray-600 mt-1">Manage your teaching schedule</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center shadow-lg transform hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Slots
          </button>
        </div>

        {/* Slots Grid */}
        {slots.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Availability Set</h3>
            <p className="text-gray-600 text-lg mb-6">Let students know when you're available for sessions</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              Add Your First Slot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(slot => (
              <div
                key={slot._id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 ${
                  slot.isBooked
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-green-200 bg-gradient-to-br from-white to-green-50'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      slot.isBooked
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {slot.isBooked ? '🔒 Booked' : '✅ Available'}
                  </span>
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                    <span className="font-bold text-lg">{formatDate(slot.date)}</span>
                  </div>

                  <div className="flex items-center text-gray-700 bg-white rounded-lg p-3">
                    <Clock className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="font-semibold">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <span className="text-purple-700 font-bold text-lg">{slot.duration} minutes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Slots Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Add Availability Slots</h2>
                    <p className="text-purple-100 text-sm mt-1">Set your teaching schedule</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors"
                  >
                    <Plus className="h-6 w-6 transform rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {newSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-6 border-2 border-purple-200 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 space-y-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-lg text-purple-700">
                          Slot {index + 1}
                        </span>
                        {newSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            📅 Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={slot.date}
                            onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            ⏱️ Duration (minutes) *
                          </label>
                          <input
                            type="number"
                            required
                            min="15"
                            step="15"
                            value={slot.duration}
                            onChange={(e) => handleSlotChange(index, 'duration', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            🕐 Start Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={slot.startTime}
                            onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            🕐 End Time *
                          </label>
                          <input
                            type="time"
                            required
                            value={slot.endTime}
                            onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="w-full bg-white border-2 border-dashed border-purple-300 hover:border-purple-500 text-purple-600 font-semibold py-4 px-6 rounded-xl transition-all hover:bg-purple-50"
                  >
                    + Add Another Slot
                  </button>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                      Save All Slots
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
