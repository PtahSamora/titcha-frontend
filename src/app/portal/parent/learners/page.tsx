'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Trash2, TrendingUp, Award, BookOpen, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for learners
const defaultLearners = [
  {
    id: 1,
    name: "Lebo M.",
    grade: 6,
    subjects: [
      { name: "Mathematics", progress: 85 },
      { name: "Science", progress: 72 },
      { name: "English", progress: 90 },
    ],
  },
  {
    id: 2,
    name: "Anele D.",
    grade: 4,
    subjects: [
      { name: "Math", progress: 65 },
      { name: "Life Skills", progress: 80 },
      { name: "English", progress: 77 },
    ],
  },
];

const seatLimit = 3;

// Mock schools list
const mockSchools = [
  "Johannesburg High School",
  "Pretoria Girls High",
  "Durban College",
  "Cape Town Science Academy",
  "Mamelodi Secondary",
  "Soweto Community School",
  "St John's College",
  "King Edward VII School",
  "Reddam House",
  "Crawford International",
];

// Subject list for autocomplete
const subjectList = [
  "Mathematics",
  "English",
  "Life Sciences",
  "Physical Sciences",
  "Geography",
  "History",
  "Accounting",
  "Economics",
  "Business Studies",
  "Life Orientation",
  "Computer Applications Technology",
  "Information Technology",
  "Visual Arts",
  "Dramatic Arts",
  "Music",
];

export default function LearnersPage() {
  const router = useRouter();
  const [learners, setLearners] = useState(defaultLearners);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    grade: '',
    subjects: '',
  });
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Load learners from localStorage on mount
  useEffect(() => {
    const storedLearners = localStorage.getItem('parent_learners');
    if (storedLearners) {
      setLearners(JSON.parse(storedLearners));
    } else {
      // Save default learners to localStorage
      localStorage.setItem('parent_learners', JSON.stringify(defaultLearners));
    }
  }, []);

  // Save learners to localStorage whenever they change
  useEffect(() => {
    if (learners.length > 0) {
      localStorage.setItem('parent_learners', JSON.stringify(learners));
    }
  }, [learners]);

  const usedSeats = learners.length;
  const availableSeats = seatLimit - usedSeats;

  const handleAddLearner = () => {
    if (!formData.name || !formData.grade || !formData.subjects) {
      alert('Please fill in all fields');
      return;
    }

    // Parse subjects from comma-separated string
    const subjectNames = formData.subjects.split(',').map(s => s.trim()).filter(s => s);

    // Create new learner object
    const newLearner = {
      id: Math.max(...learners.map(l => l.id), 0) + 1,
      name: formData.name,
      grade: parseInt(formData.grade),
      subjects: subjectNames.map(name => ({
        name,
        progress: 0, // Start with 0% progress
      })),
    };

    // Add to learners
    setLearners([...learners, newLearner]);
    console.log('Added new learner:', newLearner);

    // Reset form and close modal
    setFormData({ name: '', school: '', grade: '', subjects: '' });
    setShowAddModal(false);
  };

  const handleRemoveLearner = (id: number) => {
    const updatedLearners = learners.filter((learner) => learner.id !== id);
    setLearners(updatedLearners);
    localStorage.setItem('parent_learners', JSON.stringify(updatedLearners));
    console.log(`Removed learner with ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Parent Portal</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/portal/parent/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/portal/parent/profile')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={() => router.push('/portal/parent/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mt-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">My Kids</h2>
              <p className="text-gray-600">Manage your children and seats.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Add Child
            </button>
          </div>
        </motion.div>

        {/* Seat Summary Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Seats Used</p>
                <p className="text-3xl font-bold text-purple-600">
                  {usedSeats}/{seatLimit}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Learners</p>
                <p className="text-3xl font-bold text-blue-600">{learners.length}</p>
              </div>
              <Award className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Available Seats</p>
                <p className="text-3xl font-bold text-green-600">{availableSeats}</p>
              </div>
              <BookOpen className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Learners Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-500" />
            Enrolled Children
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {learners.map((learner) => (
              <motion.div
                key={learner.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveLearner(learner.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove learner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900">{learner.name}</h4>
                  <p className="text-sm text-gray-500">Grade {learner.grade}</p>
                </div>

                {/* Subject Progress */}
                <div className="space-y-3 mb-4">
                  {learner.subjects.map((subject) => (
                    <div key={subject.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{subject.name}</span>
                        <span className="text-gray-600">{subject.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => router.push(`/portal/parent/learners/${learner.id}`)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  View Details
                </button>
              </motion.div>
            ))}

            {/* Empty State - Show when no learners */}
            {learners.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No children added yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Click "Add Child" to get started with your first child.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Learner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Add New Child
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thabo Molefe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              {/* School Select with Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  placeholder="Search school..."
                  value={schoolSearch || formData.school}
                  onChange={(e) => {
                    setSchoolSearch(e.target.value);
                    setFormData({ ...formData, school: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                {schoolSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {mockSchools
                      .filter((school) =>
                        school.toLowerCase().includes(schoolSearch.toLowerCase())
                      )
                      .map((school) => (
                        <button
                          key={school}
                          onClick={() => {
                            setFormData({ ...formData, school });
                            setSchoolSearch('');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors"
                        >
                          {school}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Grade Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Grade</option>
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subjects Autocomplete with Chips */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects
                </label>
                {/* Selected Subjects as Chips */}
                {selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSubjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {subject}
                        <button
                          onClick={() =>
                            setSelectedSubjects(selectedSubjects.filter((s) => s !== subject))
                          }
                          className="hover:text-purple-900"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Type to search subjects..."
                  value={subjectInput}
                  onChange={(e) => {
                    setSubjectInput(e.target.value);
                    setShowSubjectDropdown(true);
                  }}
                  onFocus={() => setShowSubjectDropdown(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                {showSubjectDropdown && subjectInput && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {subjectList
                      .filter(
                        (subject) =>
                          subject.toLowerCase().includes(subjectInput.toLowerCase()) &&
                          !selectedSubjects.includes(subject)
                      )
                      .map((subject) => (
                        <button
                          key={subject}
                          onClick={() => {
                            setSelectedSubjects([...selectedSubjects, subject]);
                            setSubjectInput('');
                            setShowSubjectDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors"
                        >
                          {subject}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLearner}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Save Child
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
