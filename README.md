# CBG Data Entry – web forms

Seven mobile-friendly data-entry forms, styled like the CBG Operations Dashboard, (one per OPS department) that add rows to the department Excel trackers on the **CBG Supply Chain Hub** SharePoint site. Rows arrive with `Status = Pending` for the data clerks to verify, exactly as in the Microsoft Forms version of the flow.

| File | What it is | Edit it? |
| --- | --- | --- |
| `index.html` | The whole app in one file: the 7 forms (Brewing = the full Star Malt Brew Process Sheet GR-BOD-R54-A, pages 1–3) (questions and choices in `window.CBG_FORMS` near the top of the scripts), validation, show/hide rules, live calculations, offline queue and default demo settings. Opens on its own. | To change questions, choices, rules or calculations |
| `config.js` | Optional. Live/demo mode, sign-in IDs, SharePoint site, tracker file paths, table names. When it sits next to `index.html` it overrides the built-in demo settings. | Yes – once, when going live |
| `flow-schemas/*.json` | JSON schemas for the Power Automate HTTP trigger (Flow mode only) | No |

The Excel trackers are the `_DEMO.xlsx` files from the first demo pack, uploaded to the department folders in the site's **Documents** library. Question names in `window.CBG_FORMS` (inside `index.html`) must match the tracker table's column headers exactly; that's how each answer finds its column.

## What the forms do

- Remember the person's name on the device and fill it in on every form.
- Default today's date, the current shift (Day 06–14, Evening 14–22, Night), month and week (W1–W5), and 480 planned minutes.
- **Packaging:** the downtime cause is asked only when downtime is above 0; live run time and efficiency (rated speeds in `window.CBG_FORMS`).
- **QA:** complaint questions appear only for *Customer Complaint*; lab questions only otherwise.
- **HSE:** High or Critical severity shows a "make safe and tell your supervisor now" notice.
- **Facilities / Operations:** live kWh, water, fuel and CO2 per hl; plan attainment and cost per case.
- **No signal?** The entry is saved on the device and sent automatically when the connection returns (badge in the top bar).

## Modes (set `mode` in `config.js`)

| | `demo` | `graph` | `flow` |
| --- | --- | --- | --- |
| Where entries go | This device only | Straight into the Excel table via Microsoft Graph | A Power Automate flow, which adds the row |
| Staff sign in? | No | Yes, CBG Microsoft 365 account | No |
| Staff need edit access to the tracker files? | – | **Yes** | No (the flow runs as its owner) |
| Licence | – | Included with Microsoft 365 | **Power Automate Premium** (HTTP trigger) |
| IT set-up | None | One app registration | 7 flows |

**Use `flow`** (recommended): staff don't sign in and can't open the trackers. It needs one Power Automate Premium licence for the flow owner. `graph` is only for a setup where everyone signs in with a CBG account.

### Graph mode set-up (IT, about 20 min)

1. **Entra admin centre → App registrations → New registration.** Name: *CBG Data Entry*. Supported accounts: *this organisation only*.
2. **Authentication → Add a platform → Single-page application.** Redirect URI = the address where the app is hosted, e.g. `https://<org>.github.io/cbg-data-entry/`.
3. **API permissions → Microsoft Graph → Delegated:** `Files.ReadWrite.All`, `Sites.Read.All`. Click **Grant admin consent**, so staff aren't asked to approve it themselves.
4. In `config.js`: `mode: "graph"`, plus `tenantId` and `clientId` from the app's Overview page, `siteHostname` (e.g. `caribgrenada.sharepoint.com`) and `sitePath` (e.g. `/sites/CBGSupplyChainHub`).
5. Give the data-entry staff **Edit** access to their department folder in Documents. Clerks keep Edit on all folders.
6. Open the app, press **Sign in with CBG account**, then submit a test entry. Check that a new row appears at the bottom of the tracker's Data sheet.

### Flow mode set-up (recommended: no sign-in, about 20 min)

One flow serves all seven forms. Each entry arrives with the tracker's file path, its table name, and a ready-made `row` whose keys are the tracker's column headers. One Excel step therefore writes any form, including the full brew sheet, with no column mapping. The flow runs as its owner, so staff never sign in and never need access to the trackers.

