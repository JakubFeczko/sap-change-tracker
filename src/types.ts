export type SapObjectType =
  | "CDS"
  | "Class"
  | "Data Element"
  | "Domain"
  | "Program"
  | "UI5 File";

export type VerificationStatus =
  | "verified"
  | "changed"
  | "needs-check"
  | "blocked";

export type SapObject = {
  id: string;
  name: string;
  type: SapObjectType;
  packageName: string;
  path: string;
  status: VerificationStatus;
  owner: string;
  lastChanged: string;
  comment: string;
  dependencies: string[];
};

export type ViewMode = "structure" | "graph";
