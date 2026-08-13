window.STARCI_REVIEW = {
  "title": "case-auth · direction-b · revision 1.1",
  "phase": "preview",
  "deliveryMode": "batch",
  "mode": "mixed",
  "workItems": [
    {
      "id": "page-sign-in",
      "scope": "page",
      "target": "apps/app/src/components/pages/SignInPage/ + blocks/auth/SignInPanel/ — REOPENED in revision 1.1: the card and the footer prompt"
    },
    {
      "id": "block-otp-step",
      "scope": "block",
      "target": "apps/app/src/components/blocks/auth/OtpStep/"
    },
    {
      "id": "page-sign-up",
      "scope": "page",
      "target": "apps/app/src/components/pages/SignUpPage/ + app/[locale]/(auth)/sign-up/"
    },
    {
      "id": "page-forgot-password",
      "scope": "page",
      "target": "apps/app/src/components/pages/ForgotPasswordPage/ + app/[locale]/(auth)/forgot-password/"
    }
  ],
  "evidence": [
    {
      "source": "nivo-backend e2e",
      "claim": "25 assertions across sign-up, sign-in and reset, including every refusal drawn here."
    },
    {
      "source": "starci-academy-fe @ 8410a74 AuthenticationPanel source",
      "claim": "the code step is ONE Field with kind:\"code\", not a row of digit boxes; the card comes from SurfaceFormCard at the page."
    },
    {
      "source": "packages/ui/src/leaves/Input",
      "claim": "kind:\"code\" sets autocomplete=one-time-code and inputmode=numeric."
    }
  ],
  "cases": [
    {
      "id": "case-auth",
      "title": "direction-b — giữ SignInPanel, thêm hai hành trình còn thiếu",
      "thesis": "Three routes in one grammar. Revision 1.0 left the shipped sign-in alone; revision 1.1 reopened it because the request named the legacy render, and the shipped screen had neither the card nor the question-and-answer footer the reference draws.",
      "distinction": "Three routes rather than one card that switches modes. GitHub is gone from every panel; one provider, one shortcut.",
      "states": [
        {
          "id": "sign-in",
          "label": "Đăng nhập — mặc định",
          "covers": [
            "page-sign-in:entry"
          ],
          "note": "Revision 1.1. The card, one shortcut, and the way to sign up as a question and its answer - the reference's shape, which the shipped screen did not have.",
          "candidateUrl": "candidate/out/sign-in.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-in.json",
          "stateId": "sign-in",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-in",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "f7403f10f20df0ee02be8624fd7c98bc63b49b39a07258c241079643be057eff"
          }
        },
        {
          "id": "sign-in-closed",
          "label": "Đăng nhập — form đóng",
          "covers": [
            "page-sign-in:entry, credentials closed"
          ],
          "note": "The form behind one press, which is what the shipped page opens with. The fields stay mounted so a password manager can find them.",
          "candidateUrl": "candidate/out/sign-in-closed.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-in-closed.json",
          "stateId": "sign-in-closed",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-in-closed",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "76d8b345a22abc04a1eed71ca9283069e1a5792b4de998e822ea231ce52ce859"
          }
        },
        {
          "id": "sign-in-refused",
          "label": "Đăng nhập — sai thông tin",
          "covers": [
            "page-sign-in:refused"
          ],
          "note": "The sentence never says whether the address exists.",
          "candidateUrl": "candidate/out/sign-in-refused.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-in-refused.json",
          "stateId": "sign-in-refused",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-in-refused",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "6fc9f37d9f9c713bc9ff36c18ec942b34cd35be3e9a2a709d64bb314c732af1f"
          }
        },
        {
          "id": "sign-in-2fa",
          "label": "Đăng nhập — vướng 2FA",
          "covers": [
            "page-sign-in:twoFactorUnsupported"
          ],
          "note": "A challenge rather than a session: not a refusal and not a sign-in.",
          "candidateUrl": "candidate/out/sign-in-2fa.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-in-2fa.json",
          "stateId": "sign-in-2fa",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-in-2fa",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "b2bb79ba784c2d4d3ac4b33bcf2736014f5b458579b53b68f83df28b0bd62d47"
          }
        },
        {
          "id": "sign-up",
          "label": "Đăng ký — nhập thông tin",
          "covers": [
            "page-sign-up:details"
          ],
          "note": "The form as a reader first meets it.",
          "candidateUrl": "candidate/out/sign-up.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up.json",
          "stateId": "sign-up",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "eaa3bfeed74a9ea4427bed1040d03559f6c39a7a10c4c8b2e0dbbdbc7c734b1b"
          }
        },
        {
          "id": "sign-up-refused",
          "label": "Đăng ký — bị từ chối",
          "covers": [
            "page-sign-up:details refused"
          ],
          "note": "`@MinLength(8)` turned the password away before any code was sent.",
          "candidateUrl": "candidate/out/sign-up-refused.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up-refused.json",
          "stateId": "sign-up-refused",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up-refused",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "da50ec3572c735273ee381182733806e27ef4e1b15dbc03d953c3771f2dc699f"
          }
        },
        {
          "id": "sign-up-code",
          "label": "Đăng ký — nhập mã",
          "covers": [
            "page-sign-up:code",
            "block-otp-step:waiting"
          ],
          "note": "The code step, waiting. The hint states the lifetime rather than a refusal.",
          "candidateUrl": "candidate/out/sign-up-code.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up-code.json",
          "stateId": "sign-up-code",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up-code",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "130a3b0100e2718282e4b856f46e8bcc2b8aebfbda1a5f9398929c4148528526"
          }
        },
        {
          "id": "sign-up-code-refused",
          "label": "Đăng ký — mã sai",
          "covers": [
            "block-otp-step:code refused"
          ],
          "note": "The challenge survives, so the reader retypes rather than starting over.",
          "candidateUrl": "candidate/out/sign-up-code-refused.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up-code-refused.json",
          "stateId": "sign-up-code-refused",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up-code-refused",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "7809b921c54037167381a22d201ce281c132cf19dcb9b94ef276497c2c6be365"
          }
        },
        {
          "id": "sign-up-code-cooldown",
          "label": "Đăng ký — chờ gửi lại",
          "covers": [
            "block-otp-step:resend in cooldown"
          ],
          "note": "Sixty real seconds, said out loud instead of a control that looks pressable and is not.",
          "candidateUrl": "candidate/out/sign-up-code-cooldown.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up-code-cooldown.json",
          "stateId": "sign-up-code-cooldown",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up-code-cooldown",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "c0403757882bae2e0c1f7fda295ee66f139eee8cdd4c856444ee863b7d1ccd16"
          }
        },
        {
          "id": "sign-up-code-taken",
          "label": "Đăng ký — email đã có tài khoản",
          "covers": [
            "page-sign-up:address already registered"
          ],
          "note": "Arrives AFTER the code is spent, which is the whole reason this state exists.",
          "candidateUrl": "candidate/out/sign-up-code-taken.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up-code-taken.json",
          "stateId": "sign-up-code-taken",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up-code-taken",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "1bca69af399fc1feeea6d4c29f93b4ddb372e9462b7ef28bb43d6cfe7c5bf57c"
          }
        },
        {
          "id": "sign-up-done",
          "label": "Đăng ký — xong",
          "covers": [
            "page-sign-up:done"
          ],
          "note": "What stands between the mutation and the route push, and the only thing on screen if that push fails.",
          "candidateUrl": "candidate/out/sign-up-done.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-sign-up-done.json",
          "stateId": "sign-up-done",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "sign-up-done",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "8c2ab5de0086a673b89a1df95179b867071305f787f2eb8816ba68bd552f8b68"
          }
        },
        {
          "id": "forgot-password",
          "label": "Quên mật khẩu — nhập email",
          "covers": [
            "page-forgot-password:details"
          ],
          "note": "The hint says the code goes to the address AS TYPED, never that the address is known.",
          "candidateUrl": "candidate/out/forgot-password.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-forgot-password.json",
          "stateId": "forgot-password",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "forgot-password",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "e36942a5c398cd0a3a735f7bf8f0f262a62e81fd6a8786563b82e18003b37e5f"
          }
        },
        {
          "id": "forgot-password-code",
          "label": "Quên mật khẩu — mã và mật khẩu mới",
          "covers": [
            "page-forgot-password:code plus new password",
            "block-otp-step:waiting"
          ],
          "note": "Both in one tree, because `forgotPasswordVerifyOtp` takes both in one request.",
          "candidateUrl": "candidate/out/forgot-password-code.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-forgot-password-code.json",
          "stateId": "forgot-password-code",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "forgot-password-code",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "d5bdebd5bd2f79c4c45cd9c99d4c5eb832877b12799472bd8b40eadfd91241e4"
          }
        },
        {
          "id": "forgot-password-code-refused",
          "label": "Quên mật khẩu — không dùng được",
          "covers": [
            "block-otp-step:challenge gone"
          ],
          "note": "One sentence for both failures, so an inbox holder cannot tell a wrong code from an address nobody has.",
          "candidateUrl": "candidate/out/forgot-password-code-refused.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-forgot-password-code-refused.json",
          "stateId": "forgot-password-code-refused",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "forgot-password-code-refused",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "7ae8c88ed8fcef46e895cd466e563f06d7f3f36b683152cafe5fe316c4686c0f"
          }
        },
        {
          "id": "forgot-password-done",
          "label": "Quên mật khẩu — đã đổi",
          "covers": [
            "page-forgot-password:done"
          ],
          "note": "Sends the reader to sign in, not the console: the mutation returned a boolean.",
          "candidateUrl": "candidate/out/forgot-password-done.html",
          "proofUrl": "candidate/out/.well-known/starci-preview-forgot-password-done.json",
          "stateId": "forgot-password-done",
          "runtimeProof": {
            "candidateDigest": "ebab3d54c591b4a49e1142bdb781c7e8004ab9100ea354055f23a983f5320443",
            "stateId": "forgot-password-done",
            "fixtureSha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf",
            "runtimeFingerprint": "a4744bea82fbc72934dc2206338a3101bc391815dabc76cd7c2bb628be9e7155"
          }
        }
      ],
      "stateCoverage": [
        {
          "ownerId": "page-sign-in",
          "state": "handingOff / exchanging / exchangeFailed",
          "coverage": "not-applicable",
          "evidence": "the OAuth round trip, still not completable in this build; revision 1.1 changed neither tree"
        },
        {
          "ownerId": "page-sign-in",
          "state": "resetLinkSent",
          "coverage": "not-applicable",
          "evidence": "REMOVED in revision 1.1. The forgot-password link now navigates to its own route, so the panel never reaches that state and it is gone from the union."
        },
        {
          "ownerId": "block-otp-step",
          "state": "submitting",
          "coverage": "covered-by",
          "scenarioId": "sign-up-code",
          "evidence": "isPending is props on the same tree, not a state; it disables the button and spins it"
        },
        {
          "ownerId": "page-forgot-password",
          "state": "unknown address",
          "coverage": "not-applicable",
          "evidence": "PROVEN INDISTINGUISHABLE rather than absent - the e2e asserts an unknown address answers with the same flag, sentence, TTL and mailed code"
        }
      ],
      "blockTree": "SignInPage / SignUpPage / ForgotPasswordPage\n└── Tree centred-authentication-page\n     └── SurfaceFormCard contract=authentication-panel-card   <-- the card, ported from the reference\n          └── Tree authentication-panel-card\n               └── projection centred-page-column\n                    ├── SignInPanel(entry) | SignUpPanel(details|done) | ForgotPasswordPanel(details|done)\n                    └── OtpStep(code|codeWithNewPassword)",
      "candidateFiles": [
        {
          "path": "candidate/src/app/forgot-password-code-refused/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "c8e5a82961be0daba514a1addfedc403b988baece1099e336f7de2b38c47cea0"
        },
        {
          "path": "candidate/src/app/forgot-password-code/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "2792102f9fbef36a41e649be5833d455ff841c55b221cfbcde5c90303da9b2f9"
        },
        {
          "path": "candidate/src/app/forgot-password-done/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "324d745892d16ce7536ab9bcf827321bd04e1ed6def11af8942767214fc327f3"
        },
        {
          "path": "candidate/src/app/forgot-password/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "5ca50e29d3b4d287428c7166f3026c1476a5f5a69c0687d6da03827c7d03489e"
        },
        {
          "path": "candidate/src/app/globals.css",
          "targetPath": "review harness - not ported",
          "sha256": "d7d0ec3048c35ed61ed2b3c4e9fd17c0697699190a7e98961912a130e9ab2e3d"
        },
        {
          "path": "candidate/src/app/layout.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "570fdbe02150dc069840c7f58c79d5cf3fd7e274fb99321f3d1f7176b13b61a9"
        },
        {
          "path": "candidate/src/app/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "4cedc0aa7473ab478f53f6b49044136af78b2e7774aaff002059e1fc056df2f5"
        },
        {
          "path": "candidate/src/app/providers.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "f47b3a81df092a1115157b265956674b546a9ab9e2945b4f8217d7c2edfd0825"
        },
        {
          "path": "candidate/src/app/sign-in-2fa/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "d10e6a2f9f6f513ebb8c62951ddb25693bdf83f6a35a80826a3bba7203777169"
        },
        {
          "path": "candidate/src/app/sign-in-closed/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "32e200d946f44249f67c1838dade6f7b2e4080f94a59db8cc26602fbf27baaf9"
        },
        {
          "path": "candidate/src/app/sign-in-refused/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "e1c4be8d381521a136be2bb42bd6ecc87e580d3ea9657e364110e770fe052e41"
        },
        {
          "path": "candidate/src/app/sign-in/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "b4c9509b801114668c18976046351079a925d21f614988a627683fc4089cc1ac"
        },
        {
          "path": "candidate/src/app/sign-up-code-cooldown/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "dadc4222b0ae8b0b30375de8a59157ba7b255dcb628a49a0d9a43cf138617357"
        },
        {
          "path": "candidate/src/app/sign-up-code-refused/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "071eef1a5031abb9ceb18d795a077758fc2e3167ba2311dd6d955b3d5f66c508"
        },
        {
          "path": "candidate/src/app/sign-up-code-taken/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "b4e5580c9a1821dac1f900b16f2d94731c08fcb9fe93e0629e06bdfaf5a3b477"
        },
        {
          "path": "candidate/src/app/sign-up-code/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "7f117ad95530f314bcf3cca361ee5d0d30f311a686c76295c7450e26eabafd9a"
        },
        {
          "path": "candidate/src/app/sign-up-done/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "79c34261392582af42f31b07c639346928e6b06e3e0de52931a3d0632a68adf0"
        },
        {
          "path": "candidate/src/app/sign-up-refused/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "a4e2b2e020035e11291832041fc05524f20ed47cabc942afd866bbcc503c184c"
        },
        {
          "path": "candidate/src/app/sign-up/page.tsx",
          "targetPath": "review harness - not ported",
          "sha256": "2dff686c653cb395e5d53d800e97c5ca957d3473bc1110eec84a4a10ea7b77ac"
        },
        {
          "path": "candidate/src/components/blocks/auth/ForgotPasswordPanel/index.tsx",
          "targetPath": "apps/app/src/components/blocks/auth/ForgotPasswordPanel/index.tsx",
          "sha256": "3ecb0a90f6e63c7947bb567a6192019eaf660dd7f014a0914962bffee4fc54a2"
        },
        {
          "path": "candidate/src/components/blocks/auth/OtpStep/index.tsx",
          "targetPath": "apps/app/src/components/blocks/auth/OtpStep/index.tsx",
          "sha256": "f51424dc8f268b61140848080d5de74d3939631daf8393d90b622bdf8d8323f5"
        },
        {
          "path": "candidate/src/components/blocks/auth/SignInPanel/index.tsx",
          "targetPath": "apps/app/src/components/blocks/auth/SignInPanel/index.tsx",
          "sha256": "bbfa2a2ae9585d9e4754a2c16c927c8cca8ea426645019bf86d184f01e6363b2"
        },
        {
          "path": "candidate/src/components/blocks/auth/SignUpPanel/index.tsx",
          "targetPath": "apps/app/src/components/blocks/auth/SignUpPanel/index.tsx",
          "sha256": "5fddcb6eb265455056da814686b4936c7a6b049d0383e3f48819ac9e35207fea"
        },
        {
          "path": "candidate/src/components/pages/ForgotPasswordPage/index.tsx",
          "targetPath": "apps/app/src/components/pages/ForgotPasswordPage/component.tsx",
          "sha256": "2f2a67258cf204b2e5c4bf683b90398d8e168a44b12f0dc4cb760559976004b0"
        },
        {
          "path": "candidate/src/components/pages/SignInPage/index.tsx",
          "targetPath": "apps/app/src/components/pages/SignInPage/component.tsx",
          "sha256": "9f040cf075c4c2cb8f1a862ad134116182096051d8ef3d8e20e26a038b39cbc6"
        },
        {
          "path": "candidate/src/components/pages/SignUpPage/index.tsx",
          "targetPath": "apps/app/src/components/pages/SignUpPage/component.tsx",
          "sha256": "63bb312eecb0ea3b1dfd2d358c9ead239ec0915317a073441dd9367eb0e22788"
        },
        {
          "path": "candidate/src/messages/auth.vi.json",
          "targetPath": "merged into apps/app/src/messages/vi.json (and translated into en.json)",
          "sha256": "f2920cec2a97dcc3c276f848e6c658d0408a961cf54b7776437953efeafaa3cf"
        }
      ],
      "contracts": [
        {
          "key": "centred-authentication-page",
          "why": "the one centred surface an auth route sits on. NEEDS host:\"main\" - open question 2."
        },
        {
          "key": "authentication-panel-card",
          "why": "the bounded card. NEEDS an inset - open question 1 - because nivo's branches zero the vendor padding and hand the interior to the entry."
        },
        {
          "key": "centred-page-column",
          "why": "a surface read one control at a time, centred and narrow"
        },
        {
          "key": "auth-entry-stack",
          "why": "OAuth closed by the divider above, credential form below; one gap owned here"
        },
        {
          "key": "auth-shortcuts-over-divider",
          "why": "the divider CLOSES the shortcut choice rather than merely separating it"
        },
        {
          "key": "stacked-peer-controls",
          "why": "controls repeat down one column as independently readable units"
        },
        {
          "key": "spread-choice-row",
          "why": "a choice and the way out of it at opposite ends of one line"
        },
        {
          "key": "centred-prompt-row",
          "why": "a question and its answer read as one sentence"
        },
        {
          "key": "label-field-hint",
          "why": "the hint sits under the control it explains, reached after failing at it"
        }
      ],
      "proposals": [
        {
          "id": "authentication-panel-card gains an inset",
          "kind": "contract EXTEND",
          "note": "open question 1; stood in for by one scoped CSS rule so the screenshots are truthful"
        },
        {
          "id": "centred-authentication-page gains host:\"main\"",
          "kind": "contract EXTEND",
          "note": "open question 2; touches the shipped sign-in route, beneficially"
        },
        {
          "id": "TextLink gains disabled",
          "kind": "leaf API EXTEND",
          "note": "open question 4; the candidate stands in by swapping the label and withholding press"
        },
        {
          "id": "six OTP operations added to modules/api/auth.ts",
          "kind": "transport ADD",
          "note": "additive only; nothing existing in that file changes"
        }
      ],
      "backendEnablers": [
        {
          "id": "signInVerifyOtp honours TOTP",
          "classification": "SECURITY REGRESSION in existing code",
          "note": "returns requiresTwoFactor:false unconditionally while signIn gates on it. This direction does not use that path, which removes the exposure and not the hole."
        },
        {
          "id": "OtpChallengeService takes an injectable clock",
          "classification": "testability",
          "note": "the successful resend has never been executed by a test"
        }
      ],
      "assumptions": [
        "Sign-up does not collect a display name. signUpInit accepts an optional `name`; the reference does not ask.",
        "The password confirmation is checked in the browser only, because no request answers it.",
        "Sign-up keeps the OAuth shortcuts; the reset route does not. Open question 3."
      ],
      "unknowns": [
        "Whether the shipped `resetLinkSent` state is removed once the code journey lands.",
        "Whether `requestPasswordReset` and `resetPassword` stay in the transport after this."
      ]
    }
  ]
};
