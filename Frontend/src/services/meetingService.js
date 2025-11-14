import api from './api';

export const meetingService = {
  getAvailableSlots: async (subject) => {
    const response = await api.get(`/meetings/available-slots/${subject}`);
    return response.data;
  },
  scheduleMeeting: async (data) => {
    const response = await api.post('/meetings/schedule', data);
    return response.data;
  },
  getMyMeetings: async () => {
    const response = await api.get('/meetings/my-meetings');
    return response.data;
  },
  cancelMeeting: async (meetingId) => {
    const response = await api.put(`/meetings/${meetingId}/cancel`);
    return response.data;
  }
};
