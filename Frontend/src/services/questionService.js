import api from './api';

export const questionService = {
  getMyQuestions: async () => {
    const response = await api.get('/questions/student/my-questions');
    return response.data;
  },
  createQuestion: async (formData) => {
    const response = await api.post('/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getAvailableQuestions: async () => {
    const response = await api.get('/questions/tutor/available');
    return response.data;
  },
  getMyAnsweredQuestions: async () => {
    const response = await api.get('/questions/tutor/my-answered');
    return response.data;
  },
  claimQuestion: async (questionId) => {
    const response = await api.patch(`/questions/${questionId}/claim`);
    return response.data;
  },
  submitAnswer: async (questionId, formData) => {
    const response = await api.post(`/questions/${questionId}/answer`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
