import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';

import { IChurchUser } from '../interfaces/churchUser';
import { IRefreshToken } from '../interfaces/refreshToken';
import { IResetPasswordToken } from '../interfaces/resetPasswordToken';
import { IUser } from '../interfaces/user';
import { IUserToken } from '../interfaces/userToken';
import { auth } from '../settings';

export enum enTokenType {
  userToken = 0,
  resetPassword = 1,
  refreshToken = 2
}

export async function userToken(user: IUser, churchUser: IChurchUser, forApp: boolean = false): Promise<string> {
  const tokenData: IUserToken = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: churchUser.roles ? churchUser.roles : [],
    church: {
      id: churchUser.church.id,
      name: churchUser.church.name,
      slug: churchUser.church.slug
    }
  };

  return await sign(tokenData, enTokenType.userToken, forApp ? auth.appTimeout : auth.timeout);
}

export async function refreshToken(userId: number, deviceId: string, application: string, uuid: string): Promise<string> {
  const tokenData: IRefreshToken = { userId, deviceId, application, uuid };
  return await sign(tokenData, enTokenType.refreshToken);
}

export async function renewUserToken(userToken: IUserToken): Promise<string> {
  userToken = _.cloneDeep(userToken);
  return await sign(userToken, enTokenType.userToken, auth.timeout);
}

export async function resetPassword(user: IUser): Promise<string> {
  const tokenData: IResetPasswordToken = {
    id: user.id,
    firstName: user.firstName,
    email: user.email
  };

  return await sign(tokenData, enTokenType.resetPassword, auth.resetPasswordTimeout);
}

export async function verify<T>(token: string, type: enTokenType): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    jwt.verify(token, auth.secret, (err: any, decoded: any) => {
      if (err || !decoded || decoded.type !== type) {
        return reject(resolveVerifyError(err));
      }

      resolve(decoded);
    });
  });
}

async function sign(tokenData: any, type: enTokenType, expiration: number = null): Promise<string> {
  return new Promise<string>((resolve) => {
    (<any>tokenData).type = type;

    if (expiration) {
      (<any>tokenData).exp = expirationDate(expiration);
    }

    resolve(jwt.sign(tokenData, auth.secret));
  });
}

function expirationDate(minutes: number): number {
  return Math.floor(Date.now() / 1000) + (minutes * 60);
}

function resolveVerifyError(err: Error): Error {
  if (!err) {
    return new Error('token-type-not-match');
  }

  switch (err.name) {
    case 'TokenExpiredError':
      return new Error('token-expired');
    default:
      return new Error('token-invalid');
  }

}