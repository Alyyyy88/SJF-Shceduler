import "./App.css";
import { useState } from "react";
function App() {
  const [processes, setProcesses] = useState([]);
  const [numProcesses, setNumProcesses] = useState(1);
  const [newProcess, setNewProcess] = useState({
    id: 1,
    arrivalTime: 0,
    burstTime: 1,
  });
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleNumProcessesChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setNumProcesses(Math.max(1, value));
  };

  const handleProcessChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value) || 0;
    if (parsedValue < 0) {
      setError(`${name} cannot be negative`);
      return;
    }
    setError("");
    setNewProcess({ ...newProcess, [name]: parsedValue });
  };

  const addProcess = () => {
    if (newProcess.arrivalTime < 0 || newProcess.burstTime <= 0) {
      setError(
        "Invalid input: Times must be non-negative and burst time must be greater than 0"
      );
      return;
    }
    setError("");
    setProcesses([...processes, { ...newProcess }]);
    setNewProcess({ id: processes.length + 2, arrivalTime: 0, burstTime: 1 });
  };

  const removeProcess = (id) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const runSJF = () => {
    if (processes.length === 0) {
      setError("Please add at least one process");
      return;
    }
    setError("");

    const sortedProcesses = [...processes].sort(
      (a, b) => a.arrivalTime - b.arrivalTime
    );

    let currentTime = 0;
    let completed = 0;
    let ganttChart = [];
    let processResults = sortedProcesses.map((p) => ({
      ...p,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      responseTime: 0,
      started: false,
    }));

    while (completed < sortedProcesses.length) {
      let availableProcesses = processResults.filter(
        (p) => p.arrivalTime <= currentTime && p.completionTime === 0
      );

      if (availableProcesses.length === 0) {
        let nextArrival = Math.min(
          ...processResults
            .filter((p) => p.completionTime === 0)
            .map((p) => p.arrivalTime)
        );
        currentTime = nextArrival;
        continue;
      }

      let shortestJob = availableProcesses.reduce((prev, curr) =>
        prev.burstTime < curr.burstTime ? prev : curr
      );

      const startTime = currentTime;
      currentTime += shortestJob.burstTime;
      const index = processResults.findIndex((p) => p.id === shortestJob.id);

      processResults[index].completionTime = currentTime;
      processResults[index].turnaroundTime =
        processResults[index].completionTime -
        processResults[index].arrivalTime;
      processResults[index].waitingTime =
        processResults[index].turnaroundTime - processResults[index].burstTime;
      processResults[index].responseTime =
        startTime - processResults[index].arrivalTime;

      ganttChart.push({
        id: shortestJob.id,
        startTime,
        endTime: currentTime,
      });

      completed++;
    }

    const avgTurnaroundTime =
      processResults.reduce((sum, p) => sum + p.turnaroundTime, 0) /
      processResults.length;
    const avgWaitingTime =
      processResults.reduce((sum, p) => sum + p.waitingTime, 0) /
      processResults.length;
    const avgResponseTime =
      processResults.reduce((sum, p) => sum + p.responseTime, 0) /
      processResults.length;

    setResults({
      processes: processResults,
      ganttChart,
      avgTurnaroundTime,
      avgWaitingTime,
      avgResponseTime,
    });
  };

  const reset = () => {
    setProcesses([]);
    setNumProcesses(1);
    setNewProcess({ id: 1, arrivalTime: 0, burstTime: 1 });
    setResults(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Shortest Job First (Non-Preemptive) Scheduler
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Process Entry</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">
                Process ID
              </label>
              <input
                type="text"
                value={newProcess.id}
                disabled
                className="px-3 py-2 border border-gray-300 rounded w-full bg-gray-100"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">
                Arrival Time
              </label>
              <input
                type="number"
                name="arrivalTime"
                value={newProcess.arrivalTime}
                onChange={handleProcessChange}
                min="0"
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">
                Burst Time
              </label>
              <input
                type="number"
                name="burstTime"
                value={newProcess.burstTime}
                onChange={handleProcessChange}
                min="1"
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="self-end">
              <button
                onClick={addProcess}
                className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Process
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Process List</h2>
          {processes.length === 0 ? (
            <p className="text-gray-500 italic">No processes added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Process ID</th>
                    <th className="border px-4 py-2">Arrival Time</th>
                    <th className="border px-4 py-2">Burst Time</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process) => (
                    <tr key={process.id}>
                      <td className="border px-4 py-2 text-center">
                        P{process.id}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.arrivalTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.burstTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => removeProcess(process.id)}
                          className="px-3 py-1 bg-red-600 cursor-pointer text-white rounded hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={runSJF}
            className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
          >
            Run SJF Algorithm
          </button>
          <button
            onClick={reset}
            className="px-4 cursor-pointer py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        {results && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Results</h2>

            <h3 className="text-lg font-medium mb-2">Gantt Chart</h3>
            <div className="flex  mb-6 relative">
              {results.ganttChart.map((item, index) => {
                const colors = [
                  "bg-blue-500 border-blue-600",
                  "bg-green-500 border-green-600",
                  "bg-purple-500 border-purple-600",
                  "bg-yellow-500 border-yellow-600",
                  "bg-red-500 border-red-600",
                  "bg-indigo-500 border-indigo-600",
                  "bg-pink-500 border-pink-600",
                ];
                const colorClass = colors[item.id % colors.length];

                return (
                  <div key={index} className="flex flex-col">
                    <div
                      className={`h-12 flex items-center justify-center text-white border min-w-[60px] ${colorClass}`}
                      style={{
                        width: `${
                          Math.max(item.endTime - item.startTime, 1) * 10
                        }px`,
                      }}
                    >
                      P{item.id}
                    </div>
                    <div className="text-xs mt-1">{item.startTime}</div>
                  </div>
                );
              })}
              <div
                className="mt-8"
                style={{
                  left: `${results.ganttChart.reduce(
                    (acc, item) =>
                      acc + Math.max(item.endTime - item.startTime, 1) * 10,
                    0
                  )}px`,
                  transform: "translateY(18px)",
                }}
              >
                <div className="text-xs">
                  {results.ganttChart[results.ganttChart.length - 1].endTime}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-2">Process Details</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Process ID</th>
                    <th className="border px-4 py-2">Arrival Time</th>
                    <th className="border px-4 py-2">Burst Time</th>
                    <th className="border px-4 py-2">Completion Time</th>
                    <th className="border px-4 py-2">Turnaround Time</th>
                    <th className="border px-4 py-2">Waiting Time</th>
                    <th className="border px-4 py-2">Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.processes.map((process) => (
                    <tr key={process.id}>
                      <td className="border px-4 py-2 text-center">
                        {process.id}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.arrivalTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.burstTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.completionTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.turnaroundTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.waitingTime}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {process.responseTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mb-2">Average Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded shadow">
                <p className="text-sm text-blue-800 font-medium">
                  Average Turnaround Time
                </p>
                <p className="text-2xl">
                  {results.avgTurnaroundTime.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded shadow">
                <p className="text-sm text-green-800 font-medium">
                  Average Waiting Time
                </p>
                <p className="text-2xl">{results.avgWaitingTime.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded shadow">
                <p className="text-sm text-purple-800 font-medium">
                  Average Response Time
                </p>
                <p className="text-2xl">{results.avgResponseTime.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

export default App;
