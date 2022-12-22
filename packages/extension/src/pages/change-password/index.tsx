import React, { FunctionComponent, useRef, useState } from "react";

import { PasswordInput } from "../../components/form";

import { Button, Form } from "reactstrap";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Banner } from "../../components/banner";
import useForm from "react-hook-form";

import { EmptyLayout } from "../../layouts/empty-layout";

import style from "./style.module.scss";

import { FormattedMessage, useIntl } from "react-intl";
import { useInteractionInfo } from "@proof-wallet/hooks";
import { useHistory } from "react-router";
import delay from "delay";
import { StartAutoLockMonitoringMsg } from "@proof-wallet/background";
import { InExtensionMessageRequester } from "@proof-wallet/router-extension";
import { BACKGROUND_PORT } from "@proof-wallet/router";

interface FormData {
  password: string;
}

export const ChangePassword: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();

  const passwordRef = useRef<HTMLInputElement | null>();

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const { keyRingStore, uiConfigStore } = useStore();
  const [loading, setLoading] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    keyRingStore.rejectAll();
  });

  return (
    <EmptyLayout className={style.layout}>
      <div className={style.header}>
        <img
          className={style.headerLogo}
          src={require("../../public/assets/img/logo-title.svg")}
        />
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password);

            const msg = new StartAutoLockMonitoringMsg();
            const requester = new InExtensionMessageRequester();
            // Make sure to notify that auto lock service to start check locking after duration.
            await requester.sendMessage(BACKGROUND_PORT, msg);

            if (interactionInfo.interaction) {
              if (!interactionInfo.interactionInternal) {
                // XXX: If the connection doesn't have the permission,
                //      permission service tries to grant the permission right after unlocking.
                //      Thus, due to the yet uncertain reason, it requests new interaction for granting permission
                //      before the `window.close()`. And, it could make the permission page closed right after page changes.
                //      Unfortunately, I still don't know the exact cause.
                //      Anyway, for now, to reduce this problem, jsut wait small time, and close the window only if the page is not changed.
                await delay(100);
                if (window.location.href.includes("#/unlock")) {
                  window.close();
                }
              } else {
                history.replace("/");
              }
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "lock.input.password.error.invalid",
              })
            );
            setLoading(false);
          }
        })}
      >
        <div style={{ marginTop: "77px", marginBottom: "20px" }}>
          <Banner
            icon={
              uiConfigStore.isBeta
                ? require("../../public/assets/256.png")
                : require("../../public/assets/logo-round.svg")
            }
            logo={require("../../public/assets/brand-text.png")}
            title="Welcome Back"
            subtitle="Unlock your wallet to continue"
          />
        </div>
        <PasswordInput
          // label={intl.formatMessage({
          //   id: "lock.input.password",
          // })}
          className={style.password}
          name="password"
          placeholder="Enter your password"
          error={errors.password && errors.password.message}
          ref={(ref) => {
            passwordRef.current = ref;

            register({
              required: intl.formatMessage({
                id: "lock.input.password.error.required",
              }),
            })(ref);
          }}
        />
        <Button
          type="submit"
          // color="primary"
          className={style.unlockBtn}
          block
          data-loading={loading}
        >
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});