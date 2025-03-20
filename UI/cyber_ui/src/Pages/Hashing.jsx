import React, { useState } from "react";
import config from "../Config";
import { useNavigate } from "react-router-dom";

export default function Hashing() {
    const [formData, setFormData] = useState({ algorithm: "MD5" })
    const [error, setError] = useState(null)
    const [generatedHash, setGeneratedHash] = useState(null)
    const [verificationResult, setVerificationResult] = useState(null)
    const [copy,setCopy] = useState(false)
    const navigate = useNavigate()

    const handleChange = (event) => {
        setFormData({
          ...formData,
          [event.target.id] : event.target.value
        })
      }
      
      console.log(formData)

      const handleGenerateSubmit = async (event) => {
        event.preventDefault();
        setCopy(false)
        try {
          const res = await fetch(`${config.API_BASE_URL}/generate-hash`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          const data = await res.json();
          if (data.success === false) {
            setError(data.message);
            return;
          }
          setError(null);
          setGeneratedHash(data);
        } catch (error) {
          setError(error.message);
        }
      }

      const handleValidateSubmit = async (event) => {
        event.preventDefault();
        try {
          const res = await fetch(`${config.API_BASE_URL}/verify-hash`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          const data = await res.json();
          if (data.success === false) {
            setError(data.message);
            return;
          }
          setError(null);
          setVerificationResult(data);
        } catch (error) {
          setError(error.message);
        }
      }

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopy(true);
      }

      const routeChange = () => {
        navigate('/')
      }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Hashing APIs</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Hash Generation</h2>
        <form className="flex flex-col gap-4" onSubmit={handleGenerateSubmit}>
          <input type="text" placeholder="Message" id="data" onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" />
          <select name="Select Algorithm" id="algorithm" value={formData.algorithm} onChange={handleChange} className="p-2 rounded bg-gray-700 text-white">
            <option value="MD5">MD5</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md text-white">Generate Hash</button>
        </form>
        {error && <p className="mt-4 text-red-500">Error: {error}</p>}
        {!error && generatedHash && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg text-white text-sm">
            <p><strong>Algorithm:</strong> {generatedHash.algorithm}</p>
            <p><strong>Hash Value:</strong> 
              <span className="break-all bg-gray-900 p-2 rounded-md inline-block">{generatedHash.hash_value}</span>
              <button 
                className="ml-2 bg-green-600 hover:bg-green-800 text-white px-2 py-1 rounded" 
                onClick={() => copyToClipboard(generatedHash.hash_value)}>
                {copy ? 'Copied' : 'Copy'}
              </button>
            </p>
          </div>
        )}
        
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Hash Verification</h2>
        <form className="flex flex-col gap-4" onSubmit={handleValidateSubmit}>
          <input type="text" placeholder="Message" id="data" onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" />
          <input type="text" placeholder="Hashed Value" id="hash_value" onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" />
          <select name="Select Algorithm" id="algorithm" value={formData.algorithm} onChange={handleChange} className="p-2 rounded bg-gray-700 text-white">
            <option value="MD5">MD5</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md text-white">Verify Hash</button>
        </form>
        {verificationResult && (
          <div className={`mt-4 p-4 rounded-lg text-white ${verificationResult.is_valid ? 'bg-green-600' : 'bg-red-600'}`}>
            <p><strong>Result:</strong> {verificationResult.message}</p>
          </div>
        )}
        {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      </div>
      <div className="mt-5">
        <button onClick={routeChange} className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md text-white">Back to Home</button>
      </div>
    </div>
  );
}