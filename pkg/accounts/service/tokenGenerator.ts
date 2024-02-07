import { Option } from '@mikuroxina/mini-fn';
import * as jose from 'jose';

import type { UNIXTimeFromEpoch } from '../../time/mod.js';

export class TokenGenerator {
  private readonly privateKey: CryptoKey;
  private readonly publicKey: CryptoKey;

  static async new() {
    // generate ECDSA P-256 Private/Public Key (For JWT alg: "ES256")
    // cf. https://datatracker.ietf.org/doc/html/rfc7518#section-3.1
    const { privateKey, publicKey } = (await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    )) as CryptoKeyPair;
    return new TokenGenerator(privateKey, publicKey);
  }

  private constructor(privateKey: CryptoKey, publicKey: CryptoKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  public async generate(
    subject: string,
    issuedAt: UNIXTimeFromEpoch,
    expiredAt: UNIXTimeFromEpoch,
  ): Promise<Option.Option<string>> {
    const token = await new jose.SignJWT()
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt(issuedAt)
      .setSubject(subject)
      .setExpirationTime(expiredAt)
      .sign(this.privateKey);

    return Option.some(token);
  }

  public async verify(token: string): Promise<boolean> {
    try {
      await jose.jwtVerify(token, this.publicKey);
      return true;
    } catch {
      return false;
    }
  }
}
