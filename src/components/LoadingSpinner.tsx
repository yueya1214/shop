import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  fullPage?: boolean
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', fullPage = false, text = '加载中...' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 'h-6 w-6'
      case 'large':
        return 'h-16 w-16'
      default:
        return 'h-12 w-12'
    }
  }
  
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${getSize()}`}></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  )
  
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    )
  }
  
  return spinner
}

export default LoadingSpinner 