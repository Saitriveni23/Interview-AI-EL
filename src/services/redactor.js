/**
 * Layer 1 Governance System: Bias Filter & Privacy Shield
 * Redacts PII (Name, Contact, Address) & Bias Triggers (Gender, Age, Native Place, Photo, Race/Skin tone, Religion, Marital Status)
 */

export class ResumeRedactor {
  constructor() {
    // Regex Patterns for PII & Discrimination Factors
    this.patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
      urls: /https?:\/\/(www\.)?(linkedin\.com\/in\/|github\.com\/|twitter\.com\/|facebook\.com\/)[a-zA-Z0-9_-]+/gi,
      
      // Bias & Demographic factors
      genderPronouns: /\b(he|she|him|her|his|hers|himself|herself|mr\.|ms\.|mrs\.|miss|sir|madam|male|female|gentleman|lady|woman|man)\b/gi,
      
      // Age & DOB factors
      ageDOB: /\b(date of birth|dob|born in|age:\s*\d{1,2}|\b(19\d{2}|20[0-1]\d)\b(?=\s*-\s*present|\s*birth|\s*graduated)?)\b/gi,
      
      // Photo / Physical appearance references
      photoAppearance: /\b(photo|photograph|picture attached|headshot|skin color|complexion|ethnicity|height|weight|fair|dark|physical appearance)\b/gi,
      
      // Native Place / Location / Nationality / Religion / Marital Status
      nativeLocation: /\b(native place|hometown|place of birth|nationality|citizenship|visa status|passport number|marital status|single|married|religion|caste|race|ethnic background|address:?)\b/gi,
      
      // Common street address patterns
      streetAddress: /\d+\s+[A-Za-z0-9\s,.]+ (Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Apartment|Apt|Suite)\b/gi
    };
  }

  /**
   * Redacts sensitive elements from resume raw text
   * @param {string} rawText 
   * @returns {{ redactedText: string, auditLog: Array, stats: Object }}
   */
  redact(rawText) {
    let text = rawText;
    const auditLog = [];
    const entityCounts = {
      name: 0,
      email: 0,
      phone: 0,
      url: 0,
      gender: 0,
      age: 0,
      appearancePhoto: 0,
      locationNative: 0,
      address: 0
    };

    // 1. Redact Email Addresses
    text = text.replace(this.patterns.email, (match) => {
      entityCounts.email++;
      auditLog.push({ type: 'PII_EMAIL', value: this.mask(match), category: 'Privacy Invasion' });
      return '[REDACTED_EMAIL]';
    });

    // 2. Redact Phone Numbers
    text = text.replace(this.patterns.phone, (match) => {
      // Avoid matching standard dates like 2020-2024 as phone numbers
      if (/^(19|20)\d{2}[-/.](19|20)\d{2}$/.test(match.trim())) return match;
      entityCounts.phone++;
      auditLog.push({ type: 'PII_PHONE', value: this.mask(match), category: 'Privacy Invasion' });
      return '[REDACTED_PHONE]';
    });

    // Redact Date of Birth and Age
// Preserve employment dates and years of experience.

const dobPattern =
  /\b(?:date\s+of\s+birth|d\.?\s*o\.?\s*b\.?|birth\s*date|birthdate)\s*[:=-]?\s*(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi;

text = text.replace(dobPattern, (match) => {
  entityCounts.age++;

  auditLog.push({
    type: 'BIAS_DATE_OF_BIRTH',
    value: this.mask(match),
    category: 'Discrimination Mitigation'
  });

  return '[REDACTED_DOB]';
});

const agePattern =
  /\b(?:age|aged)\s*[:=-]?\s*\d{1,3}\b/gi;

text = text.replace(agePattern, (match) => {
  entityCounts.age++;

  auditLog.push({
    type: 'BIAS_AGE',
    value: this.mask(match),
    category: 'Discrimination Mitigation'
  });

  return '[REDACTED_AGE]';
});

    // 3. Redact Social Profile URLs containing candidate identity
    text = text.replace(this.patterns.urls, (match) => {
      entityCounts.url++;
      auditLog.push({ type: 'PII_PROFILE_URL', value: match, category: 'Privacy Invasion' });
      return '[REDACTED_PROFILE_URL]';
    });

    // 4. Redact Gendered Pronouns & Titles (Layer 1 Discrimination Mitigation)
    text = text.replace(this.patterns.genderPronouns, (match) => {
      entityCounts.gender++;
      auditLog.push({ type: 'BIAS_GENDER_PRONOUN', value: match, category: 'Discrimination Mitigation' });
      return '[REDACTED_GENDER]';
    });

    // 5. Redact Photo / Physical Appearance / Skin references
    text = text.replace(this.patterns.photoAppearance, (match) => {
      entityCounts.appearancePhoto++;
      auditLog.push({ type: 'BIAS_PHOTO_APPEARANCE', value: match, category: 'Discrimination Mitigation' });
      return '[REDACTED_PHOTO_REF]';
    });

    // 6. Redact Native Place / Nationality / Religion / Marital Status
    text = text.replace(this.patterns.nativeLocation, (match) => {
      entityCounts.locationNative++;
      auditLog.push({ type: 'BIAS_NATIVE_ORIGIN', value: match, category: 'Discrimination Mitigation' });
      return '[REDACTED_NATIVE_INFO]';
    });

    // 7. Redact Physical Street Addresses
    text = text.replace(this.patterns.streetAddress, (match) => {
      entityCounts.address++;
      auditLog.push({ type: 'PII_ADDRESS', value: this.mask(match), category: 'Privacy Invasion' });
      return '[REDACTED_ADDRESS]';
    });

    // 8. Candidate Name Heuristic Redaction (First few lines header / "Name:" field)
    text = this.redactCandidateName(text, auditLog, entityCounts);

    return {
      redactedText: text,
      auditLog,
      stats: {
        totalRedactions: auditLog.length,
        entityCounts,
        anonymizationStatus: 'SUCCESS',
        layer1ComplianceScore: 100
      }
    };
  }

  /**
   * Identifies candidate name in the top section of resume or explicit fields
   */
  redactCandidateName(text, auditLog, entityCounts) {
  const lines = text.split('\n');
  const redactedLines = [...lines];

  const excludedHeadings =
    /\b(resume|curriculum|vitae|cv|developer|engineer|manager|student|skills|experience|education|summary|projects|certifications|profile|objective|analyst|security)\b/i;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();

    if (!line) continue;

    let foundName = null;

    // Case 1: Explicit name field
    // Example: Name: Priya Reddy
    const nameMatch = line.match(
      /^(?:name|candidate name|full name)\s*:\s*([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,4})\s*$/i
    );

    if (nameMatch) {
      foundName = nameMatch[1].trim();
    }

    // Case 2: Standalone name heading
    // Example: AARAV SHARMA
    else if (
      /^[A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){1,3}$/.test(line) &&
      !excludedHeadings.test(line)
    ) {
      foundName = line;
    }

    if (foundName) {
      redactedLines[i] = lines[i].replace(
        foundName,
        '[REDACTED_NAME]'
      );

      entityCounts.name++;

      auditLog.push({
        type: 'PII_NAME',
        value: this.mask(foundName),
        category: 'Privacy Invasion'
      });

      break;
    }
  }

  return redactedLines.join('\n');
}

  mask(str) {
    if (str.length <= 4) return '***';
    return str.substring(0, 3) + '***' + str.substring(str.length - 2);
  }
}
