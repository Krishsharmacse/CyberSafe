export default function TestExtensionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">CyberSafe Extension Testing Ground</h1>
        <p className="text-gray-600 mb-8">
          If your Chrome Extension is successfully loaded and running, the links below will automatically be scanned. You should see red warning blocks injected next to the malicious ones!
        </p>

        <div className="space-y-6">
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-800 mb-2">Safe Link (Should have no warning)</h2>
            <a href="https://www.google.com" className="text-blue-600 hover:underline">
              https://www.google.com (Search Engine)
            </a>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <h2 className="font-semibold text-red-800 mb-2">Malicious Link 1: URL Shortener</h2>
            <a href="http://bit.ly/update-billing-info" className="text-blue-600 hover:underline text-lg">
              Click here to update your billing!
            </a>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <h2 className="font-semibold text-red-800 mb-2">Malicious Link 2: IP Address / Strange port</h2>
            <a href="http://192.168.1.100:8080/login.php" className="text-blue-600 hover:underline text-lg">
              Official Bank Server Login Endpoint
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
