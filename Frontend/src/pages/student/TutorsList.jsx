import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';

const SUBJECTS = ['Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot'];

export const TutorsList = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const navigate = useNavigate();

  const handleBookMeeting = () => {
    if (!selectedSubject) {
      alert('Please select a subject');
      return;
    }
    navigate(`/student/book-meeting/${selectedSubject}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center"><Users className="h-8 w-8 mr-3 text-primary-600" />Find Tutors</h1>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Select a Subject</h2>
        <p className="text-gray-600 mb-6">Choose a subject to find available tutors and book a meeting</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUBJECTS.map(subject => (
            <button key={subject} onClick={() => setSelectedSubject(subject)} className={`p-6 rounded-xl border-2 transition-all ${selectedSubject === subject ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
              <h3 className="font-semibold text-lg text-gray-900">{subject}</h3>
            </button>
          ))}
        </div>

        <button onClick={handleBookMeeting} disabled={!selectedSubject} className="w-full btn-primary mt-6 flex items-center justify-center">
          <Calendar className="h-5 w-5 mr-2" />Book Meeting
        </button>
      </div>
    </div>
  );
};