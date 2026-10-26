import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { LayoutTemplate, Loader2, ReceiptText, Settings, UtensilsCrossed } from "lucide-react";
import MerchantLogin from "../components/merchant/MerchantLogin.jsx";
import MenuManager from "../components/merchant/MenuManager.jsx";
import LayoutManager from "../components/merchant/LayoutManager.jsx";
import OrdersPanel from "../components/merchant/OrdersPanel.jsx";
import SettingsPanel from "../components/merchant/SettingsPanel.jsx";
import { Sheet, Switch, btnGhost, btnPrimary } from "../components/merchant/ui.jsx";
import { SITE, assetUrl } from "../config/site.js";
import { api } from "../services/api.js";

const TABS = [
  { key: "menu", label: "Menu", icon: UtensilsCrossed },
  { key: "home", label: "Home", icon: LayoutTemplate },
  { key: "orders", label: "Orders", icon: ReceiptText },
  { key: "settings", label: "Settings", icon: Settings },
];

/** What gets published (storage adds version/updatedAt itself). */
const content = (doc) => ({ categories: doc.categories, items: doc.items, layout: doc.layout, settings: doc.settings });
const signature = (doc) => JSON.stringify(content(doc));

function Console({ mustChangePassword, onSignedOut, onPasswordChanged }) {
  const [tab, setTab] = useState(mustChangePassword ? "settings" : "menu");
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  const [problems, setProblems] = useState([]);
  const [conflict, setConflict] = useState(null);

  const guard = useCallback((e) => {
    if (e.status === 401) onSignedOut();
    return e;
  }, [onSignedOut]);

  useEffect(() => {
    api.merchant.getMenu().then((doc) => { setSaved(doc); setDraft(doc); }).catch((e) => setLoadError(guard(e).message));
  }, [guard]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const dirty = useMemo(() => Boolean(saved && draft && signature(saved) !== signature(draft)), [saved, draft]);

  // Warn before leaving with unpublished edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const publish = async (docToPublish = draft, base = saved.version) => {
    setPublishing(true);
    setProblems([]);
    try {
      const next = await api.merchant.saveMenu(content(docToPublish), base);
      setSaved(next);
      setDraft(next);
      setConflict(null);
      setNotice("Published. Customers will see it within a minute.");
    } catch (e) {
      guard(e);
      if (e.status === 409) setConflict(e.data.current);
      else if (e.status === 400 && e.data?.errors) setProblems(e.data.errors);
      else setNotice(e.message);
    } finally {
      setPublishing(false);
    }
  };

  /** Pause/resume orders instantly, without publishing other unfinished edits. */
  const toggleOrders = async (value) => {
    try {
      const next = await api.merchant.saveMenu(content({ ...saved, settings: { ...saved.settings, acceptingOrders: value } }), saved.version);
      setSaved(next);
      setDraft((d) => ({ ...d, settings: { ...d.settings, acceptingOrders: value } }));
      setNotice(value ? "Orders are back on." : "Orders paused. Customers can still browse.");
    } catch (e) {
      guard(e);
      setNotice(e.status === 409 ? "The menu changed elsewhere. Reload and try again." : e.message);
    }
  };

  const signOut = async () => {
    await api.merchant.logout().catch(() => {});
    onSignedOut();
  };

  if (loadError) return <div className="flex min-h-svh items-center justify-center bg-cream-100 p-6 text-center"><div><p className="font-bold">Couldn&apos;t load the menu.</p><p className="mt-1 text-sm text-ink-500">{loadError}</p></div></div>;
  if (!draft) return <div className="flex min-h-svh items-center justify-center bg-cream-100" role="status" aria-label="Loading"><Loader2 className="animate-spin text-leaf-700" /></div>;

  return (
    <div className="min-h-svh bg-cream-100 text-ink-900">
      <header className="sticky top-0 z-30 border-b border-cream-300 bg-cream-50/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={assetUrl(SITE.logoPath)} alt="" className="h-9 w-9 rounded-full border border-cream-300 object-cover" />
            <div className="leading-tight"><p className="font-display text-sm font-extrabold text-leaf-800">Kitchen Console</p><p className="text-[11px] text-ink-500">{saved.source === "default" ? "Using starter menu" : `Version ${saved.version}`}</p></div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold">
            <span className={draft.settings.acceptingOrders ? "text-leaf-700" : "text-red-600"}>{draft.settings.acceptingOrders ? "Taking orders" : "Paused"}</span>
            <Switch checked={saved.settings.acceptingOrders} onChange={toggleOrders} label="Taking orders" />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4">
        {tab === "menu" && <MenuManager draft={draft} setDraft={setDraft} />}
        {tab === "home" && <LayoutManager draft={draft} setDraft={setDraft} />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "settings" && <SettingsPanel draft={draft} setDraft={setDraft} forcePasswordChange={mustChangePassword} onPasswordChanged={onPasswordChanged} onLogout={signOut} />}
      </main>

      {notice && <div role="status" className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 mx-auto w-fit max-w-[90%] animate-slide-up rounded-full bg-leaf-900 px-4 py-2 text-xs font-bold text-cream-50 shadow-fab">{notice}</div>}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-50/95 backdrop-blur">
        {dirty && tab !== "orders" && (
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 border-b border-cream-300 bg-sun-100 px-4 py-2">
            <p className="text-xs font-bold text-sun-900">Unpublished changes</p>
            <div className="flex gap-2">
              <button type="button" className={`${btnGhost} !px-4 !py-2 text-xs`} onClick={() => setDraft(saved)} disabled={publishing}>Discard</button>
              <button type="button" className={`${btnPrimary} !px-4 !py-2 text-xs`} onClick={() => publish()} disabled={publishing || mustChangePassword}>{publishing ? "Publishing…" : "Publish"}</button>
            </div>
          </div>
        )}
        <nav aria-label="Console sections" className="mx-auto grid max-w-2xl grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" aria-current={tab === key ? "page" : undefined} disabled={mustChangePassword && key !== "settings"} onClick={() => setTab(key)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold disabled:opacity-30 ${tab === key ? "text-leaf-700" : "text-ink-500"}`}>
              <Icon size={20} strokeWidth={tab === key ? 2.2 : 1.7} />{label}
            </button>
          ))}
        </nav>
      </div>

      <Sheet open={problems.length > 0} title="Fix these first" onClose={() => setProblems([])}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      </Sheet>

      <Sheet open={Boolean(conflict)} title="The menu changed" onClose={() => setConflict(null)}
        footer={<div className="flex flex-col gap-2"><button type="button" className={btnPrimary} onClick={() => { setSaved(conflict); setDraft(conflict); setConflict(null); }}>Load the latest (discard my edits)</button><button type="button" className={btnGhost} onClick={() => publish(draft, conflict.version)}>Publish mine anyway</button></div>}>
        <p className="text-sm text-ink-700">Someone published a newer version (for example from another phone) while you were editing. Choose which version to keep.</p>
      </Sheet>
    </div>
  );
}

/** /merchant — password-locked console for the owner. Not linked from the site, not indexed. */
export default function MerchantPage() {
  const [auth, setAuth] = useState({ status: "checking" });

  useEffect(() => {
    api.merchant.session().then((s) => setAuth(s.authenticated ? { status: "in", mustChange: s.mustChangePassword } : { status: "out" })).catch(() => setAuth({ status: "out" }));
  }, []);

  return (
    <>
      <Helmet>
        <title>Kitchen Console · {SITE.name}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#1E4B28" />
      </Helmet>
      {auth.status === "checking" && <div className="flex min-h-svh items-center justify-center bg-leaf-800" role="status" aria-label="Loading"><Loader2 className="animate-spin text-cream-50" /></div>}
      {auth.status === "out" && <MerchantLogin onUnlocked={(s) => setAuth({ status: "in", mustChange: s.mustChangePassword })} />}
      {auth.status === "in" && <Console key="console" mustChangePassword={auth.mustChange} onSignedOut={() => setAuth({ status: "out" })} onPasswordChanged={() => setAuth({ status: "in", mustChange: false })} />}
    </>
  );
}
