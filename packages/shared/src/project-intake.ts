export type ProjectIntakeCategory =
  | "general" | "professional_services" | "ecommerce" | "healthcare" | "education"
  | "nonprofit" | "hospitality_food" | "real_estate" | "construction_home_services"
  | "beauty_wellness" | "events" | "media_creative" | "government" | "transport_logistics"
  | "personal_brand" | "cleaning" | "photography" | "interior_finishing";
export type IntakeFieldType = "text" | "textarea" | "select" | "multi" | "url";
export interface IntakeField { id: string; label: string; type: IntakeFieldType; required?: boolean; help?: string; options?: string[]; }
export interface IntakeSection { id: string; title: string; eyebrow: string; description: string; fields: IntakeField[]; }

export const PROJECT_INTAKE_CATEGORIES = [
  { id: "general", label: "Digital product or website", description: "Platforms, portals, commerce, mobile apps, and custom software." },
  { id: "professional_services", label: "Professional services", description: "Consulting, legal, accounting, finance, agencies, and B2B expertise." },
  { id: "ecommerce", label: "Retail and e-commerce", description: "Product catalogues, online stores, marketplaces, payments, and fulfilment." },
  { id: "healthcare", label: "Healthcare and medical", description: "Clinics, practices, hospitals, patient information, and appointment flows." },
  { id: "education", label: "Education and training", description: "Schools, universities, courses, tutors, and learning platforms." },
  { id: "nonprofit", label: "Nonprofit, community or faith", description: "Donations, programmes, volunteers, advocacy, impact, and membership." },
  { id: "hospitality_food", label: "Food, hospitality and travel", description: "Restaurants, hotels, tourism, menus, reservations, and experiences." },
  { id: "real_estate", label: "Real estate and property", description: "Listings, developments, rentals, agents, enquiries, and viewings." },
  { id: "construction_home_services", label: "Construction and home services", description: "Contractors, repairs, landscaping, maintenance, and field services." },
  { id: "beauty_wellness", label: "Beauty, fitness and wellness", description: "Salons, spas, coaches, studios, memberships, and appointments." },
  { id: "events", label: "Events and experiences", description: "Weddings, conferences, festivals, ticketing, schedules, and vendors." },
  { id: "media_creative", label: "Media and creative studio", description: "Design, production, music, publishing, portfolios, and commissions." },
  { id: "government", label: "Government and public service", description: "Public information, digital services, accessibility, policy, and accountability." },
  { id: "transport_logistics", label: "Transport and logistics", description: "Fleet, delivery, bookings, tracking, service areas, and operations." },
  { id: "personal_brand", label: "Personal brand or portfolio", description: "Executives, creators, speakers, résumés, writing, and audience growth." },
  { id: "cleaning", label: "Cleaning services website", description: "Lead generation, quotes, bookings, service areas, packages, and CMS." },
  { id: "photography", label: "Photography website", description: "Portfolio storytelling, packages, enquiries, image rights, and bookings." },
  { id: "interior_finishing", label: "Interior finishing website", description: "Luxury positioning, project galleries, consultation, and quotations." },
] as const;

