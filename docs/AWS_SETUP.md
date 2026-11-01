# AWS S3 setup (once, ~15 minutes)

You need: an AWS account. Cost at this scale: well under $1/month.

## 1. Create the bucket
1. AWS Console → **S3** → **Create bucket**.
2. Name: `jays-bistro-data` (must be globally unique: add a suffix if taken, e.g. `jays-bistro-data-ng`). Region: **EU (Ireland) eu-west-1** (Cape Town `af-south-1` is closer but must be enabled in your account first).
3. **Block Public Access:** *untick* only the two "…public **bucket policies**…" boxes (the ones about `new public bucket or access point policies` and `any public bucket or access point policies`); **keep the two ACL boxes ticked**. Confirm the warning. (This lets the policy below expose `images/` and nothing else.)
4. Leave encryption at the default (SSE-S3). **Create bucket**.

## 2. Bucket policy — only dish photos are public
Bucket → **Permissions** → **Bucket policy** → paste (replace both `jays-bistro-data` with your bucket name):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadDishPhotosOnly",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::jays-bistro-data/images/*"
    }
  ]
}
```

## 3. Lifecycle rules — keep the bucket tidy automatically
Bucket → **Management** → **Create lifecycle rule** (twice):
| Rule name | Prefix | Action |
|---|---|---|
| `expire-unpaid-invoices` | `invoices/pending/` | Expire current versions **3 days** after creation |
| `expire-login-attempts` | `config/attempts/` | Expire current versions **1 day** after creation |

(Invoices are valid for 24 h; the extra 2 days cover a payment started just before expiry.)

## 4. A least-privilege user for the app
1. **IAM** → **Users** → **Create user** `jays-bistro-app` (no console access).
2. **Permissions** → **Create inline policy** → JSON (replace the bucket name):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"], "Resource": "arn:aws:s3:::jays-bistro-data/*" },
    { "Effect": "Allow", "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::jays-bistro-data" }
  ]
}
```
3. User → **Security credentials** → **Create access key** → *Application running outside AWS* → copy the **Access key ID** and **Secret access key** (shown once).

## 5. Put the values in Vercel
Vercel → project → **Settings → Environment Variables** (Production **and** Preview):

| Name | Value |
|---|---|
| `S3_BUCKET` | `jays-bistro-data` |
| `S3_REGION` | `eu-west-1` |
| `S3_ACCESS_KEY_ID` | from step 4 |
| `S3_SECRET_ACCESS_KEY` | from step 4 |
| `SESSION_SECRET` | 32+ random characters |
| `MERCHANT_BOOTSTRAP_PASSWORD` | a starter password (you change it on first login) |
| `PAYSTACK_SECRET_KEY` | `sk_test_…` first, `sk_live_…` when you go live |
| `PUBLIC_BASE_URL` | `https://jays-bistro.vercel.app` |

> Why `S3_*` and not `AWS_*`? Vercel reserves the `AWS_*` names for its own runtime.

Redeploy after adding variables.

## 6. Verify the bucket is locked down
In a browser (replace names):
- `https://jays-bistro-data.s3.eu-west-1.amazonaws.com/config/merchant.json` → must show **AccessDenied**.
- `https://jays-bistro-data.s3.eu-west-1.amazonaws.com/data/menu.json` → must show **AccessDenied**.
- After uploading a photo from the console, its `images/…` URL must open.

## 7. Paystack
1. Dashboard → **Settings → API Keys & Webhooks**.
2. Copy the **Test Secret Key** into `PAYSTACK_SECRET_KEY`.
3. **Test Webhook URL:** `https://jays-bistro.vercel.app/api/paystack/webhook` → Save.
4. Try an order with a Paystack test card (see Paystack's test-cards page).
5. Going live: complete Paystack's business verification, then put the **Live Secret Key** in Vercel, set the **Live Webhook URL** to the same address, redeploy.
