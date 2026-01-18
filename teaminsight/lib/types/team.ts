/**
 * Shared Team Types
 * -----------------
 * Centralized type definitions for team-related data.
 * Used across API routes and frontend components.
 */

export type TeamStatus = "green" | "yellow" | "red";

export type TeamMember = {
  memberId: string;
  displayName: string;
};

export type Team = {
  teamId: string;
  projectName: string;
  accessCode?: string;
  contactEmail?: string;
  members: TeamMember[];
  status: TeamStatus;
  createdAt?: Date;
  updatedAt?: Date;
  // Extended fields from reflection
  reflectionScore?: number;
  teamHealthScore?: number;
  tuckmanStage?: string;
  riskLevel?: number;
  anomalyFlags?: string[];
  reflectionUpdatedAt?: Date;
};

export type TeamSummary = Pick<Team, "teamId" | "projectName" | "status">;

export type TeamWithMembers = Team & {
  members: TeamMember[];
};