const shared: IntakeSection[] = [
  { id: "business", eyebrow: "01 / Foundation", title: "Business and project", description: "Give us the context behind the work and the people making decisions.", fields: [
    { id: "legal_business_name", label: "Legal business name", type: "text" }, { id: "brand_name", label: "Trading or brand name", type: "text", required: true },
    { id: "brand_intro", label: "Describe the business in 2–3 sentences", type: "textarea", required: true }, { id: "location", label: "Primary location and areas served", type: "textarea" },
    { id: "decision_makers", label: "Who approves design, content, budget, and launch?", type: "textarea" }, { id: "existing_website", label: "Existing website, if any", type: "url" },
  ]},
  { id: "goals", eyebrow: "02 / Direction", title: "Goals and audience", description: "Define what the website must change for the business and its customers.", fields: [
    { id: "main_goal", label: "What is the main reason for this project?", type: "textarea", required: true }, { id: "target_audience", label: "Describe the ideal customers or users", type: "textarea", required: true },
    { id: "customer_pain_points", label: "What problems or frustrations do they have?", type: "textarea" }, { id: "primary_action", label: "What should visitors do first?", type: "text", required: true },
    { id: "success_measure", label: "How will you measure success after launch?", type: "textarea", help: "Use targets where possible: qualified enquiries, bookings, sales, sign-ups, or time saved." },
  ]},
  { id: "brand", eyebrow: "04 / Expression", title: "Brand and content direction", description: "Describe the visual world, voice, proof, and source material.", fields: [
    { id: "brand_assets", label: "Which assets already exist?", type: "multi", options: ["Logo", "Brand guide", "Photography", "Video", "Testimonials", "Brochures", "Price list", "Certificates"] },
    { id: "visual_direction", label: "Preferred visual style and mood", type: "textarea" }, { id: "colours_fonts", label: "Brand colours, fonts, and anything to avoid", type: "textarea" },
    { id: "reference_sites", label: "Reference websites and what you like about them", type: "textarea" }, { id: "competitors", label: "Competitors and what you want to do better", type: "textarea" },
    { id: "tone_of_voice", label: "Tone of voice", type: "select", options: ["Professional", "Warm and reassuring", "Premium and restrained", "Bold and energetic", "Editorial", "Open to recommendation"] },
  ]},
  { id: "operations", eyebrow: "05 / Operations", title: "Admin, integrations, and workflow", description: "Plan what happens behind the public website.", fields: [
    { id: "admin_users", label: "Who will manage the website and what should each person control?", type: "textarea" },
    { id: "cms_needs", label: "What must be editable without a developer?", type: "multi", options: ["Pages", "Services", "Pricing", "Portfolio", "Leads/bookings", "Testimonials", "Blog", "FAQs", "Team", "SEO", "Users", "Analytics"] },
    { id: "integrations", label: "Required integrations", type: "multi", options: ["Email", "WhatsApp", "SMS", "Online payments", "Mobile money", "Maps", "Calendar", "CRM", "Analytics", "Meta/TikTok pixel", "Newsletter", "Live chat"] },
    { id: "notification_recipients", label: "Who should receive new enquiry or submission alerts?", type: "textarea" }, { id: "data_exports", label: "Reporting and export needs", type: "textarea" },
  ]},
  { id: "delivery", eyebrow: "06 / Delivery", title: "Technical, legal, and launch", description: "Surface constraints early so the proposal is realistic.", fields: [
    { id: "domain_hosting", label: "Domain, hosting, and business email already available", type: "textarea" }, { id: "analytics_seo", label: "SEO keywords and analytics requirements", type: "textarea" },
    { id: "legal_requirements", label: "Privacy, terms, consent, copyright, or industry requirements", type: "textarea" }, { id: "deadline", label: "Target launch date and why it matters", type: "text", required: true },
    { id: "budget", label: "Working budget or investment range", type: "select", required: true, options: ["Under $5,000", "$5,000–$10,000", "$10,000–$25,000", "$25,000–$50,000", "$50,000+", "Need scope guidance"] },
    { id: "maintenance", label: "Support and maintenance needed after launch", type: "textarea" }, { id: "anything_else", label: "Anything else we should understand?", type: "textarea" },
  ]},
];

