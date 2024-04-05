import { requestURL } from '../lib/globals';

function Register() {
  return <div className="fullscreen-page grid-center">
    <form action={`${requestURL}/auth/register`} method="post" id="register-form">
      <h1>Sign Up</h1>

      <div className="input-container">
        <input type="text" placeholder='Username' name='name' required />
      </div>

      <button type="submit">Submit</button>
    </form>
  </div>
}

export default Register;
