export const LogSheetTable = ({ logSheet }: { logSheet: LogSheet }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Log Sheet - {logSheet.date}</h3>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {logSheet.entries.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{entry.time}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      entry.status === "Driving"
                        ? "bg-blue-100 text-blue-800"
                        : entry.status === "On Duty"
                        ? "bg-yellow-100 text-yellow-800"
                        : entry.status === "Sleeper Berth"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };