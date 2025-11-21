import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Job = {
  id: number;
  company_name: string;
  role: string;
  application_date: string;
  status: string;
  notes: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    const user = supabase.auth.getUser();
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("application_date", { ascending: false });
    if (!error) setJobs(data as Job[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">My Job Applications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow rounded overflow-hidden">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Company</th>
              <th className="p-2">Role</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job.id} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{job.company_name}</td>
                <td className="p-2">{job.role}</td>
                <td className="p-2">{job.application_date}</td>
                <td className="p-2">{job.status}</td>
                <td className="p-2">{job.notes}</td>
                <td className="p-2 flex gap-2">
                  <button className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
