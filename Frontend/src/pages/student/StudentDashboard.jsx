import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { questionService } from '../../services/questionService';
import { HelpCircle, Plus, MessageCircle, CheckCircle, Clock, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, getImageUrl } from '../../utils/helpers';

const SUBJECTS = ['Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot'];

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState({ unansweredQuestions: [], answeredQuestions: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ subject: '', questionText: '', images: [] });
  const [selectedImages, setSelectedImages] = useState([]);

  // Added viewAnswerModal to handle selected answer for modal view
  const [viewAnswerModal, setViewAnswerModal] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await questionService.getMyQuestions();
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('subject', newQuestion.subject);
    formData.append('questionText', newQuestion.questionText);
    selectedImages.forEach(img => formData.append('images', img));

    try {
      await questionService.createQuestion(formData);
      toast.success('Question posted successfully!');
      setShowModal(false);
      setNewQuestion({ subject: '', questionText: '', images: [] });
      setSelectedImages([]);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to post question');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Manage your questions and learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button onClick={() => setShowModal(true)} className="card-hover border-2 border-dashed border-primary-300 rounded-xl px-6 py-8 flex items-center justify-center hover:bg-primary-50 transition-colors text-primary-600 font-semibold text-lg">
          <Plus className="h-6 w-6 mr-2" /> Ask Question
        </button>
        <Link to="/student/ask-ai" className="card-hover rounded-xl px-6 py-8 flex items-center space-x-4 hover:bg-blue-50 transition-colors">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <span className="text-gray-900 font-semibold text-lg">Ask AI</span>
        </Link>
        <Link to="/student/tutors" className="card-hover rounded-xl px-6 py-8 flex items-center space-x-4 hover:bg-green-50 transition-colors">
          <HelpCircle className="h-6 w-6 text-green-600" />
          <span className="text-gray-900 font-semibold text-lg">Find Tutors</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center"><Clock className="h-5 w-5 mr-2 text-orange-500" />Pending ({questions.unansweredQuestions.length})</h2>
          <div className="space-y-4">
            {questions.unansweredQuestions.length === 0 ? (
              <div className="card text-center py-8 rounded-xl bg-white shadow border border-gray-100">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No pending questions</p>
              </div>
            ) : (
              questions.unansweredQuestions.map(q => (
                <div key={q._id} className="card hover:shadow-md transition-shadow rounded-xl bg-white p-6 border border-gray-100">
                  <span className="badge-primary mb-2">{q.subject}</span>
                  <p className="text-gray-900 font-medium mb-2">{q.questionText}</p>
                  {q.questionImages?.length > 0 && <p className="text-sm text-gray-500 flex items-center"><ImageIcon className="h-4 w-4 mr-1" />{q.questionImages.length} image(s)</p>}
                  <p className="text-sm text-gray-500 mt-2">{formatDate(q.createdAt)}</p>
                  {q.isBeingAnswered && <div className="mt-2 text-sm text-green-600 flex items-center"><Clock className="h-4 w-4 mr-1" />Being answered by {q.answeredBy?.name}</div>}
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500" />Answered ({questions.answeredQuestions.length})</h2>
          <div className="space-y-4">
            {questions.answeredQuestions.length === 0 ? (
              <div className="card text-center py-8 rounded-xl bg-white shadow border border-gray-100">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No answered questions yet</p>
              </div>
            ) : (
              questions.answeredQuestions.map((q) => (
                <div key={q._id} className="card rounded-xl bg-white p-6 border border-gray-100 shadow">
                  <span className="badge-success mb-2">{q.subject}</span>
                  <p className="text-gray-900 font-medium mb-2">Q: {q.questionText}</p>
                  <p className="text-gray-700 mb-2"><strong>A:</strong> {q.answerText.length > 150 ? q.answerText.substring(0, 147) + '...' : q.answerText}</p>
                  {q.answerImages?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {q.answerImages.map((img, idx) => (
                        <img key={idx} src={getImageUrl(img)} alt="Answer" className="h-20 w-20 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setViewAnswerModal(q)}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    View Full Answer
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Answered by {q.answeredBy?.name} • {formatDate(q.answeredAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Ask a Question</h2>
                <button onClick={() => setShowModal(false)}><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Subject</label>
                  <select required value={newQuestion.subject} onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })} className="input w-full">
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Your Question</label>
                  <textarea required value={newQuestion.questionText} onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })} placeholder="Describe your question in detail" className="input w-full min-h-[120px]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Attach Images (optional)</label>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="input" />
                  {selectedImages.length > 0 && <p className="text-sm mt-1">{selectedImages.length} image(s) selected</p>}
                </div>
                <div className="flex space-x-4">
                  <button type="submit" className="btn-primary flex-1 py-3">Post Question</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Answer Modal */}
      {viewAnswerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Answer Details</h2>
              <button onClick={() => setViewAnswerModal(null)} className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
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
                <p className="text-xs text-green-600 font-bold mb-2 uppercase">Answer:</p>
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{viewAnswerModal.answerText}</p>
                {viewAnswerModal.answerImages?.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {viewAnswerModal.answerImages.map((img, idx) => (
                      <img key={idx} src={getImageUrl(img)} alt={`Answer ${idx + 1}`} className="w-full h-48 object-cover rounded-xl border-2 border-green-200 shadow-sm" />
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setViewAnswerModal(null)} className="w-full mt-6 bg-gray-200 hover:bg-gray-300 rounded-lg py-3 font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
