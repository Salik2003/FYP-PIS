import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toolboxEngineAPI } from "../common/toolbox-engine.api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await toolboxEngineAPI.post('/api/login', {
        password,
        username,
      });

      const token = response.data.access_token
        ;
      localStorage.setItem("access_token", token);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
   <div className="flex justify-center items-center h-screen bg-white font-['Inter',sans-serif]">
  <form
    className="flex flex-col items-center gap-[12px] p-[32px] rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.05)] w-[300px]"
    onSubmit={handleLogin}
  >
    <h2 className="mb-[12px] font-semibold font-['Segoe_UI',sans-serif] text-[#222]">
      Toolbox Engine
    </h2>

    {error && (
      <p className="text-[#e53935] text-[13px] text-center">{error}</p>
    )}

    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      className="w-full px-[12px] py-[10px] border border-[#ccc] rounded-[8px] text-[14px] outline-hidden transition focus:border-[#4a6cf7]"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full px-[12px] py-[10px] border border-[#ccc] rounded-[8px] text-[14px] outline-hidden transition focus:border-[#4a6cf7]"
    />

    <div className="flex gap-[10px] w-full mt-[8px]">
      <button
        type="submit"
        className="flex-1 px-[12px] py-[10px] text-[14px] bg-[#3366ff] text-white rounded-[8px] border-none hover:bg-[#254eda] transition"
      >
        Submit
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="flex-1 px-[12px] py-[10px] text-[14px] bg-[#3366ff] text-white rounded-[8px] border-none hover:bg-[#254eda] transition"
      >
        Clear
      </button>
    </div>
  </form>
</div>

  );
};

export default LoginPage;
