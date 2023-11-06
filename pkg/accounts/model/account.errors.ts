export class AccountNickNameLengthError extends Error {
  override readonly name = 'AccountNickNameLengthError' as const;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class AccountBioLengthError extends Error {
  override readonly name = 'AccountBioLengthError' as const;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class AccountDateInvalidError extends Error {
  override readonly name = 'AccountDateInvalidError' as const;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
