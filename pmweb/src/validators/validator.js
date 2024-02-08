const REGEX = {
  AlphaNumUsDashSpace: "^[\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Pd} _-]+$", // AlphanumericWithUnderScoreDashSpace
  AlphaNumUsDashSpaceDotCurrency:
    "^[\\p{No}\\p{L}\\p{Sc}\\p{Nd}\\p{M}\\p{Z}_. -]+$", // AlphanumericWithUnderScoreDashDotSpaceCurrencySymbol
  AlphaNumDotColon: "^[\\p{L}\\p{Nd}\\p{M}\\p{Z}:.]+$", // AlphanumericWithDotColon
  AlphaNumUsBrackets: "^[\\p{L}\\p{Nd}\\p{M}\\p{Z}() -.*_]+$", // AlphaNumUnderscoreBrackets1
  AlphaNumBrackets: "^[\\p{Z}\\p{L}\\p{Nd}\\p{M} (\\)_.*-]+$", // AlphnaumericwithBrackets
  AllChars: "^[\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Sc}\\p{P}\\p{Sk}~+=|©°]*$", //	AllChars
  NumColon: "^[-+]?[\\p{Nd}:]+$", //	NumericWithColon
  NumPositive: "^[\\p{Nd}]*$", // NumericPositive
  Integer: "^[-+]?[\\p{Nd}]+$", // NumericPositiveNegative
  AlphaDotSpace: "^[\\p{L}\\p{M}\\p{Z}. ]*$", // AlphawithDotSpaceRegEx
  AlphaSpaceUs: "^[\\p{L}\\p{M}\\p{Z}\\p{Pd} _]*$", // AlphawithSpaceUnderscoreRegEx
  AlphaNospace: "^[\\p{L}\\p{M}]*$", // AlphaWithoutSpaceRegEx
  StartWithAlphaThenAlphaNumUsDash:
    "^[a-zA-Z][\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Pd}_-]*$", // StartWithAlphabetandAlphanumericWithUnderScoreDash
  //modified on 1/2/2024 for bug_id:143149
  //need to replicated in migration branch as well
  // StartWithAlphaThenAlphaNumAndOnlyUs:
  //   "^[a-zA-Z][\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Pd}_]*$", // StartWithAlphabetandAlphanumericWithUnderScoreDash,
  StartWithAlphaThenAlphaNumAndOnlyUs:
    "^[a-zA-Z][\\p{L}\\p{Nd}\\p{M}\\p{Z}_]*$", // StartWithAlphabetandAlphanumericWithUnderScoreDash,
  //till here for bug_id:143149
  AlphaNumUsSpace: "^[\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Pd} _]+$", // AlphanumericWithUnderScoreSpace
  // FloatPositive: "^[\\p{Nd}.][^\\p{L}]*$", // FloatPositive
  FloatPositive: "^[\\d]+(.)?[\\d]{0,2}$", // FloatPositive
  IntegerPositive: "^[\\p{Nd}][^\\p{L}]*$", // NumericPositive
  IntegerPositiveAndNegative: "^[\\-\\p{Nd}]*[^\\p{L}]*$", // Both positive and negative integer
  NumDot: "^[\\p{Nd}.]+$", //NumericWithDot
  // modified on 22/1/2024 for bug_id: 142783
  //bug: 142783 needs to be replicated in migration branch as well.
  // StartWithAlphaThenAlphaNumWithUsDashCommaFullStop:
  //   "^[a-zA-Z][\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Pd},._-]*$",
  //first charcter can be alphabet or numbers only and allows only _,.and space as special charcter.
  StartWithAlphaThenAlphaNumWithUsDashCommaFullStop:
    "^[a-zA-Z0-9][\\p{L}\\p{Nd}\\p{M}\\p{Z}\\p{Pd},._-]*$",
  // till here for bug_id: 142783
};

