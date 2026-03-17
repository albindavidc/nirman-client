import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for form validation across the application.
 * Following Angular best practices for reusable validation logic.
 */
export class CustomValidators {
  /**
   * Validates password strength.
   * Requirements: min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
   */
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Let required validator handle empty values
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /\d/.test(value);
      const hasSpecialChar = /[@$!%*?&]/.test(value);
      const minLength = value.length >= 8;
      const maxLength = value.length <= 128;

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        minLength &&
        maxLength;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            minLength,
            maxLength,
          },
        };
      }

      return null;
    };
  }

  /**
   * Cross-field validator for password matching.
   * Use as a form group validator.
   * @param passwordField - Name of the password form control
   * @param confirmPasswordField - Name of the confirm password form control
   */
  static passwordMatch(
    passwordField: string,
    confirmPasswordField: string,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      // Clear the error if passwords match
      if (confirmPassword.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  /**
   * Validates phone number format (10 digits).
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      // Remove non-digit characters for validation
      const digitsOnly = value.replace(/\D/g, '');
      const isValid = /^\d{10}$/.test(digitsOnly);

      return isValid ? null : { phoneNumber: { value: control.value } };
    };
  }

  /**
   * Validates name fields (letters, spaces, hyphens, apostrophes only).
   */
  static nameValidator(minLength = 2): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      if (value.length < minLength) {
        return {
          minlength: { requiredLength: minLength, actualLength: value.length },
        };
      }

      // Allow letters (including Unicode), spaces, hyphens, and apostrophes
      const isValid = /^[\p{L}\s\-']+$/u.test(value);
      return isValid ? null : { nameFormat: { value: control.value } };
    };
  }

  /**
   * Validates URL format for website fields.
   */
  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      // Simple URL pattern validation
      const urlPattern =
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      const isValid = urlPattern.test(value);

      return isValid ? null : { urlFormat: { value: control.value } };
    };
  }

  /**
   * Validates zip/postal code format.
   * Supports common formats: 5-digit, 6-digit, alphanumeric
   */
  static zipCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      // Supports: 12345, 123456, 12345-6789, A1B 2C3 (Canadian), etc.
      const isValid = /^[\dA-Za-z\s-]{4,10}$/.test(value);

      return isValid ? null : { zipCode: { value: control.value } };
    };
  }

  /**
   * Validates experience years (non-negative integer).
   */
  static experienceYears(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
        return { experienceYears: { value: control.value } };
      }

      return null;
    };
  }

  /**
   * Cross-field validator ensuring end date is on or after start date.
   * Use as a form group validator.
   * @param startDateField - Name of the start date form control
   * @param endDateField - Name of the end date form control
   */
  static dateRange(startDateField: string, endDateField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get(startDateField)?.value;
      const endDate = control.get(endDateField)?.value;

      if (!startDate || !endDate) {
        return null; // Only validate when both dates are provided
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        control.get(endDateField)?.setErrors({
          dateRange: true,
          ...control.get(endDateField)?.errors,
        });
        return { dateRange: { startDate, endDate } };
      }

      // Clear dateRange error if it was previously set
      if (control.get(endDateField)?.hasError('dateRange')) {
        const errors = { ...control.get(endDateField)?.errors };
        delete errors['dateRange'];
        control
          .get(endDateField)
          ?.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  /**
   * Validates that a string is not just whitespace.
   * Rejects empty strings that consist only of spaces, tabs, or newlines.
   */
  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Let required validator handle empty values
      }

      const isWhitespace =
        typeof value === 'string' && value.trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }

  /**
   * Validates that a date is today or in the future.
   */
  static futureOrTodayDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return inputDate >= today ? null : { pastDate: { value: control.value } };
    };
  }

  /**
   * Validates that a numeric value is strictly positive (> 0).
   */
  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) {
        return { positiveNumber: { value: control.value } };
      }

      return null;
    };
  }
}
