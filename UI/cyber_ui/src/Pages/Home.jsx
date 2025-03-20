// import React from 'react'
// import { Link } from 'react-router-dom'

// export default function Home() {
//   return (
//     <div >
//         <h1 >
//             Milestone 2
//         </h1>
//        <div>
//         <Link to="/crptograpic-apis">
//             <h2>Cryptographic APIs</h2>
//         </Link>
//         <h3>Key Generation</h3>
//         <h3>Encrption</h3>
//         <h3>Decryption</h3>
//         <Link to='/hashing-apis'>
//             <h2>Hashing APIs</h2>
//         </Link>
//         <h3>Hash Generation</h3>
//         <h3>Hash Verification</h3>
//        </div>

//     </div>
    
//   )
// }



import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8">CypherGo</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <Link to="/crptograpic-apis" className="text-2xl font-semibold text-blue-400 hover:text-blue-500">Cryptographic APIs</Link>
        <div className="mt-4 text-lg text-gray-300">
          <h3 className="mt-2">🔑 Key Generation</h3>
          <h3 className="mt-2">🔐 Encryption</h3>
          <h3 className="mt-2">🔓 Decryption</h3>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center mt-6">
        <Link to="/hashing-apis" className="text-2xl font-semibold text-blue-400 hover:text-blue-500">Hashing APIs</Link>
        <div className="mt-4 text-lg text-gray-300">
          <h3 className="mt-2">🔄 Hash Generation</h3>
          <h3 className="mt-2">✅ Hash Verification</h3>
        </div>
      </div>
    </div>
  );
}
