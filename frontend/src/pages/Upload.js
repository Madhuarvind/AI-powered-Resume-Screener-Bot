import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader,
  Plus,
  FolderOpen,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles, 
  Zap, 
  Shield
} from 'lucide-react';
import UploadZone from '../components/Upload/UploadZone';
import toast from 'react-hot-toast';

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleUploadSuccess = (response) => {
    toast.success('Resume analyzed successfully!');
    // Navigate to candidate detail page
    if (response.candidate_id) {
      navigate(`/candidates/${response.candidate_id}`);
    } else {
      navigate('/candidates');
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI models analyze resumes for skills, experience, and fit',
      color: 'primary'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get comprehensive candidate evaluation in seconds',
      color: 'success'
    },
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Automatic bias detection and fair screening recommendations',
      color: 'warning'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ 
              rotate: isUploading ? 360 : 0,
              scale: isUploading ? 1.1 : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: isUploading ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.3 }
            }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl shadow-lg"
          >
            <UploadIcon className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Upload & Analyze Resume
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload a resume and let our AI provide comprehensive candidate analysis with bias detection
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="card p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-lg mb-4 ${
                feature.color === 'primary' ? 'bg-primary-100' :
                feature.color === 'success' ? 'bg-success-100' :
                'bg-warning-100'
              }`}>
                <Icon className={`h-6 w-6 ${
                  feature.color === 'primary' ? 'text-primary-600' :
                  feature.color === 'success' ? 'text-success-600' :
                  'text-warning-600'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-8"
      >
        <UploadZone 
          onUploadSuccess={handleUploadSuccess}
          onUploadStart={handleUploadStart}
        />
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 text-primary-600 rounded-full p-2 text-sm font-bold min-w-[2rem] h-8 flex items-center justify-center">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Upload Resume</h4>
              <p className="text-sm text-gray-600">Select a PDF or DOCX file from your computer</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 text-primary-600 rounded-full p-2 text-sm font-bold min-w-[2rem] h-8 flex items-center justify-center">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">AI Analysis</h4>
              <p className="text-sm text-gray-600">Our AI analyzes skills, experience, and fit</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 text-primary-600 rounded-full p-2 text-sm font-bold min-w-[2rem] h-8 flex items-center justify-center">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Get Results</h4>
              <p className="text-sm text-gray-600">View detailed analysis and bias detection</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-primary-900 mb-3">💡 Tips for better results</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li>• Include a job description for more accurate matching scores</li>
          <li>• Ensure the resume is clearly formatted and readable</li>
          <li>• PDF files generally provide better text extraction than DOCX</li>
          <li>• Our AI works best with resumes that include skills, experience, and education sections</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Upload;
