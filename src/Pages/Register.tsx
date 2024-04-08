import React, { useState } from 'react';
import axios from 'axios';
import { requestURL } from '../lib/globals';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post(`${requestURL}/auth/register`, { name })
      .then(() => {
        navigate('/');
      })
      .catch(error => console.log(error));
  }

  return <div className="fullscreen-page grid-center">
    {/* <form action={`${requestURL}/auth/register`} method="post" id="register-form"> */}
    <form id="register-form" onSubmit={handleSubmit}>
      <h2>Create an account</h2>

      <div className="input-container">
        <label htmlFor="name">display name</label>
        <input type="text" name='name' id='name' value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <button type="submit">Continue</button>
    </form>
  </div>
}

export default Register;
