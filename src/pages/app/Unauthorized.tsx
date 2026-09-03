export default function Unauthorized() {
  return (
    <div className="bg-white rounded shadow p-6 border-l-4 border-red-500">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
      <p className="text-gray-600">You do not have the necessary permissions to access this context or the organization type is invalid.</p>
    </div>
  );
}