1. **Licence:** the *When an HTTP request is received* trigger needs **Power Automate Premium** for the flow owner (one licence, not one per user).
2. **Power Automate → Create → Instant cloud flow → When an HTTP request is received.** Name it *CBG Data Entry*. Set **Who can trigger the flow** to *Anyone*.
3. **Request Body JSON Schema:** paste `flow-schemas/ALL_FORMS_schema.json`.
4. Add **Excel Online (Business) → Add a row into a table**:
   - **Location:** the *CBG Supply Chain Hub* site. **Document Library:** *Documents*.
   - **File:** choose *Enter custom value* and insert the trigger's `file` value (e.g. `/01 Brewing & Fermentation/CBG_Brew_Process_2026_DEMO.xlsx`).
   - **Table:** *Enter custom value*, then insert `table`.
   - Because file and table are now dynamic, the action shows one **Row** box instead of column boxes. Insert the trigger's `row` value there.
5. Add a **Response**: status code `200`, header `Access-Control-Allow-Origin` = `*`.
6. **Save**, copy the trigger's **HTTP POST URL** into `flowUrl` in `config.js`, and set `mode: "flow"`.
7. **Test every form once:** save an entry, then check that the row appears at the bottom of that tracker's Data sheet with Status = Pending. **Run history** shows any failure. The usual cause is a column header that no longer matches a question name.

**If your tenant doesn't show the single Row box** (older connector versions): add a **Switch** on `form` with one case per form. Each case gets its own *Add a row into a table* with that tracker's file and table picked from the lists, and each column mapped to the matching item under `values`. For Brewing that means every box on the sheet, so try the Row box first.

**Alerts:** add a **Condition** before the Excel step. If `form` is `hse` and `values` › `Severity` is High or Critical, post to Teams. If `form` is `packaging` and `Downtime (min)` is over 60, email the supervisor.

The URL is the only key to the flow. Keep it out of public places, and if it leaks, delete and re-add the trigger to get a new one.

## Hosting

The app is one HTML file (plus the optional `config.js`), so any static web host works. It has no server and holds no secrets: the client ID isn't secret, and access is controlled by sign-in or by the flow URL.

- **GitHub Pages:** create a repository, e.g. `cbg-data-entry`, upload `index.html` and `config.js`, then **Settings → Pages → Deploy from branch (main)**. The site address becomes the redirect URI in step 2 above. GitHub Pages sites are publicly reachable even when the repository is private on most plans, so in flow mode keep the flow URLs out of anything you don't want public, or use graph mode.
- **Azure Static Web Apps (free tier):** an alternative that IT can restrict to CBG sign-ins.

Opening `index.html` straight from a computer works for demo mode only. Sign-in needs the app on a web address.

## Linking from SharePoint

- **Hub home page → Quick links:** one button per form using deep links, e.g. `https://<host>/cbg-data-entry/#f-packaging`. The form keys are `brewing`, `hse`, `facilities`, `packaging`, `logistics`, `operations`, `qa`.
- **QR codes:** make one per deep link (in Edge, open the link → right-click → *Create QR code for this page*) and post them at the line, brewhouse, lab, warehouse and dispatch.
- **Embedding the app inside a SharePoint page** (Embed web part) needs the host domain added under *Site settings → HTML Field Security*. Microsoft sign-in won't run inside an embedded frame, so in graph mode link to the app rather than embedding it.

## Changing a form

- Change a question's wording or add a choice in `window.CBG_FORMS` in `index.html` **and** rename/add the same column (or Lists-sheet choice) in the tracker. Names must match exactly.
- Show/hide rules live in `rules()` and live calculations in `calcs()` in `index.html`.
- Before go-live, delete the `SAMPLE-` rows from the trackers.

## Hosting next to the operations dashboard

The app uses the same look as `cbggrenada.github.io/opsdashboard` (app bar, icon rail, black page band, zebra tables, the same light/dark setting). It can live in that repository as `forms.html` (rename `index.html`, upload with `config.js` named `forms-config.js` and change the `<script src="config.js">` line to match) so the forms open at `https://cbggrenada.github.io/opsdashboard/forms.html`, or in its own repository.
