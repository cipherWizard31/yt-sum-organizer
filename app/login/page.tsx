import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 border border-slate-800 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        
        <form className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              formAction={login}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 rounded-lg border border-slate-700 transition"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}