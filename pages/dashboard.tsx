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
  const getToday = () => new Date().toISOString().split("T")[0];


  // Add job form state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState(getToday());
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  


  const [editingJob, setEditingJob] = useState<Job | null>(null);
const [editCompany, setEditCompany] = useState("");
const [editRole, setEditRole] = useState("");
const [editDate, setEditDate] = useState("");
const [editStatus, setEditStatus] = useState("");
const [editNotes, setEditNotes] = useState("");

const openEditModal = (job: Job) => {
  setEditingJob(job);
  setEditCompany(job.company_name);
  setEditRole(job.role);
  setEditDate(job.application_date);
  setEditStatus(job.status);
  setEditNotes(job.notes);
};

const handleSaveEdit = async () => {
  if (!editingJob) return;

  const { error } = await supabase
    .from("job_applications")
    .update({
      company_name: editCompany,
      role: editRole,
      application_date: editDate,
      status: editStatus,
      notes: editNotes,
    })
    .eq("id", editingJob.id);

  if (error) alert(error.message);
  else {
    fetchJobs();
    setEditingJob(null); // close modal
  }
};



  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/auth");
      else fetchJobs();
    };
    checkUser();
  }, []);

  const fetchJobs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", user.id) // <--- filter only the logged-in user's jobs
      .order("application_date", { ascending: false });

    if (!error) setJobs(data as Job[]);
    setLoading(false);
  };

  // Add new job
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("job_applications").insert([
      {
        user_id: user.id, // <--- important
        company_name: company,
        role,
        application_date: date,
        status,
        notes,
      },
    ]);
    if (error) alert(error.message);
    else {
      fetchJobs();
      setCompany("");
      setRole("");
      setDate("");
      setStatus("");
      setNotes("");
    }
  };

  // Update job
  const handleUpdateJob = async (id: number) => {
    const newStatus = prompt("Enter new status:");
    if (!newStatus) return;
    const { error } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) alert(error.message);
    else fetchJobs();
  };

  // Delete job
  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure to delete?")) return;
    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id);
    if (error) alert(error.message);
    else fetchJobs();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">
        My Job Applications
      </h1>

      {/* Add Job Form */}
      <form onSubmit={handleAddJob} className="mb-6 bg-white p-4 rounded shadow">
  <div className="flex flex-col gap-2">
    <input
      placeholder="Company"
      value={company}
      onChange={(e) => setCompany(e.target.value)}
      className="border p-2"
      required
    />
    <input
      placeholder="Role"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="border p-2"
      required
    />
    <input
      type="date"
      placeholder="Application Date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="border p-2"
      required
    />
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="border p-2"
      required
    >
      <option value="">Select Status</option>
      <option value="Applied">Applied</option>
      <option value="Interview">Interview</option>
      <option value="Offer">Offer</option>
      <option value="Rejected">Rejected</option>
    </select>
    <input
      placeholder="Notes"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="border p-2"
    />
    <button type="submit" className="bg-green-500 text-white py-2 rounded">
      Add Job
    </button>
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
                {/* <td className="p-2">{job.status}</td> */}
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded font-semibold ${
                      job.status === "Applied"
                        ? "bg-blue-100 text-blue-800"
                        : job.status === "Interview"
                        ? "bg-yellow-100 text-yellow-800"
                        : job.status === "Offer"
                        ? "bg-green-100 text-green-800"
                        : job.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>

                <td className="p-2">{job.notes}</td>
                <td className="p-2 flex gap-2">
                  <button
  onClick={() => openEditModal(job)}
  className="bg-yellow-400 px-2 py-1 rounded"
>
  Edit
</button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingJob && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-96">
      <h2 className="text-xl font-bold mb-4">Edit Job</h2>

      <div className="flex flex-col gap-2">
        <input
          placeholder="Company"
          value={editCompany}
          onChange={(e) => setEditCompany(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Role"
          value={editRole}
          onChange={(e) => setEditRole(e.target.value)}
          className="border p-2"
        />
        <input
          type="date"
          placeholder="Application Date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          className="border p-2"
        />
        <select
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value)}
          className="border p-2"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input
          placeholder="Notes"
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          className="border p-2"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setEditingJob(null)}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
