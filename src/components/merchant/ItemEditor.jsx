import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import FoodImage from "../ui/FoodImage.jsx";
import { Field } from "../ui/FormField.jsx";
import { inputClass } from "../ui/formStyles.js";
import { Sheet, Switch, btnDanger, btnGhost, btnPrimary } from "./ui.jsx";
import { LIMITS } from "../../lib/menuDoc.js";
import { prepareImage } from "../../services/imageCompress.js";
import { api } from "../../services/api.js";

const PLACEHOLDER = "menu/placeholder.svg";

/** Add / edit a dish. Photo uploads immediately (compressed in the browser); everything else is saved to the draft. */
export default function ItemEditor({ item, categories, onSave, onDelete, onClose }) {
  const isNew = !item.id;
  const [form, setForm] = useState({ ...item, price: item.price ? String(item.price) : "" });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const pick = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await api.merchant.uploadImage(await prepareImage(file, form.imageStyle));
      set("image", url);
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = () => {
    const next = {};
    const name = form.name.trim();
    const price = Number(form.price);
    if (name.length < 2 || name.length > LIMITS.name) next.name = `Name must be 2–${LIMITS.name} characters.`;
    if (!Number.isInteger(price) || price < 1) next.price = "Enter the price in whole naira, e.g. 1500.";
    if (!form.category) next.category = "Choose a category.";
    if (form.description.length > LIMITS.description) next.description = `Keep it under ${LIMITS.description} characters.`;
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ ...form, name, price, description: form.description.trim(), image: form.image || PLACEHOLDER });
  };

  const cutout = form.imageStyle === "cutout";

  return (
    <Sheet
      open
      title={isNew ? "Add a dish" : "Edit dish"}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {!isNew && (
            <button type="button" className={`${confirmDelete ? btnDanger : btnGhost} !px-4`} onClick={() => (confirmDelete ? onDelete(item.id) : setConfirmDelete(true))} aria-label="Delete dish">
              <Trash2 size={16} /> {confirmDelete ? "Tap to confirm" : ""}
            </button>
          )}
          <button type="button" className={`${btnPrimary} flex-1`} onClick={submit} disabled={uploading}>{isNew ? "Add to menu" : "Save changes"}</button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-bold text-ink-700">Photo</p>
          <div className="flex gap-3">
            <div className="relative h-28 w-36 flex-shrink-0 overflow-hidden rounded-2xl bg-leaf-800 shadow-card">
              <FoodImage src={form.image || PLACEHOLDER} alt="Preview" variant={form.imageStyle} className={`h-full w-full ${cutout ? "p-3" : ""}`} />
              {uploading && <div className="absolute inset-0 flex items-center justify-center bg-leaf-950/60"><Loader2 className="animate-spin text-white" /></div>}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="photo" onChange={(e) => pick(e.target.files?.[0])} />
              <label htmlFor="photo" className={`${btnGhost} cursor-pointer !py-2.5 text-xs`}><Camera size={16} /> {form.image && form.image !== PLACEHOLDER ? "Change photo" : "Add photo"}</label>
              <div role="group" aria-label="Photo style" className="grid grid-cols-2 rounded-full bg-cream-200 p-0.5 text-xs font-bold">
                {[["cutout", "Cutout"], ["photo", "Photo"]].map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={form.imageStyle === v} onClick={() => set("imageStyle", v)} className={`rounded-full py-2 ${form.imageStyle === v ? "bg-leaf-700 text-white" : "text-ink-600"}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-500">Cutout = dish on a transparent background (PNG). Photo = a normal picture that fills the card.</p>
          {uploadError && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{uploadError}</p>}
        </div>

        <Field id="it-name" label="Name" error={errors.name}><input id="it-name" className={inputClass(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={LIMITS.name} placeholder="Party Jollof Rice" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="it-cat" label="Category" error={errors.category}>
            <select id="it-cat" className={inputClass(errors.category)} value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field id="it-price" label="Price (₦)" error={errors.price}><input id="it-price" className={inputClass(errors.price)} value={form.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="1500" /></Field>
        </div>
        <Field id="it-desc" label="Description" error={errors.description} hint={`${form.description.length}/${LIMITS.description}`}>
          <textarea id="it-desc" rows={3} className={`${inputClass(errors.description)} h-auto py-3`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Smoky, rich and slow-cooked…" />
        </Field>

        <div className="divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-cream-100 px-4">
          {[
            ["isActive", "Show on menu", "Turn off to hide it without deleting."],
            ["isAvailable", "In stock today", "Turn off to show “Sold out today”."],
            ["featured", "Featured", "A highlight you can pin to the home screen."],
          ].map(([key, label, hint]) => (
            <div key={key} className="flex items-center justify-between gap-3 py-3">
              <div><p className="text-sm font-bold">{label}</p><p className="text-[11px] text-ink-500">{hint}</p></div>
              <Switch checked={Boolean(form[key])} onChange={(v) => set(key, v)} label={label} />
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
