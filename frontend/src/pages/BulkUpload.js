import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
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
  Users,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const BulkUpload = () => {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [results, setResults] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle accepted files
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending', // pending, processing, completed, error
      progress: 0,
      result: null,
      error: null
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Maximum size is 16MB.`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`);
        }
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setResults([]);
    setProcessedCount(0);
  };

  const processFiles = async () => {
    if (files.length === 0) {
      toast.error('Please add files to process');
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setProcessedCount(0);
    setResults([]);

    for (let i = 0; i < files.length; i++) {
      if (isPaused) break;

      const fileData = files[i];
      
      // Update file status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ));

      try {
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          if (isPaused) break;
          
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress }
              : f
          ));
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (!isPaused) {
          // Upload file
          const formData = new FormData();
          formData.append('file', fileData.file);
          formData.append('job_description', jobDescription);

          const response = await apiService.uploadResume(formData);

          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'completed', progress: 100, result: response.data }
              : f
          ));

          setResults(prev => [...prev, { ...response.data, fileName: fileData.file.name }]);
          setProcessedCount(prev => prev + 1);
          
          toast.success(`${fileData.file.name} processed successfully`);
        }
      } catch (error) {
        // Update file status to error
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: error.message }
            : f
        ));
        
        toast.error(`Failed to process ${fileData.file.name}`);
      }
    }

    setIsProcessing(false);
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    processFiles();
  };

  const retryFailed = () => {
    setFiles(prev => prev.map(f => 
      f.status === 'error' 
        ? { ...f, status: 'pending', progress: 0, error: null }
        : f
    ));
  };

  const downloadResults = () => {
    const csvContent = [
      ['File Name', 'Overall Score', 'Category', 'Key Skills', 'Experience Years'].join(','),
      ...results.map(result => [
        result.fileName,
        result.analysis?.overall_score || 0,
        result.analysis?.category || 'Unknown',
        (result.analysis?.key_skills || []).join('; '),
        result.analysis?.experience_years || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_analysis_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-primary-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-danger-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'processing':
        return 'bg-primary-100 text-primary-700';
      case 'completed':
        return 'bg-success-100 text-success-700';
      case 'error':
        return 'bg-danger-100 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingFiles = files.filter(f => f.status === 'pending').length;
  const processingFiles = files.filter(f => f.status === 'processing').length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Bulk Resume Upload</h1>
          <p className="text-gray-600">Upload and analyze multiple resumes simultaneously</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {files.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFiles}
                className="btn-secondary flex items-center space-x-2"
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </motion.button>
              
              {results.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadResults}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Results</span>
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Statistics */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Files', value: files.length, icon: FileText, color: 'primary' },
            { label: 'Completed', value: completedFiles, icon: CheckCircle, color: 'success' },
            { label: 'Processing', value: processingFiles, icon: Loader, color: 'warning' },
            { label: 'Failed', value: errorFiles, icon: AlertCircle, color: 'danger' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="card p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'primary' ? 'bg-primary-100' :
                    stat.color === 'success' ? 'bg-success-100' :
                    stat.color === 'warning' ? 'bg-warning-100' :
                    'bg-danger-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      stat.color === 'primary' ? 'text-primary-600' :
                      stat.color === 'success' ? 'text-success-600' :
                      stat.color === 'warning' ? 'text-warning-600' :
                      'text-danger-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Job Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-primary-500 mr-2" />
          Job Description (Optional)
        </h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to get more accurate matching scores..."
          className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          disabled={isProcessing}
        />
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-8"
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop resumes here'}
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse files (PDF, DOCX up to 16MB each)
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            disabled={isProcessing}
          >
            <Plus className="h-4 w-4 mr-2" />
            Select Files
          </motion.button>
        </div>
      </motion.div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-primary-500 mr-2" />
              Files Queue ({files.length})
            </h3>
            
            <div className="flex items-center space-x-2">
              {errorFiles > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retryFailed}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Failed</span>
                </motion.button>
              )}
              
              {!isProcessing && !isPaused && pendingFiles > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={processFiles}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Processing</span>
                </motion.button>
              )}
              
              {isProcessing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseProcessing}
                  className="btn-warning flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </motion.button>
              )}
              
              {isPaused && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resumeProcessing}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Resume</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {files.map((fileData, index) => (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(fileData.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fileData.status)}`}>
                      {fileData.status}
                    </span>
                  </div>
                  
                  {fileData.status === 'processing' && (
                    <div className="flex-shrink-0 w-24">
                      <div className="bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-primary-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${fileData.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{fileData.progress}%</p>
                    </div>
                  )}
                  
                  {fileData.status === 'completed' && fileData.result && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-success-600">
                        {fileData.result.analysis?.overall_score || 0}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {fileData.result.analysis?.category || 'Unknown'}
                      </p>
                    </div>
                  )}
                  
                  {fileData.status === 'error' && (
                    <div className="flex-shrink-0">
                      <p className="text-xs text-danger-600">{fileData.error}</p>
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFile(fileData.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-danger-500"
                    disabled={fileData.status === 'processing'}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-primary-500 mr-2" />
            Processing Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <p className="text-2xl font-bold text-success-600">
                {results.filter(r => r.analysis?.category === 'Highly Qualified').length}
              </p>
              <p className="text-sm text-success-700">Highly Qualified</p>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <p className="text-2xl font-bold text-warning-600">
                {results.filter(r => r.analysis?.category === 'Qualified').length}
              </p>
              <p className="text-sm text-warning-700">Qualified</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">
                {Math.round(results.reduce((acc, r) => acc + (r.analysis?.overall_score || 0), 0) / results.length) || 0}%
              </p>
              <p className="text-sm text-primary-700">Average Score</p>
            </div>
          </div>
          
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadResults}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Detailed Results
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BulkUpload;
