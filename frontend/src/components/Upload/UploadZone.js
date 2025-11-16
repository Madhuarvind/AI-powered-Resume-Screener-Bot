import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../../config';
import { apiService } from '../../services/api';

const UploadZone = ({ onUploadSuccess, onUploadStart }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > config.MAX_FILE_SIZE) {
        toast.error('File size too large. Maximum size is 16MB.');
      } else {
        toast.error('Invalid file type. Only PDF and DOCX files are allowed.');
      }
      return;
    }

    // Handle accepted file
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      toast.success('File selected successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: config.MAX_FILE_SIZE,
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('job_description', jobDescription);

      const response = await apiService.uploadResume(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        toast.success('Resume analyzed successfully!');
        onUploadSuccess?.(response.data);
        
        // Reset form
        setUploadedFile(null);
        setJobDescription('');
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg'
            : 'border-gray-300 hover:border-primary-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
        }`}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
        }}
        whileTap={{ scale: 0.98 }}
        animate={isDragActive ? {
          scale: [1, 1.05, 1],
          boxShadow: ["0 0 0 rgba(59,130,246,0)", "0 0 20px rgba(59,130,246,0.3)", "0 0 0 rgba(59,130,246,0)"]
        } : {}}
        transition={{ duration: 0.3 }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isDragActive && !isDragReject
              ? 'bg-primary-100'
              : isDragReject
              ? 'bg-danger-100'
              : 'bg-gray-100'
          }`}>
            {isDragReject ? (
              <AlertCircle className="h-8 w-8 text-danger-500" />
            ) : (
              <Upload className={`h-8 w-8 ${
                isDragActive ? 'text-primary-500' : 'text-gray-500'
              }`} />
            )}
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {isDragActive && !isDragReject
                ? 'Drop the file here'
                : isDragReject
                ? 'Invalid file type'
                : 'Drop your resume here, or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF and DOCX files up to 16MB
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Selected File */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-danger-500 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Uploading...</span>
                    <span className="text-sm font-medium text-primary-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Job Description (Optional)
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to get more accurate matching scores..."
          rows={6}
          className="input-field resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Adding a job description helps our AI provide more accurate relevance scores and better candidate matching.
        </p>
      </motion.div>

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUpload}
        disabled={!uploadedFile || isUploading}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2
          ${uploadedFile && !isUploading
            ? 'btn-primary shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing Resume...</span>
          </>
        ) : uploadedFile ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Upload & Analyze Resume</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span>Select a Resume First</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default UploadZone;
