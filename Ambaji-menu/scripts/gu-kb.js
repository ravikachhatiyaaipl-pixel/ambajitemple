// gu-kb.js — Gujarati Knowledge Base
// ai-knowledge.js ની knowledgeBase જેવી જ structure, બધા responses ગુજરાતીમાં

const knowledgeBaseGu = {

  // ── ORGANIZATION MANAGEMENT ─────────────────────────
  Zone: {
    keywords: ['zone','ઝોન','ઝોન બનાવો','ઝોન માસ્ટર','create zone','zone master','manage zone','update zone','delete zone'],
    response: `📄 **ઝોન કેવી રીતે બનાવવો:**\n\n1. Masters → Organization → Zone Master\n2. "Add New Zone" ક્લિક કરો\n3. Zone Name, Zone Code, Status ભરો\n4. "Create Zone" ક્લિક કરો → Confirm\n\n**Edit:** List → Edit → Update Zone → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Zone Master →](/masters/organization-management/zone-master)`,
  },

  ward: {
    keywords: ['ward','વોર્ડ','create ward','ward master','manage ward','update ward','delete ward'],
    response: `📄 **વોર્ડ કેવી રીતે બનાવવો:**\n\n1. Masters → Organization → Ward Master\n2. "Add New Ward" ક્લિક કરો\n3. Ward Name, Ward Code, Zone, Status ભરો\n4. "Create Ward" → Confirm\n\n**Edit:** List → Edit → Update Ward → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Ward Master →](/masters/organization-management/ward-master)`,
  },

  area: {
    keywords: ['area','વિસ્તાર','create area','area master','manage area','update area','delete area'],
    response: `📄 **Area (વિસ્તાર) કેવી રીતે બનાવવો:**\n\n1. Masters → Organization → Area Master\n2. "Add New Area" ક્લિક કરો\n3. Area Name, Area Code, Ward, Status ભરો\n4. "Create Area" → Confirm\n\n**Edit:** List → Edit → Update Area → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Area Master →](/masters/organization-management/area-master)`,
  },

  City_civic_center: {
    keywords: ['city civic center','ccc','civic center','સિટી સિવિક સેન્ટર','add city civic center','delete city civic center'],
    response: `📄 **City Civic Center (CCC) કેવી રીતે બનાવવો:**\n\n1. Masters → Organization → City Civic Center Master\n2. "Add New City Civic Center" ક્લિક કરો\n3. CCC Name, CCC Code, Area/Ward, Status ભરો\n4. "Create CCC" → Confirm\n\n**Edit:** List → Edit → Update CCC → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [CCC Master →](/masters/organization-management/city-civic-centers-master)`,
  },

  Department: {
    keywords: ['department','branch','વિભાગ','create department','manage department','add department','delete department'],
    response: `📄 **Department (વિભાગ) કેવી રીતે ઉમેરવો:**\n\n1. Masters → Organization → Department/Branch Master\n2. "Add New Department" ક્લિક કરો\n3. Department Name, Group Codes, Status, Visibility ભરો\n4. "Save" ક્લિક કરો\n\n**Edit:** List → Edit → Save Changes → Confirm\n**Delete:** List → Delete → OK\n\n🔗 [Department Master →](/masters/organization-management/department-master)`,
  },

  // ── GRANT MANAGEMENT ────────────────────────────────
  grant_type: {
    keywords: ['grant type','grant master','create grant','add grant','delete grant','edit grant'],
    response: `📄 **Grant Type Master:**\n\n1. Masters → Grant Management → Grant Type Master\n2. "Add New Grant Type" ક્લિક કરો\n3. Grant Name, Grant Code, Grant Category, Grant Nature, Fund Source, Status ભરો\n4. "Create Grant Type" ક્લિક કરો\n\n**Edit:** List → Edit → Update Grant Type → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Grant Type Master →](/masters/grant-management/grant-type-master)`,
  },

  grant_category: {
    keywords: ['grant category','category master','create category','delete category','manage category'],
    response: `📄 **Grant Category Master:**\n\n1. Masters → Grant Management → Grant Category Master\n2. "Add New Grant Category" ક્લિક કરો\n3. Category Name, Category Code, Status ભરો\n4. "Create Grant Category" ક્લિક કરો\n\n**Edit:** List → Edit → Update Grant Category → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Grant Category →](/masters/grant-management/grant-category-master)`,
  },

  grant_fund_source: {
    keywords: ['grant fund source','fund source','create grant fund source','delete grant fund source'],
    response: `📄 **Grant Fund Source (Authority) Master:**\n\n1. Masters → Grant Management → Grant Fund Source\n2. Authority Name, Authority Code, Status ભરો\n3. "Create Grant Authority" ક્લિક કરો\n\n**Edit:** List → Edit → Update Grant Authority → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Grant Fund Source →](/masters/grant-management/grant-authorities-master)`,
  },

  grant_department_mapping: {
    keywords: ['grant department mapping','department mapping','grant department','department assignment'],
    response: `📄 **Department-Grant Mapping:**\n\n1. Masters → Grant Management → Department-Grant Type Mapping\n2. "Add New Mapping" ક્લિક કરો\n3. Department, Grant Type / Budget Head પસંદ કરો\n4. "Create Mapping" ક્લિક કરો\n\n**Edit:** List → Edit → Update Mapping → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Grant Dept Mapping →](/masters/grant-management/gra-dept-map)`,
  },

  scheme_master: {
    keywords: ['scheme master','create scheme','add scheme','delete scheme','manage scheme'],
    response: `📄 **Scheme Master:**\n\n1. Masters → Grant Management → Scheme Master\n2. "Add New Scheme" ક્લિક કરો\n3. Scheme Name, Code, Grant Type, Start Date, End Date, Budget, Status ભરો\n4. "Create Scheme" → Confirm\n\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Scheme Master →](/masters/grant-management/scheme-master)`,
  },

  debt_type_master: {
    keywords: ['debt type master','create debt type','add debt type','delete debt type'],
    response: `📄 **Debt Type Master:**\n\n1. Masters → Grant Management → Debt Type Master\n2. "Add New Debt Type" ક્લિક કરો\n3. Debt Name, Code, Category, Status ભરો\n4. "Create Debt Type" → Confirm\n\n**Edit:** List → Edit → Update Debt Type → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Debt Type Master →](/masters/grant-management/debt-type-master)`,
  },

  // ── TENDER MANAGEMENT ───────────────────────────────
  tender_work_type_master: {
    keywords: ['tender work type master','create tender work type','add tender work type','delete tender work'],
    response: `📄 **Tender Work Type Master:**\n\n1. Masters → Tender Management → Tender Work Type Master\n2. "Add New Tender Work Type" ક્લિક કરો\n3. Work Name, Work Code, Status ભરો\n4. "Create Tender Work Type" → Confirm\n\n**Edit:** List → Edit → Update Tender Work → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Tender Work Type →](/masters/tender-management/tender-work-type)`,
  },

  emdbg_type_master: {
    keywords: ['emdbg type master','create emdbg type','add emdbg type','delete emdbg type'],
    response: `📄 **EMDBG Type Master:**\n\n1. Masters → Tender Management → EMDBG Type Master\n2. "Add New EMDBG Type" ક્લિક કરો\n3. EMDBG Type Name, Code, Percentage, Status ભરો\n4. "Create EMDBG Type" → Confirm\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [EMDBG Type →](/masters/tender-management/emdbg-type)`,
  },

  invoice_tax_parameter_master: {
    keywords: ['invoice tax parameter','tax parameter','tax setup','create tax parameter','delete invoice tax parameter'],
    response: `📄 **Invoice Tax Parameter Master:**\n\n1. Masters → Financial Accounting → Invoice Tax Parameters\n2. "Add New Tax Parameters" ક્લિક કરો\n3. Tender Work, Effective Date પસંદ કરો\n4. "Add More" ક્લિક કરી Tax Type, Add/Deduct, Percentage, Ledger Account, Formula ભરો\n5. "Create Tax Parameters" ક્લિક કરો\n\n**Edit:** List → Edit → Update Tax Parameter → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Invoice Tax Parameter →](/masters/financial-accounting/invoice-tax-parameter)`,
  },

  challan_type_master: {
    keywords: ['challan type master','create challan type','add challan type','delete challan type'],
    response: `📄 **Challan Type Master:**\n\n1. Masters → Financial Accounting → Challan Type Master\n2. "Add New Challan Type" ક્લિક કરો\n3. Challan Type Name, Code, Status ભરો\n4. "Create Challan Type" → Confirm\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Challan Type →](/masters/tender-management/challan-type)`,
  },

  // ── FINANCIAL ACCOUNTING ─────────────────────────────
  book_of_account: {
    keywords: ['book of account','book account','ledger master','create ledger','cash book','bank book'],
    response: `📄 **Book of Account (Ledger) Master:**\n\n1. Masters → Financial Accounting → Book Accounts\n2. "Add New Ledger" ક્લિક કરો\n3. Ledger Name, Code, Group, Contact Info, Status ભરો\n4. "Create Ledger" ક્લિક કરો\n\n**Edit:** List → Edit → Update Ledger → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Book of Account →](/masters/financial-accounting/book-accounts)`,
  },

  legder_account: {
    keywords: ['ledger account','ledger','ખાતું','create ledger account','add ledger account','delete ledger account'],
    response: `📒 **Ledger Account (ખાતું) Master:**\n\n1. Masters → Financial Accounting → Ledger Accounts\n2. "Add New Ledger" ક્લિક કરો\n3. Ledger Name, Code, Group, Budget Head, Sub Ledger, Status ભરો\n4. "Create Ledger" → Confirm\n\n**Edit:** List → Edit → Update Ledger → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Ledger Accounts →](/masters/financial-accounting/ledger-accounts)`,
  },

  sub_ledger_account: {
    keywords: ['sub ledger account','sub ledger','create sub ledger','add sub ledger','delete sub ledger'],
    response: `📄 **Sub Ledger Account Master:**\n\n1. Masters → Financial Accounting → Sub Ledger Master\n2. "Add New Sub Ledger" ક્લિક કરો\n3. Name, Code, SL Type, Contact Info, Statutory & Banking Details ભરો\n4. "Create Sub Ledger Account" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Sub Ledger →](/masters/financial-accounting/sub-ledger-accounts)`,
  },

  vendor_invoice: {
    keywords: ['vendor invoice','create vendor invoice','add vendor invoice','delete vendor billing'],
    response: `📄 **Vendor Invoice Tax:**\n\n1. Masters → Financial Accounting → Vendor Invoice\n2. "Add New Vendor Invoice" ક્લિક કરો\n3. Ledger Name, Tax Name, Tax Code, Percentage ભરો\n4. "Create Vendor Invoice" ક્લિક કરો\n\n**Edit:** List → Edit → Update Tax Type → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Vendor Invoice →](/masters/financial-accounting/vendor-invoice-taxes)`,
  },

  vendor_invoice_parameter_master: {
    keywords: ['vendor invoice parameter master','create vendor invoice parameter','delete vendor invoice parameter'],
    response: `📄 **Vendor Invoice Parameter Master:**\n\n1. Masters → Financial Accounting → Vendor Invoice Parameter Master\n2. "Add New Vendor Invoice Parameter" ક્લિક કરો\n3. Tender Work, Effective Date, Tax Type, Add/Deduct, Percentage, Ledger, Formula ભરો\n4. "Create Tax Parameter" ક્લિક કરો\n\n**Edit:** List → Edit → Update Tax Parameter → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Invoice Tax Parameter →](/masters/financial-accounting/invoice-tax-parameter)`,
  },

  challan_tax_parameters: {
    keywords: ['challan tax parameters','challan tax setup','tax configuration','create challan tax'],
    response: `📄 **Challan Tax Parameters:**\n\n1. Masters → Financial Accounting → Challan Tax Parameters\n2. "Add New Challan Tax Parameter" ક્લિક કરો\n3. Challan Date, Effective Date, Tax Type, Add/Deduct, Percentage, Ledger, Formula ભરો\n4. "Create Challan Tax Parameters" ક્લિક કરો\n\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Challan Tax Parameters →](/masters/financial-accounting/challan-tax-parameters)`,
  },

  // ── EMPLOYEE RECORDS ────────────────────────────────
  employee_master: {
    keywords: ['employee','employee master','add employee','create employee','new employee','staff','કર્મચારી','employee management'],
    response: `👤 **Employee (કર્મચારી) Master:**\n\n1. Masters → Employee Records → Employee Master\n2. "Add New Employee" ક્લિક કરો\n3. **Personal Details:** First Name, Last Name, Employee Code, DOB, PAN, Aadhar, Email, Phone, Gender, Address\n4. **Master Data:** Department, Category, Quota, Type, User, Languages\n5. **Bank Details:** Account No., Bank Name, Branch, Account Type\n6. **PF/GPF Details:** GPF Profile, GPF No., CPF No.\n7. Status: Active/Inactive\n8. "Create Employee" ક્લિક કરો → Confirm\n\n**Edit:** List → Edit → Update Employee → Confirm\n\n🔗 [Employee Master →](/masters/employee-records/employee-master)`,
  },

  employee_profile_add: {
    keywords: ['employee profile','add employee profile','create employee profile','update employee profile','delete employee profile'],
    response: `👤 **Employee Profile Update:**\n\n1. Masters → Employee Records → Employee Profile Update\n2. "Add New Employee Profile" ક્લિક કરો\n3. Employee, Joining Date, Type, Status, Department, Designation, Pay Bill, City Grade, Grade, Basic (Pay Matrix), Week Off Pattern, Post-Effective Date, CPF/NPS Option ભરો\n4. "Save Profile" ક્લિક કરો\n\n**Edit:** List → Edit → Update Profile → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Employee Profile →](/masters/employee-records/emp-profile-update)`,
  },

  designation_master: {
    keywords: ['designation','designation master','add designation','create designation','delete designation','હોદ્દો'],
    response: `🏷️ **Designation Master:**\n\n1. Masters → Administrative Masters → Designation Master\n2. "Add Designation" ક્લિક કરો\n3. Parent Designation, Departments, Description, English Name ભરો\n4. "Create Designation" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → OK\n\n🔗 [Designation Master →](/masters/administrative-masters/designation-master)`,
  },

  employee_type_master: {
    keywords: ['employee type','employee type master','add employee type','create employee type','delete employee type'],
    response: `👤 **Employee Type Master:**\n\n1. Masters → Administrative Masters → Employee Type Master\n2. "Add Employee Type" ક્લિક કરો\n3. Type Code, Type Name, Status ભરો\n4. "Create Type" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Employee Type →](/masters/administrative-masters/employee-type-master)`,
  },

  employee_category_master: {
    keywords: ['employee category','employee category master','add employee category','delete employee category'],
    response: `📂 **Employee Category Master:**\n\n1. Masters → Administrative Masters → Employee Category Master\n2. "Add Employee Category" ક્લિક કરો\n3. Category Code, Category Name, Status ભરો\n4. "Create Category" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"`,
  },

  employee_quota_master: {
    keywords: ['employee quota','employee quota master','create employee quota','delete employee quota'],
    response: `📄 **Employee Quota Master:**\n\n1. Masters → Administrative Masters → Employee Quota Master\n2. "Add New Employee Quota" ક્લિક કરો\n3. Quota Code, Quota Name, Percentage, Status ભરો\n4. "Create Quota" ક્લિક કરો → Confirm\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Employee Quota →](/masters/administrative-masters/employee-quota-master)`,
  },

  education_qualification_master: {
    keywords: ['education qualification','education qualification master','add education','create education','delete education'],
    response: `🎓 **Education Qualification Master:**\n\n1. Masters → Administrative Masters → Education Qualification Master\n2. "Add Education Qualification" ક્લિક કરો\n3. Code, Name, Is Mandatory, Is Technical, Is Professional, Is Promotional, Status ભરો\n4. "Create Qualification" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Education Qualification →](/masters/administrative-masters/education-qualification-master)`,
  },

  tax_slab_master: {
    keywords: ['tax slab','tax slab master','add tax slab','create tax slab','income tax slab','delete tax slab'],
    response: `📊 **Tax Slab Master:**\n\n1. Masters → Administrative Masters → Tax Slab\n2. "Add Tax Slab" ક્લિક કરો\n3. Financial Year, Tax Name, Tax Code, From Amount, To Amount, Tax Rate, Standard Deduction, Cess ભરો\n4. "Create Tax Slab" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Tax Slab →](/masters/administrative-masters/tax-slab)`,
  },

  house_type_master: {
    keywords: ['house type','house type master','add house type','create house type'],
    response: `📄 **House Type Master:**\n\n1. Masters → Administrative Masters → House Type Master\n2. "Add New House Type" ક્લિક કરો\n3. House Code, House Type Name, Flat Rate, Standard Rate, Economic Rate, Market Rate, Municipal Tax ભરો\n4. "Create House Type" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [House Type →](/masters/administrative-masters/house-type)`,
  },

  city_grade_master: {
    keywords: ['city grade','city grade master','add city grade','create city grade','delete city grade'],
    response: `🏙️ **City Grade Master:**\n\n1. Masters → Administrative Masters → City Grade\n2. "Add New City Grade" ક્લિક કરો\n3. City Name, Grade ભરો\n4. "Create City Grade" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [City Grade →](/masters/administrative-masters/city-grade)`,
  },

  city_hra_cla_master: {
    keywords: ['city hra','city hra cla','city hra master','hra rates','cla rates','house rent allowance'],
    response: `📄 **City HRA/CLA Master:**\n\n1. Masters → Administrative Masters → City HRA/CLA\n2. "Add New City HRA/CLA" ક્લિક કરો\n3. City Grade, Basic From/To, HRA1, CLA1, HRA Minimum, HRAUT24, HRAUT49, HRAAB49, HRA6TH, HRA7TH ભરો\n4. "Create Record" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [City HRA/CLA →](/masters/administrative-masters/city-hra-cla)`,
  },

  pay_bill_master: {
    keywords: ['pay bill','paybill master','pay bill master','add pay bill','create pay bill','salary bill'],
    response: `📄 **Payroll Bill Master:**\n\n1. Masters → Administrative Masters → Paybill Master\n2. "Add New Payroll Bill" ક્લિક કરો\n3. PayBill Code, Description, Ledger ભરો\n4. "Create Payroll Bill" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Pay Bill Master →](/masters/administrative-masters/paybill-master)`,
  },

  designation_post_book: {
    keywords: ['designation post book','des post book','create post book','permanent post','temporary post'],
    response: `📄 **Designation Post Book:**\n\n1. Masters → Administrative Masters → Des Post Book\n2. Designation, Date, Permanent Post, Temporary Post ભરો\n3. "Create Entry" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Des Post Book →](/masters/administrative-masters/des-post-book)`,
  },

  emp_group_insurance: {
    keywords: ['employee group insurance','group insurance','add insurance','create insurance','gis'],
    response: `📄 **Employee Group Insurance:**\n\n1. Masters → Employee Records → Emp Group Insurance\n2. "Add New Insurance" ક્લિક કરો\n3. Effective Date, Pay Commission, Group Code, Insurance Amount, Savings Amount ભરો\n4. "Create Insurance" ક્લિક કરો\n\n**Edit:** List → Edit → Update → Confirm\n**Delete:** List → Delete → "Yes, delete!"\n\n🔗 [Group Insurance →](/masters/employee-records/emp-group-insurance)`,
  },

}