const categorySection: Record<ProjectIntakeCategory, IntakeSection> = {
  general: { id: "scope", eyebrow: "03 / Product", title: "Product scope", description: "Turn the opportunity into a buildable first release.", fields: [
    { id: "product_type", label: "What are we building?", type: "multi", options: ["Marketing website", "Web application", "Client portal", "Admin platform", "E-commerce", "Mobile app", "API/integration", "AI-enabled product"] },
    { id: "core_features", label: "List the essential capabilities for the first release", type: "textarea", required: true }, { id: "user_roles", label: "User types and what each should be able to do", type: "textarea" },
    { id: "existing_systems", label: "Existing systems, data, designs, or specification", type: "textarea" }, { id: "security_compliance", label: "Security, payments, sensitive data, or compliance constraints", type: "textarea" },
  ]},
  professional_services: { id: "scope", eyebrow: "03 / Client journey", title: "Expertise, trust, and lead qualification", description: "Shape how buyers understand your expertise and become qualified conversations.", fields: [
    { id: "service_lines", label: "Services, engagements, or practice areas to present", type: "textarea", required: true }, { id: "buyer_roles", label: "Who buys, influences, and approves the engagement?", type: "textarea" },
    { id: "proof_credentials", label: "Case studies, credentials, outcomes, memberships, or regulated claims", type: "textarea" }, { id: "qualification_questions", label: "What must a prospect tell you before a useful first conversation?", type: "textarea" },
    { id: "conversion_path", label: "Preferred conversion path", type: "multi", options: ["Book consultation", "Request proposal", "Call", "Email", "Download guide", "Complete diagnostic", "Join mailing list"] }, { id: "confidentiality", label: "Confidentiality, conflict checks, disclaimers, or restricted client work", type: "textarea" },
  ]},
  ecommerce: { id: "scope", eyebrow: "03 / Commerce", title: "Catalogue, checkout, and fulfilment", description: "Map what customers buy and what the business must operate after checkout.", fields: [
    { id: "catalogue", label: "Products, variants, categories, inventory size, and merchandising rules", type: "textarea", required: true }, { id: "sales_model", label: "Sales model", type: "multi", options: ["Direct retail", "Wholesale", "Marketplace", "Subscriptions", "Digital goods", "Pre-orders", "Made to order"] },
    { id: "checkout_payments", label: "Currencies, payment providers, taxes, discounts, and checkout rules", type: "textarea" }, { id: "shipping_fulfilment", label: "Delivery areas, shipping rates, pickup, fulfilment, and returns", type: "textarea" },
    { id: "commerce_integrations", label: "Inventory, accounting, CRM, courier, POS, or ERP integrations", type: "textarea" }, { id: "customer_accounts", label: "Accounts, order tracking, wishlists, loyalty, and customer service needs", type: "textarea" },
  ]},
  healthcare: { id: "scope", eyebrow: "03 / Care journey", title: "Services, appointments, and patient trust", description: "Clarify the care journey without making unsupported medical or privacy claims.", fields: [
    { id: "care_services", label: "Services, specialties, clinicians, and locations", type: "textarea", required: true }, { id: "appointment_flow", label: "Appointment, referral, triage, cancellation, and reminder workflow", type: "textarea" },
    { id: "patient_audiences", label: "Patient groups, accessibility, language, and caregiver needs", type: "textarea" }, { id: "health_data", label: "Will the website handle health information, forms, results, or patient accounts?", type: "textarea" },
    { id: "clinical_governance", label: "Licensing, consent, privacy, emergency notices, and content approval", type: "textarea" }, { id: "health_integrations", label: "Practice management, telehealth, payments, maps, or insurance integrations", type: "textarea" },
  ]},
  education: { id: "scope", eyebrow: "03 / Learning model", title: "Programmes, admissions, and learning", description: "Map how learners discover, enrol, pay, and participate.", fields: [
    { id: "programmes", label: "Programmes, courses, levels, subjects, and delivery formats", type: "textarea", required: true }, { id: "learner_groups", label: "Learners, parents, sponsors, faculty, and other audiences", type: "textarea" },
    { id: "admissions", label: "Enquiry, application, admission, enrolment, and payment workflow", type: "textarea" }, { id: "learning_features", label: "Learning features", type: "multi", options: ["Course catalogue", "Applications", "Student portal", "LMS", "Live classes", "Assessments", "Certificates", "Resource library", "Events"] },
    { id: "academic_content", label: "Faculty, calendars, policies, outcomes, accreditation, and news content", type: "textarea" }, { id: "education_integrations", label: "LMS, SIS, payments, email, video, or identity integrations", type: "textarea" },
  ]},
  nonprofit: { id: "scope", eyebrow: "03 / Mission", title: "Programmes, impact, and participation", description: "Connect the mission to actions supporters can take and evidence they can trust.", fields: [
    { id: "mission_programmes", label: "Mission, programmes, beneficiaries, and regions", type: "textarea", required: true }, { id: "supporter_actions", label: "Supporter actions", type: "multi", options: ["Donate", "Volunteer", "Join", "Attend", "Advocate", "Apply for support", "Partner", "Subscribe"] },
    { id: "impact_reporting", label: "Impact measures, reports, stories, funding disclosures, and governance", type: "textarea" }, { id: "donations", label: "Donation methods, currencies, campaigns, receipts, and recurring gifts", type: "textarea" },
    { id: "programme_applications", label: "Applications, eligibility, safeguarding, or referral workflows", type: "textarea" }, { id: "community_management", label: "Members, chapters, volunteers, events, and communications", type: "textarea" },
  ]},
  hospitality_food: { id: "scope", eyebrow: "03 / Guest journey", title: "Offer, reservations, and guest experience", description: "Turn browsing into visits, bookings, orders, or stays.", fields: [
    { id: "venues_offers", label: "Venues, rooms, menus, tours, packages, or experiences", type: "textarea", required: true }, { id: "guest_actions", label: "Primary guest actions", type: "multi", options: ["Reserve a table", "Order food", "Book a room", "Book an experience", "Call", "Get directions", "Buy gift card", "Plan an event"] },
    { id: "availability_rules", label: "Availability, capacity, opening hours, seasonality, and cancellation rules", type: "textarea" }, { id: "booking_order_system", label: "Current reservation, ordering, channel-manager, or POS system", type: "textarea" },
    { id: "menus_inventory", label: "Menus, rates, packages, dietary details, stock, and pricing updates", type: "textarea" }, { id: "guest_content", label: "Photography, amenities, location guides, reviews, and multilingual content", type: "textarea" },
  ]},
  real_estate: { id: "scope", eyebrow: "03 / Property journey", title: "Listings, enquiries, and viewings", description: "Define the inventory and journey from discovery to qualified enquiry.", fields: [
    { id: "property_model", label: "Property types, sale/rent/development model, locations, and inventory volume", type: "textarea", required: true }, { id: "listing_fields", label: "Listing details, media, maps, plans, amenities, and availability", type: "textarea" },
    { id: "property_search", label: "Search, filters, saved searches, alerts, and comparison needs", type: "textarea" }, { id: "viewing_workflow", label: "Enquiry, viewing, qualification, application, or reservation workflow", type: "textarea" },
    { id: "listing_source", label: "Who manages listings and is there a CRM, MLS, property system, or feed?", type: "textarea" }, { id: "property_roles", label: "Agents, developers, landlords, tenants, buyers, and administrator roles", type: "textarea" },
  ]},
  construction_home_services: { id: "scope", eyebrow: "03 / Service operation", title: "Services, estimates, and field delivery", description: "Map service areas, qualification, quoting, and work scheduling.", fields: [
    { id: "trade_services", label: "Trades, services, project sizes, and exclusions", type: "textarea", required: true }, { id: "service_territory", label: "Service areas, travel rules, emergency work, and operating hours", type: "textarea" },
    { id: "estimate_inputs", label: "What is needed to prepare an estimate or site visit?", type: "textarea" }, { id: "job_workflow", label: "Journey from enquiry to inspection, quote, scheduling, completion, and warranty", type: "textarea" },
    { id: "credentials_warranty", label: "Licences, insurance, safety, guarantees, certifications, and proof", type: "textarea" }, { id: "field_systems", label: "Scheduling, field-service, invoicing, inventory, or CRM integrations", type: "textarea" },
  ]},
  beauty_wellness: { id: "scope", eyebrow: "03 / Appointment model", title: "Treatments, schedules, and retention", description: "Design the path from service discovery to repeat bookings.", fields: [
    { id: "wellness_services", label: "Services, treatments, classes, practitioners, and locations", type: "textarea", required: true }, { id: "booking_policies", label: "Availability, duration, deposits, cancellation, waitlist, and reminders", type: "textarea" },
    { id: "memberships_packages", label: "Packages, memberships, gift cards, products, and recurring plans", type: "textarea" }, { id: "practitioner_profiles", label: "Practitioner credentials, bios, schedules, and selection rules", type: "textarea" },
    { id: "wellness_safety", label: "Consultations, consent, contraindications, waivers, or age restrictions", type: "textarea" }, { id: "booking_platform", label: "Current booking, POS, payment, or client-management system", type: "textarea" },
  ]},
  events: { id: "scope", eyebrow: "03 / Experience", title: "Programme, registration, and attendance", description: "Map the experience before, during, and after the event.", fields: [
    { id: "event_format", label: "Event type, dates, locations, audience size, and online/hybrid format", type: "textarea", required: true }, { id: "programme", label: "Programme, sessions, speakers, performers, venues, and schedules", type: "textarea" },
    { id: "registration_ticketing", label: "Registration, ticket tiers, payments, invitations, check-in, and refunds", type: "textarea" }, { id: "event_roles", label: "Attendees, speakers, sponsors, exhibitors, vendors, press, and staff needs", type: "textarea" },
    { id: "event_engagement", label: "Announcements, networking, streaming, audience participation, and post-event content", type: "textarea" }, { id: "event_integrations", label: "Ticketing, CRM, email, streaming, calendar, badge, or venue integrations", type: "textarea" },
  ]},
  media_creative: { id: "scope", eyebrow: "03 / Work and audience", title: "Portfolio, publishing, and commissions", description: "Present the work clearly and define how audiences engage or commission it.", fields: [
    { id: "creative_disciplines", label: "Disciplines, services, formats, and bodies of work", type: "textarea", required: true }, { id: "work_structure", label: "How should projects, credits, collections, episodes, or releases be organised?", type: "textarea" },
    { id: "media_formats", label: "Media formats", type: "multi", options: ["Images", "Video", "Audio", "Writing", "Interactive work", "Downloads", "Livestreams"] }, { id: "rights_credits", label: "Copyright, licensing, credits, client privacy, and download controls", type: "textarea" },
    { id: "commission_flow", label: "Commission, booking, submission, pitch, or collaboration workflow", type: "textarea" }, { id: "publishing_channels", label: "Social, newsletter, podcast, video, distribution, or archive integrations", type: "textarea" },
  ]},
  government: { id: "scope", eyebrow: "03 / Public service", title: "Services, information, and accountability", description: "Define public tasks, statutory content, and inclusive access requirements.", fields: [
    { id: "public_services", label: "Public services, information, programmes, and responsible departments", type: "textarea", required: true }, { id: "public_users", label: "Residents, businesses, staff, visitors, and assisted-digital user groups", type: "textarea" },
    { id: "service_transactions", label: "Applications, payments, permits, reports, consultations, or status tracking", type: "textarea" }, { id: "accessibility_languages", label: "Accessibility standard, languages, low-bandwidth, device, and offline needs", type: "textarea" },
    { id: "public_records", label: "Policies, notices, publications, datasets, meetings, and records management", type: "textarea" }, { id: "government_security", label: "Identity, data classification, hosting, audit, procurement, and compliance constraints", type: "textarea" },
  ]},
  transport_logistics: { id: "scope", eyebrow: "03 / Operations", title: "Routes, bookings, and tracking", description: "Map the customer journey and the operational systems behind it.", fields: [
    { id: "transport_services", label: "Passenger, freight, delivery, fleet, route, or mobility services", type: "textarea", required: true }, { id: "coverage_capacity", label: "Coverage, routes, zones, schedules, capacity, and service levels", type: "textarea" },
    { id: "booking_quote", label: "Quote, booking, dispatch, payment, cancellation, and proof-of-delivery workflow", type: "textarea" }, { id: "tracking", label: "Live tracking, notifications, status updates, and customer support", type: "textarea" },
    { id: "operations_users", label: "Customers, drivers, dispatchers, fleet managers, partners, and administrators", type: "textarea" }, { id: "logistics_integrations", label: "Maps, telematics, fleet, warehouse, courier, ERP, payment, or messaging integrations", type: "textarea" },
  ]},
  personal_brand: { id: "scope", eyebrow: "03 / Reputation", title: "Positioning, work, and audience", description: "Build a credible home for your expertise, output, and next opportunity.", fields: [
    { id: "personal_positioning", label: "What should you be known for, and by whom?", type: "textarea", required: true }, { id: "personal_goals", label: "Primary outcomes", type: "multi", options: ["Get hired", "Win clients", "Book speaking", "Grow an audience", "Sell products", "Publish ideas", "Show portfolio", "Build press profile"] },
    { id: "personal_content", label: "Biography, résumé, case studies, talks, writing, press, testimonials, and media available", type: "textarea" }, { id: "audience_channels", label: "Existing audience, social channels, newsletter, podcast, or community", type: "textarea" },
    { id: "contact_boundaries", label: "Public contact, availability, representation, privacy, and enquiry qualification", type: "textarea" }, { id: "publishing_rhythm", label: "What will you publish and who will keep it current?", type: "textarea" },
  ]},
  cleaning: { id: "scope", eyebrow: "03 / Service model", title: "Services, pricing, and booking", description: "Adapted from the cleaning website discovery and application specification.", fields: [
    { id: "cleaning_services", label: "Services offered", type: "multi", required: true, options: ["Residential", "Commercial/office", "Deep cleaning", "Recurring cleaning", "Move in/out", "Post-construction", "Carpet/upholstery", "Window/glass", "Floor care", "Disinfection", "Laundry", "Fumigation", "Event cleaning", "Airbnb turnover", "Janitorial staffing"] },
    { id: "service_details", label: "For each priority service, what is included and excluded?", type: "textarea" }, { id: "service_areas_hours", label: "Service areas, operating hours, emergency/weekend availability", type: "textarea" },
    { id: "pricing_model", label: "Pricing approach", type: "multi", options: ["Fixed public prices", "Price ranges", "Quote only", "Recurring packages", "Corporate contracts", "Discounts", "Online payment", "Mobile money/bank transfer"] },
    { id: "quote_inputs", label: "What information is needed to calculate a quote?", type: "textarea" }, { id: "booking_workflow", label: "Describe the journey from request to completed cleaning", type: "textarea" },
    { id: "booking_rules", label: "Availability rules, minimum notice, cancellation, and deposits", type: "textarea" }, { id: "trust_proof", label: "Training, insurance, guarantees, equipment, eco-products, and other proof", type: "textarea" },
  ]},
  photography: { id: "scope", eyebrow: "03 / Portfolio model", title: "Portfolio, packages, and booking", description: "Adapted from the photography website information request.", fields: [
    { id: "photography_categories", label: "Photography categories", type: "multi", required: true, options: ["Weddings", "Portraits", "Events", "Product", "Fashion", "Real estate", "Corporate", "Lifestyle", "Studio"] },
    { id: "portfolio_structure", label: "How should portfolio work be organised and viewed?", type: "textarea" }, { id: "portfolio_metadata", label: "What should each project show—story, date, location, credits, captions?", type: "textarea" },
    { id: "image_controls", label: "Image and usage controls", type: "multi", options: ["Watermarks", "Disable downloads", "Captions", "Client consent", "Private client names", "Editorial/masonry layout"] },
    { id: "services_packages", label: "Services, packages, deliverables, pricing, and deposits", type: "textarea" }, { id: "booking_requirements", label: "Enquiry fields, availability, consultation, and booking workflow", type: "textarea" },
    { id: "social_channels", label: "Instagram, TikTok, YouTube, and other social links", type: "textarea" },
  ]},
  interior_finishing: { id: "scope", eyebrow: "03 / Project model", title: "Services, portfolio, and consultation", description: "Adapted from the luxury interior finishing information request.", fields: [
    { id: "finishing_services", label: "Services offered", type: "multi", required: true, options: ["TV walls", "Wainscoting", "Wall panels", "POP ceilings", "Gypsum ceilings", "Painting", "Lighting", "Interior design", "Renovations", "Full-room finishing"] },
    { id: "service_descriptions", label: "Describe each priority service and what makes the finish distinctive", type: "textarea" }, { id: "consultation_model", label: "Free inspection, paid consultation, quotation, and project workflow", type: "textarea" },
    { id: "portfolio_categories", label: "Portfolio categories and existing projects", type: "textarea" }, { id: "project_details", label: "For each project, what can we show—location, materials, duration, client, before/after, video?", type: "textarea" },
    { id: "portfolio_privacy", label: "Client privacy and image permissions", type: "textarea" }, { id: "enquiry_requirements", label: "Enquiry fields, budget bands, site-photo upload, and response routing", type: "textarea" },
  ]},
};

export function getProjectIntakeSections(category: ProjectIntakeCategory): IntakeSection[] {
  return [shared[0]!, shared[1]!, categorySection[category], ...shared.slice(2)];
}

export interface ProjectIntakeRecord {
  id: string; ownerId?: string; category: ProjectIntakeCategory; title: string; contactName: string; contactEmail: string; company?: string;
  answers: Record<string, unknown>; currentSection: number; status: "draft" | "submitted"; submittedAt?: string; createdAt: string; updatedAt: string; resumeToken?: string;
}
