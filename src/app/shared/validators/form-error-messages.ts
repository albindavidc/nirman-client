import { AbstractControl } from '@angular/forms';

/**
 * Centralized form error message mapping.
 * Returns user-friendly error messages for common validation errors.
 *
 * Usage in templates:
 *   {{ getErrorMessage(form.get('fieldName')!) }}
 *
 * Usage in components:
 *   import { FormErrorMessages } from '...shared/validators/form-error-messages';
 *   getErrorMessage = FormErrorMessages.getErrorMessage;
 */
export class FormErrorMessages {
  private static readonly errorMessages: Record<
    string,
    string | ((params: Record<string, unknown>) => string)
  > = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: (params) =>
      `Must be at least ${(params as { requiredLength: number }).requiredLength} characters`,
    maxlength: (params) =>
      `Cannot exceed ${(params as { requiredLength: number }).requiredLength} characters`,
    min: (params) =>
      `Value must be at least ${(params as { min: number }).min}`,
    max: (params) => `Value cannot exceed ${(params as { max: number }).max}`,
    pattern: 'Invalid format',
    whitespace: 'Cannot contain only whitespace',
    passwordStrength:
      'Password must contain: 8+ characters, uppercase, lowercase, number, special character',
    passwordMismatch: 'Passwords do not match',
    phoneNumber: 'Please enter a valid 10-digit phone number',
    nameFormat: 'Only letters, spaces, hyphens, and apostrophes are allowed',
    urlFormat: 'Please enter a valid URL',
    zipCode: 'Please enter a valid postal code',
    experienceYears: 'Please enter a valid number of years',
    dateRange: 'End date must be on or after start date',
    pastDate: 'Date must be today or in the future',
    positiveNumber: 'Value must be greater than zero',
  };

  /**
   * Returns the first applicable error message for a form control.
   * @param control - The AbstractControl to get the error message for
   * @param fieldName - Optional field name for more descriptive messages
   */
  static getErrorMessage(
    control: AbstractControl | null,
    fieldName?: string,
  ): string {
    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;
    const firstErrorKey = Object.keys(errors)[0];

    if (!firstErrorKey) {
      return '';
    }

    const messageEntry = this.errorMessages[firstErrorKey];

    if (typeof messageEntry === 'function') {
      return messageEntry(errors[firstErrorKey]);
    }

    if (typeof messageEntry === 'string') {
      return fieldName
        ? messageEntry.replace('This field', fieldName)
        : messageEntry;
    }

    // Fallback for unknown error keys
    return `Invalid value`;
  }
}
