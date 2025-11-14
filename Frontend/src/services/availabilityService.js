import api from './api';

export const availabilityService = {
  setAvailability: async (slots) => {
    const response = await api.post('/availability/set', { slots });
    return response.data;
  },
  getTutorAvailability: async (tutorId) => {
    const response = await api.get(`/availability/tutor/${tutorId}`);
    return response.data;
  },
  getMySlots: async () => {
    const response = await api.get('/availability/my-slots');
    return response.data;
  },
  deleteSlot: async (slotId) => {
    const response = await api.delete(`/availability/${slotId}`);
    return response.data;
  }
};
