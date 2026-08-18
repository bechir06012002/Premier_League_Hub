/**
 * UI translations. Deliberately dependency-free: the app has a fixed, known set
 * of strings and two languages, so a typed dictionary buys us compile-time
 * safety that a runtime i18n library can't - `de` is annotated as `Dictionary`,
 * so a missing or misspelled German key fails `tsc`, not the page.
 *
 * IMPORTANT: nothing here changes what gets written to the database. Values
 * like `expertise_level` and the entries of `profiles.interests` are read by the
 * backend's LLM prompts and must stay English - only their *labels* live here.
 * That's why `interests` below is keyed by the canonical English string.
 */

export const LANGUAGES = ["en", "de"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = { en: "EN", de: "DE" };

/** Full names, in their own language - used for the toggle's tooltip. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: "English", de: "Deutsch" };

const en = {
  common: {
    loading: "Loading...",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
  },

  nav: {
    welcome: "Welcome",
    addPicture: "Add a profile picture",
    changePicture: "Change profile picture",
    pictureError: "Couldn't update your picture.",
    logout: "Log out",
    switchLanguage: "Switch language",
  },

  footer: {
    tagline: "Never miss a move",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    contact: "Contact Us",
    backToTop: "Back to top",
  },

  hero: {
    headline: "Never Miss",
    accent: "What's Happening",
    signupHeadline: "Your League,",
    signupAccent: "Daily",
  },

  auth: {
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },

  login: {
    title: "Log in",
    submit: "Log in",
    submitting: "Logging in...",
    noAccount: "Don't have an account?",
    signupLink: "Sign up",
  },

  signup: {
    title: "Sign up",
    confirmPassword: "Confirm password",
    gender: "Gender",
    select: "Select",
    dateOfBirth: "Date of birth",
    day: "Day",
    month: "Month",
    year: "Year",
    submit: "Sign up",
    submitting: "Signing up...",
    haveAccount: "Already have an account?",
    loginLink: "Log in",
    checkEmailTitle: "Check your email",
    checkEmailBody: "We sent you a confirmation link. Click it, then come back and log in.",
    backToLogin: "Back to login",
  },

  validation: {
    invalidEmail: "Enter a valid email address",
    passwordRequired: "Password is required",
    passwordMin: (n: number) => `Password must be at least ${n} characters`,
    confirmRequired: "Please confirm your password",
    selectOption: "Select an option",
    required: "Required",
    passwordsMismatch: "Passwords don't match",
    dateInvalid: "That date doesn't exist",
    minAge: (n: number) => `You must be at least ${n} to sign up`,
  },

  gender: {
    male: "Male",
    female: "Female",
    non_binary: "Non-binary",
    undisclosed: "Prefer not to say",
  },

  months: {
    "1": "January",
    "2": "February",
    "3": "March",
    "4": "April",
    "5": "May",
    "6": "June",
    "7": "July",
    "8": "August",
    "9": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  },

  onboarding: {
    step1Title: "Pick your team(s)",
    step1Desc: "Choose one or more Premier League clubs you follow.",
    step2Title: "Tell us about yourself",
    step2Desc: "This helps us pick the right stories for your daily digest.",
    step3Title: "Add a profile picture?",
    step3Desc: "Totally optional - you can skip this and add one later from Edit profile.",
    finish: "Finish",
    saving: "Saving...",
    skip: "Skip for now",
  },

  questionnaire: {
    nameLabel: "Your name",
    namePlaceholder: "Alex",
    expertiseLabel: "How much do you know about football?",
    interestsLabel: "What do you want more of?",
    digestSizeLabel: "How many stories per digest?",
    storiesOption: (n: number) => `${n} stories`,
  },

  /** Keyed by the canonical English value stored in `profiles.interests`. */
  interests: {
    "Transfer news & rumours": "Transfer news & rumours",
    "Match reports & results": "Match reports & results",
    "Tactical analysis": "Tactical analysis",
    "Fantasy football": "Fantasy football",
  } as Record<string, string>,

  /** Keyed by the canonical English value stored in `profiles.expertise_level`. */
  expertise: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    nerd: "Nerd",
  } as Record<string, string>,

  avatar: {
    label: "Profile picture",
    upload: "Upload",
    change: "Change",
    processing: "Processing...",
    remove: "Remove",
    hint: "Square crop, scaled to 256px. JPG or PNG.",
    error: "Couldn't use that image.",
  },

  dashboard: {
    editProfile: "Edit profile",
    editTitle: "Edit your profile",
    editDesc: (email: string) => `Signed in as ${email} - your digest is sent here.`,
    favoriteTeams: "Favorite teams",
    saveChanges: "Save changes",
    saving: "Saving...",
    expertise: "Expertise",
    interests: "Interests",
    notSet: "Not set yet",
  },

  lineup: {
    bench: "Bench",
    addTeam: "Add a favorite team",
  },

  digest: {
    nextDigest: "Next digest",
    hoursUnit: "h",
    minutesUnit: "m",
    mainEvents: "Main events",
    saved: "Saved",
    edition: (shown: number, total: number) => `${shown} of ${total} this edition`,
    readSummary: "Read summary",
    hideSummary: "Hide summary",
    watchVideo: "Watch video",
    readArticle: "Read full article",
    save: "Save this article",
    unsave: "Remove from saved",
    nothingSaved: "Nothing saved yet - tap the star on any story to keep it here for good.",
    noStories: "No stories from the last 48 hours yet - your next edition lands after the coming run.",
    moreNews: "More news",
    moreNewsCount: (n: number) => `More news (${n})`,
    showLess: "Show less",
  },

  time: {
    justNow: "just now",
    minutesAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
  },
};