/* case-specific regex */
const PMWEB_REGEX = {
  AttachmentName: "^[a-zA-Z][^\\\\/:*?\"<>|'&`#]*$", // StartWithAlphabetExcept\/:*?"<>|'&`#
  SectionName: "^[a-zA-Z][^\\\\/:*?\"<>|'&()]*$", //StartWithAlphabetExcept\/:*?"<>|'&()
  SectionDesc: "^[^\\\\/:*?\"<>|'&()]*$", //Except\/:*?"<>|'&()  {/* changes on 03-10-2023 to resolve the bug Id 137953 */}
  Activity_Mile_Lane_Task_Name: "^[a-zA-Z][^&*|\\\\:\"'<>?/]*$", // StartWthAlphabetExcept&*|\:"'<>?/
  // modified on 12/09/2023 for BugId 136797
  // Prefix_Suffix_Display_Name: "^[a-zA-Z][^#&*+\\\\|:'\"<>?,. ]*$", // StartWthAlphabetExceptSPACE#&*+\|:'"<>?,.
  Prefix_Suffix_Display_Name: "^[a-zA-Z][^%#&*+\\\\|:'\"<>?,. ]*$", //added % in regex for bug_id:139714
  Trigger_Name: "^[a-zA-Z][^&*|\\\\:\"'<>?/]*$", // StartWthAlphabetExcept&*|\:"'<>?/
  Function_Name: "^[a-zA-Z$_][^~`!@#%^&*()\\-+={}|:\"\\\\;'<>?,//]*$", //StartWthAlphabetDollarUnderscoreExcept~`!@#%^&*()-+={}|:"\;'<>?,/
  Form_Name: "^[^~`!@#$%^&*()+={}|\\[\\]\\\\:\";'<>?,./]*$", // Except~`!@#$%^&*()+={}|[]\:";'<>?,./
  ActionName: "^[a-zA-Z][^\\\\//:*?\"<>|'&]*$", // StartWthAlphabetExcept\/:*?"<>|'&
  IpAddressIpV4:
    "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", //IPAddress
  DomainName: "^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.){1,2}[A-Za-z]{2,6}$", //DomainName
  // modified on 03/11/23 for BugId 140579
  // EmailId: "^[\\p{L}]([\\p{L}\\p{M}\\p{N}\\-_.]+)@([\\w]+).([\\w]{2,3})$",
  EmailId: "^[\\p{L}]([\\p{L}\\p{M}\\p{N}\\-_.]+)@([\\w]+)(.([\\w]{2,})){1,}$", //EmailID -> For both English as well as Arabic
  // till here BugId 140579
  LanguageLocale: "^[\\p{L}][\\p{L}_\\-]*[\\p{L}]+$", //Only alphebets along with hiphen and underscore are allowed and first character would be alphabet and after undercore some character should be there
};

const PMWEB_ARB_REGEX = {
  Activity_Mile_Lane_Task_Name: "[&*|\\\\:'\"<>?//]+", // Except&*|\:"'<>?/
  // modified on 12/09/2023 for BugId 136797
  Prefix_Suffix_Display_Name: "[#&*+\\\\|:'\"<>?,. ]+", // ExceptSPACE#&*+\|:'"<>?,.
  Trigger_Name: "[&*|\\\\:'\"<>?//]+", // Except&*|\:"'<>?/
  Function_Name: "[~`!@#%^&*()\\-+={}|:\"\\\\;'<>?,//]+", //Except~`!@#%^&*()-+={}|:"\;'<>?,/
  //code added for bug 136457
  New_Form_Name: "^(?:[0-9].*|[~`!@#$%^&*()-+={}[]\\|\\\\:\";'<>?,.//].*)$",
  //till here
  Form_Name: "[~`!@#$%^&*()\\-+={}\\[\\]|\\\\:\";'<>?,.//]+", // Except~`!@#$%^&*()+={}|[]\:";'<>?,./
  AttachmentName: "[*\\\\://?<>|&'#`\"]+$", //added on 12/9/2023 for bug_id: 136543
  canHaveUnderscoreAndDash: "[`~!@#$%^&*()\\-+=\\{\\}|\\\\\\]\\[:\"';?><,./]+$",
  ActionName: "[\\\\//:*?\"<>|'&]+", // Except\/:*?"<>|'&
  SectionName: "[\\\\//:*?\"<>|'&()]+", //excludes\/:*?"<>|'&() added on 25-09-2023 for bug_id: 136970
  SectionDesc: "[\\\\//:*?\"<>|'&()]+", //excludes\/:*?"<>|'&() added on 25-09-2023 for bug_id: 136970
};

const validateRegex = (value, type) => {
  const regex = new RegExp(type, "u");
  return regex.test(value);
};

export { REGEX, PMWEB_REGEX, PMWEB_ARB_REGEX, validateRegex };
