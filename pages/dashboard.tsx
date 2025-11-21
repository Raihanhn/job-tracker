import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

type Job = {
  id: number;
  company_name: string;
  role: string;
  application_date: string;
  status: string;
  notes: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Add job form state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/auth");
      else fetchJobs();
    };
    checkUser();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("application_date", { ascending: false });
    if (!error) setJobs(data as Job[]);
    setLoading(false);
  };

  // Add new job
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("job_applications").insert([{
      company_name: company,
      role,
      application_date: date,
      status,
      notes
    }]);
    if (error) alert(error.message);
    else {
      fetchJobs();
      setCompany(""); setRole(""); setDate(""); setStatus(""); setNotes("");
    }
  };

  // Update job
  const handleUpdateJob = async (id: number) => {
    const newStatus = prompt("Enter new status:");
    if (!newStatus) return;
    const { error } = await supabase.from("job_applications").update({ status: newStatus }).eq("id", id);
    if (error) alert(error.message);
    else fetchJobs();
  };

  // Delete job
  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure to delete?")) return;
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchJobs();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">My Job Applications</h1>

      {/* Add Job Form */}
      <form onSubmit={handleAddJob} className="mb-6 bg-white p-4 rounded shadow">
        <div className="flex flex-col gap-2">
          <input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} className="border p-2"/>
          <input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} className="border p-2"/>
          <input type="date" placeholder="Application Date" value={date} onChange={e => setDate(e.target.value)} className="border p-2"/>
          <input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} className="border p-2"/>
          <input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="border p-2"/>
          <button type="submit" className="bg-green-500 text-white py-2 rounded">Add Job</button>
        </div>
      </form>

      {/* Jobs Table */}
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
                  <button onClick={() => handleUpdateJob(job.id)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDeleteJob(job.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
