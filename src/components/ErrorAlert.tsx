<<<<<<< HEAD
import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <div className="flex items-center">
        <FiAlertCircle className="mr-2 flex-shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button
            className="ml-auto bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded text-sm"
            onClick={onRetry}
          >
            重试
          </button>
        )}
      </div>
    </div>
  )
}

=======
import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <div className="flex items-center">
        <FiAlertCircle className="mr-2 flex-shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button
            className="ml-auto bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-3 rounded text-sm"
            onClick={onRetry}
          >
            重试
          </button>
        )}
      </div>
    </div>
  )
}

>>>>>>> master
export default ErrorAlert 