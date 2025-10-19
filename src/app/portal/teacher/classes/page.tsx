'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock uploaded files
const initialMockFiles = [
  { id: 1, name: "Mathematics Syllabus 2025", type: "Syllabus", uploaded: "2025-09-30", size: "2.4 MB" },
  { id: 2, name: "Rubric - Term 3", type: "Marking Rubric", uploaded: "2025-10-02", size: "1.1 MB" },
  { id: 3, name: "Past Paper 2024", type: "Exam", uploaded: "2025-10-05", size: "3.8 MB" },
  { id: 4, name: "Algebra Notes", type: "Notes", uploaded: "2025-10-10", size: "0.9 MB" },
  { id: 5, name: "Term 2 Test", type: "Exam", uploaded: "2025-10-12", size: "2.1 MB" },
];

// Mock learners
const mockLearners = [
  { id: 1, name: "Lebo M.", grade: 7, avgScore: 85, homeworks: 12, attendance: 95 },
  { id: 2, name: "Thabo K.", grade: 7, avgScore: 78, homeworks: 11, attendance: 92 },
  { id: 3, name: "Anele D.", grade: 7, avgScore: 92, homeworks: 12, attendance: 98 },
  { id: 4, name: "Sipho N.", grade: 7, avgScore: 71, homeworks: 10, attendance: 88 },
  { id: 5, name: "Nomsa P.", grade: 7, avgScore: 88, homeworks: 12, attendance: 96 },
];

export default function TeacherClassesPage() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState("Grade 7");
  const [files, setFiles] = useState(initialMockFiles);
  const [activeTab, setActiveTab] = useState<'resources' | 'learners'>('resources');

  const handleFileUpload = (type: string) => {
    // Mock file upload
    const newFile = {
      id: files.length + 1,
      name: `New ${type} Document`,
      type,
      uploaded: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
    };
    setFiles([...files, newFile]);
    alert(`${type} uploaded successfully!`);
  };

  const handleDeleteFile = (id: number) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const getFileTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Syllabus': 'bg-blue-100 text-blue-700',
      'Marking Rubric': 'bg-purple-100 text-purple-700',
      'Exam': 'bg-orange-100 text-orange-700',
      'Notes': 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Teacher Portal</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/portal/teacher/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/portal/teacher/profile')}
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
              onClick={() => router.push('/portal/teacher/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mt-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">My Class Resources</h2>
              <p className="text-gray-600">Manage your class materials and view learner progress</p>
            </div>

            {/* Grade Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Teaching:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={`Grade ${grade}`}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
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
              Resources & Uploads
            </button>
            <button
              onClick={() => setActiveTab('learners')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'learners'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              Learners ({mockLearners.length})
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
              <div className="grid md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleFileUpload('Syllabus')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Syllabus</span>
                </button>
                <button
                  onClick={() => handleFileUpload('Marking Rubric')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Rubric</span>
                </button>
                <button
                  onClick={() => handleFileUpload('Exam')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Exam</span>
                </button>
                <button
                  onClick={() => handleFileUpload('Notes')}
                  className="flex flex-col items-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Upload Notes</span>
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
                <h3 className="text-xl font-bold text-gray-900 mb-4">Uploaded Files</h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
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

        {/* Learners Tab */}
        {activeTab === 'learners' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Class Learners - {selectedGrade}</h3>
            <div className="space-y-3">
              {mockLearners.map((learner) => (
                <div
                  key={learner.id}
                  onClick={() => router.push(`/portal/teacher/learners/${learner.id}`)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {learner.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{learner.name}</p>
                      <p className="text-sm text-gray-500">Grade {learner.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Avg Score</p>
                      <p className="text-lg font-bold text-purple-600">{learner.avgScore}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Homeworks</p>
                      <p className="text-lg font-bold text-blue-600">{learner.homeworks}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Attendance</p>
                      <p className="text-lg font-bold text-green-600">{learner.attendance}%</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
