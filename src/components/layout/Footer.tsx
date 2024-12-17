// src/components/Footer.tsx
export default function Footer() {
    return (
      <footer className="mt-auto py-6 px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-2">
          {/* 版权信息 */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} 我的导航. All rights reserved.
          </p>
          
          {/* 可选：添加一些链接 */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <a 
              href="#" 
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              关于
            </a>
            <span>•</span>
            <a 
              href="#" 
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              联系我
            </a>
          </div>
        </div>
      </footer>
    );
  }