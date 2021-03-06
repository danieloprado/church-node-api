import { IChurchUser } from './churchUser';
import { IUserSocial } from './userSocial';

export interface IUser {
  id?: number;
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  avatar?: string;
  gender?: string;
  birthday?: Date;
  zipcode?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  number?: string;
  complement?: string;

  createdDate?: Date;
  updatedDate?: Date;

  socials?: IUserSocial[];
  churches?: IChurchUser[];
  married?: IUser;
}