export type Dictionary = typeof en;

// The annotation is the point: `tsc` rejects this object if a key is missing,
// misspelled, or has the wrong signature.
const de: Dictionary = {
  common: {
    loading: "Wird geladen...",
    cancel: "Abbrechen",
    back: "Zurück",
    next: "Weiter",
  },

  nav: {
    welcome: "Willkommen",
    addPicture: "Profilbild hinzufügen",
    changePicture: "Profilbild ändern",
    pictureError: "Dein Bild konnte nicht aktualisiert werden.",
    logout: "Abmelden",
    switchLanguage: "Sprache wechseln",
  },

  footer: {
    tagline: "Verpasse keinen Transfer",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutz",
    contact: "Kontakt",
    backToTop: "Nach oben",
  },

  hero: {
    headline: "Verpasse nie,",
    accent: "was gerade passiert",
    signupHeadline: "Deine Liga,",
    signupAccent: "täglich",
  },

  auth: {
    email: "E-Mail",
    password: "Passwort",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
  },

  login: {
    title: "Anmelden",
    submit: "Anmelden",
    submitting: "Wird angemeldet...",
    noAccount: "Noch kein Konto?",
    signupLink: "Registrieren",
  },

  signup: {
    title: "Registrieren",
    confirmPassword: "Passwort bestätigen",
    gender: "Geschlecht",
    select: "Bitte wählen",
    dateOfBirth: "Geburtsdatum",
    day: "Tag",
    month: "Monat",
    year: "Jahr",
    submit: "Registrieren",
    submitting: "Wird registriert...",
    haveAccount: "Du hast bereits ein Konto?",
    loginLink: "Anmelden",
    checkEmailTitle: "Prüfe deine E-Mails",
    checkEmailBody: "Wir haben dir einen Bestätigungslink geschickt. Klicke darauf und melde dich anschließend an.",
    backToLogin: "Zurück zur Anmeldung",
  },

  validation: {
    invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein",
    passwordRequired: "Passwort erforderlich",
    passwordMin: (n: number) => `Das Passwort muss mindestens ${n} Zeichen lang sein`,
    confirmRequired: "Bitte bestätige dein Passwort",
    selectOption: "Bitte wähle eine Option",
    required: "Pflichtfeld",
    passwordsMismatch: "Die Passwörter stimmen nicht überein",
    dateInvalid: "Dieses Datum gibt es nicht",
    minAge: (n: number) => `Du musst mindestens ${n} Jahre alt sein, um dich zu registrieren`,
  },

  gender: {
    male: "Männlich",
    female: "Weiblich",
    non_binary: "Non-binär",
    undisclosed: "Keine Angabe",
  },

  months: {
    "1": "Januar",
    "2": "Februar",
    "3": "März",
    "4": "April",
    "5": "Mai",
    "6": "Juni",
    "7": "Juli",
    "8": "August",
    "9": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Dezember",
  },

  onboarding: {
    step1Title: "Wähle deine Vereine",
    step1Desc: "Wähle einen oder mehrere Premier-League-Klubs aus, denen du folgst.",
    step2Title: "Erzähl uns etwas über dich",
    step2Desc: "So finden wir die passenden Nachrichten für deinen täglichen Digest.",
    step3Title: "Profilbild hinzufügen?",
    step3Desc: "Völlig optional - du kannst das überspringen und es später unter Profil bearbeiten nachholen.",
    finish: "Fertig",
    saving: "Wird gespeichert...",
    skip: "Später",
  },

  questionnaire: {
    nameLabel: "Dein Name",
    namePlaceholder: "Alex",
    expertiseLabel: "Wie gut kennst du dich mit Fußball aus?",
    interestsLabel: "Wovon möchtest du mehr lesen?",
    digestSizeLabel: "Wie viele Artikel pro Digest?",
    storiesOption: (n: number) => `${n} Artikel`,
  },

  interests: {
    "Transfer news & rumours": "Transfers & Gerüchte",
    "Match reports & results": "Spielberichte & Ergebnisse",
    "Tactical analysis": "Taktikanalysen",
    "Fantasy football": "Fantasy Football",
  },

  expertise: {
    beginner: "Anfänger",
    intermediate: "Fortgeschritten",
    advanced: "Erfahren",
    nerd: "Nerd",
  },

  avatar: {
    label: "Profilbild",
    upload: "Hochladen",
    change: "Ändern",
    processing: "Wird verarbeitet...",
    remove: "Entfernen",
    hint: "Quadratischer Ausschnitt, auf 256px skaliert. JPG oder PNG.",
    error: "Dieses Bild konnte nicht verwendet werden.",
  },

  dashboard: {
    editProfile: "Profil bearbeiten",
    editTitle: "Profil bearbeiten",
    editDesc: (email: string) => `Angemeldet als ${email} - dorthin wird dein Digest geschickt.`,
    favoriteTeams: "Lieblingsvereine",
    saveChanges: "Änderungen speichern",
    saving: "Wird gespeichert...",
    expertise: "Wissenslevel",
    interests: "Interessen",
    notSet: "Noch nicht festgelegt",
  },

  lineup: {
    bench: "Bank",
    addTeam: "Lieblingsverein hinzufügen",
  },

  digest: {
    nextDigest: "Nächster Digest",
    hoursUnit: "Std.",
    minutesUnit: "Min.",
    mainEvents: "Top-Themen",
    saved: "Gespeichert",
    edition: (shown: number, total: number) => `${shown} von ${total} in dieser Ausgabe`,
    readSummary: "Zusammenfassung lesen",
    hideSummary: "Zusammenfassung ausblenden",
    watchVideo: "Video ansehen",
    readArticle: "Ganzen Artikel lesen",
    save: "Artikel speichern",
    unsave: "Aus Gespeicherten entfernen",
    nothingSaved: "Noch nichts gespeichert - tippe bei einem Artikel auf den Stern, um ihn dauerhaft zu behalten.",
    noStories: "Noch keine Artikel aus den letzten 48 Stunden - deine nächste Ausgabe kommt nach dem nächsten Lauf.",
    moreNews: "Mehr News",
    moreNewsCount: (n: number) => `Mehr News (${n})`,
    showLess: "Weniger anzeigen",
  },

  time: {
    justNow: "gerade eben",
    minutesAgo: (n: number) => `vor ${n} Min.`,
    hoursAgo: (n: number) => `vor ${n} Std.`,
    daysAgo: (n: number) => (n === 1 ? "vor 1 Tag" : `vor ${n} Tagen`),
  },
};

export const TRANSLATIONS: Record<Language, Dictionary> = { en, de };

export const LANGUAGE_STORAGE_KEY = "plhub.language";

function isLanguage(value: string | null): value is Language {
  return value !== null && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Stored choice wins; otherwise fall back to the browser's language, so a
 * German visitor lands on German without touching the toggle.
 */
export function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isLanguage(stored)) return stored;

  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
}
