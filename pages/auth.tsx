import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error) alert("Check your email for confirmation");
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">Login / Sign Up</h1>
        <input type="email" placeholder="Email" className="w-full p-2 mb-2 border" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-2 mb-2 border" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleSignIn} className="w-full bg-indigo-500 text-white py-2 rounded mb-2">Sign In</button>
        <button onClick={handleSignUp} className="w-full bg-gray-200 py-2 rounded">Sign Up</button>
      </div>
    </div>
  );
}
