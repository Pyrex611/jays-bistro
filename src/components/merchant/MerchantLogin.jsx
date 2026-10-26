import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { SITE, assetUrl } from "../../config/site.js";
import { api } from "../../services/api.js";
import { Field } from "../ui/FormField.jsx";
import { inputClass } from "../ui/formStyles.js";
import { btnPrimary } from "./ui.jsx";

/** Password lock. The browser sends the password to the server over HTTPS; the server checks it against the hash in private storage. */
export default function MerchantLogin({ onUnlocked }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onUnlocked(await api.merchant.login(password));
    } catch (err) {
      setError(err.status === 429 ? `Too many attempts. Try again in ${Math.ceil((err.data?.retryAfter ?? 600) / 60)} min.` : err.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-leaf-800 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-cream-50 p-7 shadow-card" noValidate>
        <img src={assetUrl(SITE.logoPath)} alt="" className="mx-auto h-20 w-20 rounded-full border border-cream-300 object-cover" />
        <h1 className="mt-4 text-center font-display text-xl font-extrabold text-leaf-800">Kitchen Console</h1>
        <p className="mt-1 text-center text-xs text-ink-500">Jay&apos;s Bistro · merchant portal</p>

        <div className="mt-6">
          <Field id="pw" label="Password" error={error}>
            <div className="relative">
              <input id="pw" type={show ? "text" : "password"} autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass(error)} pr-12`} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
        </div>
        <button type="submit" disabled={busy || !password} className={`${btnPrimary} mt-5 w-full`}><Lock size={16} /> {busy ? "Checking…" : "Unlock"}</button>
        <p className="mt-4 text-center text-[11px] text-ink-500">This page is private and isn&apos;t listed on the website.</p>
      </form>
    </div>
  );
}
