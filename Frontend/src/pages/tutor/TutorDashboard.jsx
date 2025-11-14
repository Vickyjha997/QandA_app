import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { questionService } from '../../services/questionService';
import { HelpCircle, CheckCircle, Clock, X, Upload, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, getImageUrl } from '../../utils/helpers';

export const TutorDashboard = () => {
  const { user } = useAuth();
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewAnswerModal, setViewAnswerModal] = useState(null); // NEW
  const [answerText, setAnswerText] = useState('');
  const [answerImages, setAnswerImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const [available, answered] = await Promise.all([
        questionService.getAvailableQuestions(),
        questionService.getMyAnsweredQuestions()
      ]);
      setAvailableQuestions(available.questions || []);
      setAnsweredQuestions(answered.questions || []);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setAnswerImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removePreviewImage = (index) => {
    const newImages = answerImages.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setAnswerImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    try {
      await questionService.claimQuestion(selectedQuestion._id);
      const formData = new FormData();
      formData.append('answerText', answerText);
      answerImages.forEach(img => formData.append('answerImages', img));
      await questionService.submitAnswer(selectedQuestion._id, formData);
      toast.success('Answer submitted successfully!');
      setSelectedQuestion(null);
      setAnswerText('');
      setAnswerImages([]);
      setPreviewImages([]);
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    }
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setAnswerText('');
    setAnswerImages([]);
    setPreviewImages([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user.name}! 👨‍🏫</h1>
          <p className="text-gray-600 text-lg">
            Subject: <span className="font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{user.subject}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Available Questions</p>
                <p className="text-4xl font-bold">{availableQuestions.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl"><HelpCircle className="h-8 w-8" /></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Answered</p>
                <p className="text-4xl font-bold">{answeredQuestions.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl"><CheckCircle className="h-8 w-8" /></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Response Rate</p>
                <p className="text-4xl font-bold">
                  {availableQuestions.length + answeredQuestions.length > 0
                    ? Math.round((answeredQuestions.length / (availableQuestions.length + answeredQuestions.length)) * 100)
                    : 0}%
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-xl"><Clock className="h-8 w-8" /></div>
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Questions */}
          <div>
            <div className="flex items-center mb-6">
              <HelpCircle className="h-6 w-6 mr-2 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">Available Questions ({availableQuestions.length})</h2>
            </div>

            <div className="space-y-4">
              {availableQuestions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                  <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No questions available right now</p>
                  <p className="text-gray-400 text-sm mt-2">Check back soon for new questions!</p>
                </div>
              ) : (
                availableQuestions.map(q => (
                  <div key={q._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">{q.subject}</span>
                      <span className="text-xs text-gray-500">{formatDate(q.createdAt)}</span>
                    </div>

                    <p className="text-gray-900 font-medium mb-4 text-lg leading-relaxed">{q.questionText}</p>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600">
                      <p className="mb-1"><span className="font-semibold">Student:</span> {q.studentId?.name}</p>
                      <p><span className="font-semibold">Class:</span> {q.studentId?.class || 'N/A'}</p>
                    </div>

                    {q.questionImages?.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {q.questionImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={getImageUrl(img)} alt="Question" className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={() => setSelectedQuestion(q)} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-md">
                      Answer Question
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Answered Questions */}
          <div>
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">Your Answers ({answeredQuestions.length})</h2>
            </div>

            <div className="space-y-4">
              {answeredQuestions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No answered questions yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start answering to build your profile!</p>
                </div>
              ) : (
                answeredQuestions.map(q => (
                  <div key={q._id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-green-200 transition-colors">
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold inline-block mb-3">{q.subject}</span>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-semibold mb-1">QUESTION:</p>
                      <p className="text-gray-900 font-medium">{q.questionText}</p>
                    </div>

                    <button onClick={() => setViewAnswerModal(q)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all">
                      <Eye className="h-4 w-4" />
                      View Answer
                    </button>

                    <p className="text-xs text-gray-500 mt-3">Answered on {formatDate(q.answeredAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Answer Modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Answer Question</h2>
                  <button onClick={closeModal} className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-5 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                  <p className="text-xs text-blue-600 font-bold mb-2 uppercase">Student's Question:</p>
                  <p className="text-gray-900 font-medium text-lg leading-relaxed">{selectedQuestion.questionText}</p>
                  
                  {selectedQuestion.questionImages?.length > 0 && (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      {selectedQuestion.questionImages.map((img, idx) => (
                        <img key={idx} src={getImageUrl(img)} alt="Question" className="h-28 w-28 object-cover rounded-xl border-2 border-blue-200 shadow-sm" />
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitAnswer} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Answer *</label>
                    <textarea required value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Write a detailed answer to help the student..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all min-h-[180px] text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Supporting Images (Optional)</label>
                    
                    <div className="relative">
                      <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" id="answer-images" />
                      <label htmlFor="answer-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </label>
                    </div>

                    {previewImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm" />
                            <button type="button" onClick={() => removePreviewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl"></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg">
                      Submit Answer
                    </button>
                    <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Answer Modal */}
        {viewAnswerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Answer Details</h2>
                  <button onClick={() => setViewAnswerModal(null)} className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-5 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                  <p className="text-xs text-blue-600 font-bold mb-2 uppercase">Question:</p>
                  <p className="text-gray-900 font-medium text-lg leading-relaxed">{viewAnswerModal.questionText}</p>
                  
                  {viewAnswerModal.questionImages?.length > 0 && (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      {viewAnswerModal.questionImages.map((img, idx) => (
                        <img key={idx} src={getImageUrl(img)} alt="Question" className="h-28 w-28 object-cover rounded-xl border-2 border-blue-200 shadow-sm" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-500">
                  <p className="text-xs text-green-600 font-bold mb-2 uppercase">Your Answer:</p>
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{viewAnswerModal.answerText}</p>
                  
                  {viewAnswerModal.answerImages?.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {viewAnswerModal.answerImages.map((img, idx) => (
                        <img key={idx} src={getImageUrl(img)} alt={`Answer ${idx + 1}`} className="w-full h-48 object-cover rounded-xl border-2 border-green-200 shadow-sm" />
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => setViewAnswerModal(null)} className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
