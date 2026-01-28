export interface DataSource {
  id: number;
  name: string;
  url: string;
  status: "NEW" | "Active" | "Disabled" | "Error";
  message: string;
  apiKey: string;
  engineApiKey: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
