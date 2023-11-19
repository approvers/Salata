import {
  InMemoryAccountRepository,
  InMemoryAccountVerifyTokenRepository,
} from '../adaptor/repository/dummy.ts';
import { Clock, SnowflakeIDGenerator } from '../../id/mod.ts';
import { ScryptPasswordEncoder } from '../../password/mod.ts';
import { RegisterAccountService } from './registerService.ts';
import { DummySendNotificationService } from './sendNotificationService.ts';
import { TokenVerifyService } from './tokenVerifyService.ts';
import { EtagVerifyService } from './etagGenerateVeriftService.ts';
import { EditAccountService } from './editAccountService.ts';

import { AccountRole } from '../model/account.ts';
import { Result } from 'mini-fn';
import { assertEquals } from 'std/assert';

const repository = new InMemoryAccountRepository();
const verifyRepository = new InMemoryAccountVerifyTokenRepository();
class DummyClock implements Clock {
  Now(): bigint {
    return BigInt(new Date('2023/9/10 00:00:00 UTC').getTime());
  }
}
const registerService: RegisterAccountService = new RegisterAccountService({
  repository,
  idGenerator: new SnowflakeIDGenerator(1, new DummyClock()),
  passwordEncoder: new ScryptPasswordEncoder(),
  sendNotification: new DummySendNotificationService(),
  verifyTokenService: new TokenVerifyService(verifyRepository),
});
const etagVerifyService = new EtagVerifyService();
const editAccountService = new EditAccountService(
  repository,
  etagVerifyService,
  new ScryptPasswordEncoder(),
);

const exampleInput = {
  name: 'john_doe@example.com',
  mail: 'johndoe@example.com',
  nickname: 'John Doe',
  passphrase: 'password',
  bio: 'Hello, World!',
  role: 'normal' as AccountRole,
};

Deno.test('should be success to update nickname', async () => {
  const res = await registerService.handle(
    exampleInput.name,
    exampleInput.mail,
    exampleInput.nickname,
    exampleInput.passphrase,
    exampleInput.bio,
    exampleInput.role,
  );
  const account = Result.unwrap(res);
  const etag = await etagVerifyService.generate(account);
  const updateRes = await editAccountService.editNickname(
    etag,
    exampleInput.name,
    'new nickname',
  );
  assertEquals(Result.isErr(updateRes), false);
  assertEquals(updateRes[1], true);
  assertEquals(account.getNickname, 'new nickname');
  repository.reset();
});

Deno.test('should be fail to update nickname when etag not match', async () => {
  await registerService.handle(
    exampleInput.name,
    exampleInput.mail,
    exampleInput.nickname,
    exampleInput.passphrase,
    exampleInput.bio,
    exampleInput.role,
  );

  const res = await editAccountService.editNickname(
    'invalid_etag',
    exampleInput.name,
    'new nickname',
  );
  assertEquals(Result.isErr(res), true);
  repository.reset();
});

Deno.test('should be fail to update nickname when account not found', async () => {
  const res = await editAccountService.editNickname(
    'invalid etag',
    'foo',
    'new nickname',
  );
  assertEquals(Result.isErr(res), true);
  repository.reset();
});

Deno.test('should be success to update passphrase', async () => {
  const res = await registerService.handle(
    exampleInput.name,
    exampleInput.mail,
    exampleInput.nickname,
    exampleInput.passphrase,
    exampleInput.bio,
    exampleInput.role,
  );
  const account = Result.unwrap(res);
  const etag = await etagVerifyService.generate(account);

  const updateRes = await editAccountService.editPassphrase(
    etag,
    exampleInput.name,
    'new password',
  );
  assertEquals(Result.isErr(updateRes), false);
  assertEquals(updateRes[1], true);
  repository.reset();
});

Deno.test('should be fail to update passphrase when etag not match', async () => {
  await registerService.handle(
    exampleInput.name,
    exampleInput.mail,
    exampleInput.nickname,
    exampleInput.passphrase,
    exampleInput.bio,
    exampleInput.role,
  );

  const res = await editAccountService.editPassphrase(
    'invalid_etag',
    exampleInput.name,
    'new password',
  );
  assertEquals(Result.isErr(res), true);
  repository.reset();
});

Deno.test('should be fail to update passphrase when account not found', async () => {
  const res = await editAccountService.editPassphrase(
    'invalid etag',
    'foo',
    'new password',
  );
  assertEquals(Result.isErr(res), true);
  repository.reset();
});

Deno.test('should be success to update email', async () => {
  const res = await registerService.handle(
    exampleInput.name,
    exampleInput.mail,
    exampleInput.nickname,
    exampleInput.passphrase,
    exampleInput.bio,
    exampleInput.role,
  );
  const account = Result.unwrap(res);
  const etag = await etagVerifyService.generate(account);

  const updateRes = await editAccountService.editEmail(
    etag,
    exampleInput.name,
    'pulsate@example.com',
  );
  assertEquals(Result.isErr(updateRes), false);
  assertEquals(updateRes[1], true);
  repository.reset();
});

Deno.test('should be fail to update email when etag not match', async () => {
  const res = await registerService.handle(
    exampleInput.name,
    exampleInput.mail,
    exampleInput.nickname,
    exampleInput.passphrase,
    exampleInput.bio,
    exampleInput.role,
  );
  Result.unwrap(res);

  const updateRes = await editAccountService.editEmail(
    'invalid_etag',
    exampleInput.name,
    'pulsate@example.com',
  );
  assertEquals(Result.isErr(updateRes), true);
});

Deno.test('should be fail to update email when account not found', async () => {
  const updateRes = await editAccountService.editEmail(
    'invalid etag',
    'foo',
    'pulsate@pulsate.mail',
  );
  assertEquals(Result.isErr(updateRes), true);
});
