﻿export interface IUser {
  firstName: string;
  lastName: string;
  middleName?: string;
  isCritic?: boolean;
  role: Role;
  userId: number;
}

export enum Role {
  Student = "Student",
  Lecturer = "Lecturer",
  Curator = "Curator",
}
