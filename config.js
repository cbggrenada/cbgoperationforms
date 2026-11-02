/* CBG Data Entry configuration. Edit this file only; index.html never needs changing.
   mode: "demo"  = entries stay on the device (for showing the forms)
         "graph" = staff sign in with their CBG Microsoft 365 account; rows are added to the Excel tables directly
         "flow"  = each form posts to its own Power Automate flow (HTTP trigger, Premium licence), which adds the row */
window.CBG_CONFIG = {
  mode: "flow",

  // flow mode (recommended, no sign-in): the HTTP POST URL of the one "CBG Data Entry" flow, used by every form
  flowUrl: "https://default4499cfa11a1d47c8a72ff6ae396519.51.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/00/workflows/42f6d716e6db48eeb33abe4835542d9a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VtofMk4lkK8T-eqXnHl59XJqtasiUNDch9UEOIRWJ6w",

  // graph mode: from the Entra ID app registration (see README)
  tenantId: "",          // Directory (tenant) ID
  clientId: "",          // Application (client) ID
  siteHostname: "yourtenant.sharepoint.com",
  sitePath: "/sites/CBGSupplyChainHub",

  // file = path inside the site's Documents library; table = Excel table name
  // flowUrl here is optional: only if a form should use its own flow instead of the shared one
  forms: {
    brewing: { file: "01 Brewing & Fermentation/CBG_Brew_Process_2026_DEMO.xlsx", table: "tblBrewing", flowUrl: "" },
    hse: { file: "02 HSE/CBG_HSE_Register_2026_DEMO.xlsx", table: "tblHSE", flowUrl: "" },
    facilities: { file: "03 Facilities/CBG_Utilities_Weekly_2026_DEMO.xlsx", table: "tblUtilities", flowUrl: "" },
    packaging: { file: "04 Packaging/CBG_Packaging_Line_Shift_2026_DEMO.xlsx", table: "tblPackaging", flowUrl: "" },
    logistics: { file: "05 Logistics/CBG_Logistics_Dispatch_2026_DEMO.xlsx", table: "tblLogistics", flowUrl: "" },
    operations: { file: "06 Operations/CBG_Operations_Plan_2026_DEMO.xlsx", table: "tblOperations", flowUrl: "" },
    qa: { file: "07 Quality Assurance/CBG_QA_Lab_Complaints_2026_DEMO.xlsx", table: "tblQA", flowUrl: "" },
  }
};