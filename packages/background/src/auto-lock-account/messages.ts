import { ProofError, Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";

export class GetAutoLockAccountDurationMsg extends Message<number> {
  public static type() {
    return "proof-get-auto-lock-account-duration";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetAutoLockAccountDurationMsg.type();
  }
}

export class UpdateAutoLockAccountDurationMsg extends Message<void> {
  public static type() {
    return "proof-update-auto-lock-account-duration";
  }

  constructor(public readonly duration: number) {
    super();
  }

  validateBasic(): void {
    if (this.duration < 0) {
      throw new ProofError(
        "auto-lock-account",
        101,
        "duration cannot be set to a negative number."
      );
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateAutoLockAccountDurationMsg.type();
  }
}

export class StartAutoLockMonitoringMsg extends Message<void> {
  public static type() {
    return "proof-start-auto-lock-monitoring";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return StartAutoLockMonitoringMsg.type();
  }
}
