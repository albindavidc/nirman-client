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
      const hasMinLength = value.length >= 8;

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        hasMinLength;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            hasMinLength,
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
    confirmPasswordField: string
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
   * Accepts formats: 1234567890, with or without country code
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Let required validator handle empty values
      }

      // Remove non-digit characters for validation
      const digitsOnly = value.replace(/\D/g, '');
      const isValid = /^\d{10}$/.test(digitsOnly);

      return isValid ? null : { phoneNumber: { value: control.value } };
    };
  }

  /**
   * Validates name fields (letters, spaces, hyphens, apostrophes only).
   * @param minLength - Minimum length for the name (default: 2)
   */
  static nameValidator(minLength: number = 2): ValidatorFn {
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
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
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
      const isValid = /^[\dA-Za-z\s\-]{4,10}$/.test(value);

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
}
