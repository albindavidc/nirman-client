export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  apiVersion: 'v1',
  get apiUrl(): string {
    return `${this.apiBaseUrl}/api/${this.apiVersion}`;
  },
};
