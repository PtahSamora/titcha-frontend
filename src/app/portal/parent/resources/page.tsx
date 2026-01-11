'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, Trash2, Eye, BookOpen, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock uploaded files
const initialMockFiles = [
  { id: 1, name: "Grade 6 Mathematics Syllabus 2025", type: "Syllabus", uploaded: "2025-09-30", size: "2.4 MB", child: "Lebo M." },
  { id: 2, name: "Science Project Rubric", type: "Marking Rubric", uploaded: "2025-10-02", size: "1.1 MB", child: "Lebo M." },
  { id: 3, name: "English Past Paper 2024", type: "Exam", uploaded: "2025-10-05", size: "3.8 MB", child: "Anele D." },
  { id: 4, name: "Algebra Study Notes", type: "Notes", uploaded: "2025-10-10", size: "0.9 MB", child: "Lebo M." },
  { id: 5, name: "Term 2 Science Test", type: "Exam", uploaded: "2025-10-12", size: "2.1 MB", child: "Anele D." },
];

export default function ParentResourcesPage() {
  const router = useRouter();
  const [files, setFiles] = useState(initialMockFiles);
  const [activeTab, setActiveTab] = useState<'resources' | 'requests'>('resources');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    child: '',
    documentType: '',
    subject: '',
    grade: '',
    notes: '',
  });

  const handleFileUpload = (type: string) => {
    // Mock file upload
    const newFile = {
      id: files.length + 1,
      name: `New ${type} Document`,
      type,
      uploaded: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      child: "Lebo M.",
    };
    setFiles([...files, newFile]);
    alert(`${type} uploaded successfully!`);
  };

  const handleDeleteFile = (id: number) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleSubmitRequest = () => {
    if (!requestForm.child || !requestForm.documentType || !requestForm.subject || !requestForm.grade) {
      alert('Please fill in all required fields');
      return;
    }

    alert(`Document request submitted successfully! You will be notified when the school responds.`);
    setShowRequestModal(false);
    setRequestForm({ child: '', documentType: '', subject: '', grade: '', notes: '' });
  };

  const getFileTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Syllabus': 'bg-blue-100 text-blue-700',
      'Marking Rubric': 'bg-purple-100 text-purple-700',
      'Exam': 'bg-orange-100 text-orange-700',
      'Notes': 'bg-green-100 text-green-700',
      'Textbook': 'bg-pink-100 text-pink-700',
      'Study Guide': 'bg-cyan-100 text-cyan-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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
              onClick={() => router.push('/portal/parent/learners')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              My Kids
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
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Curriculum Resources</h2>
              <p className="text-gray-600">Upload, manage, and request school documents and study materials for your children</p>
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Request from School
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg mb-4 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              My Resources ({files.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Document Requests
            </button>
          </div>
        </div>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <>
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload New Resources</h3>
              <p className="text-sm text-gray-600 mb-4">Upload curriculum documents, study materials, and school resources for your children.</p>
              <div className="grid md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleFileUpload('Syllabus')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Syllabus</span>
                </button>
                <button
                  onClick={() => handleFileUpload('Notes')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Notes</span>
                </button>
                <button
                  onClick={() => handleFileUpload('Exam')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Exam Paper</span>
                </button>
                <button
                  onClick={() => handleFileUpload('Study Guide')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Study Guide</span>
                </button>
              </div>
            </motion.div>

            {/* Uploaded Files Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Uploaded Resources</h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Child</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Uploaded On</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFileTypeColor(file.type)}`}>
                            {file.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{file.child}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{file.size}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{file.uploaded}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Document Requests to School</h3>
            <p className="text-gray-600 mb-6">Track your requests for curriculum documents from your child's school.</p>

            <div className="space-y-4">
              {/* Mock request items */}
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">Grade 7 Mathematics Textbook</h4>
                    <p className="text-sm text-gray-600 mt-1">For: Lebo M. • Subject: Mathematics • Grade: 7</p>
                    <p className="text-xs text-gray-500 mt-2">Requested on: 2025-10-01</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                    Pending
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">Science Lab Manual</h4>
                    <p className="text-sm text-gray-600 mt-1">For: Anele D. • Subject: Science • Grade: 4</p>
                    <p className="text-xs text-gray-500 mt-2">Requested on: 2025-09-28</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Fulfilled
                  </span>
                </div>
              </div>

              {/* Empty state if no requests */}
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="mb-4">No active document requests</p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Request Document from School
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Request Document Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Request Document from School
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Submit a request to your child's school for curriculum documents, textbooks, or study materials.
                The school will be notified and you'll receive the document when it's ready.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Child Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Child *
                  </label>
                  <select
                    value={requestForm.child}
                    onChange={(e) => setRequestForm({ ...requestForm, child: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a child</option>
                    <option value="Lebo M.">Lebo M. (Grade 6)</option>
                    <option value="Anele D.">Anele D. (Grade 4)</option>
                  </select>
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    value={requestForm.documentType}
                    onChange={(e) => setRequestForm({ ...requestForm, documentType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="Textbook">Textbook</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Study Guide">Study Guide</option>
                    <option value="Past Papers">Past Papers</option>
                    <option value="Marking Rubric">Marking Rubric</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics"
                    value={requestForm.subject}
                    onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level *
                  </label>
                  <select
                    value={requestForm.grade}
                    onChange={(e) => setRequestForm({ ...requestForm, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select grade</option>
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any specific details or requirements..."
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestForm({ child: '', documentType: '', subject: '', grade: '', notes: '' });
                }}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Submit Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
