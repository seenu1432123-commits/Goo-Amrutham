const MSG91_WIDGET_ID =
    import.meta.env.VITE_MSG91_WIDGET_ID;

const MSG91_TOKEN_AUTH =
    import.meta.env.VITE_MSG91_TOKEN_AUTH;

let msg91Initialized = false;

export const initializeMSG91 = () => {
    return new Promise((resolve, reject) => {

        if (typeof window === "undefined") {
            reject(
                new Error(
                    "MSG91 OTP can only run in a browser."
                )
            );
            return;
        }

        if (
            msg91Initialized &&
            typeof window.sendOtp === "function" &&
            typeof window.verifyOtp === "function"
        ) {
            resolve(true);
            return;
        }

        if (!MSG91_WIDGET_ID) {
            reject(
                new Error(
                    "VITE_MSG91_WIDGET_ID is missing."
                )
            );
            return;
        }

        if (!MSG91_TOKEN_AUTH) {
            reject(
                new Error(
                    "VITE_MSG91_TOKEN_AUTH is missing."
                )
            );
            return;
        }

        const configuration = {

            widgetId:
                MSG91_WIDGET_ID,

            tokenAuth:
                MSG91_TOKEN_AUTH,

            identifier:
                "",

            exposeMethods:
                true,

            success:
                (data) => {

                    console.log(
                        "MSG91 widget success:",
                        data
                    );

                },

            failure:
                (error) => {

                    console.error(
                        "MSG91 widget failure:",
                        error
                    );

                },
        };


        const initialize = () => {

            if (
                typeof window.initSendOTP !==
                "function"
            ) {

                reject(
                    new Error(
                        "MSG91 initSendOTP is unavailable."
                    )
                );

                return;
            }


            try {

                window.initSendOTP(
                    configuration
                );

                const started =
                    Date.now();

                const check =
                    setInterval(() => {

                        if (
                            typeof window.sendOtp ===
                                "function" &&
                            typeof window.verifyOtp ===
                                "function"
                        ) {

                            clearInterval(
                                check
                            );

                            msg91Initialized =
                                true;

                            console.log(
                                "MSG91 OTP widget ready."
                            );

                            resolve(true);

                            return;
                        }


                        if (
                            Date.now() -
                                started >
                            10000
                        ) {

                            clearInterval(
                                check
                            );

                            reject(
                                new Error(
                                    "MSG91 OTP methods were not exposed. Check exposeMethods=true and widget configuration."
                                )
                            );
                        }

                    }, 100);

            } catch (error) {

                reject(error);
            }
        };


        if (
            typeof window.initSendOTP ===
            "function"
        ) {

            initialize();

            return;
        }


        const script =
            document.createElement(
                "script"
            );

        script.src =
            "https://verify.msg91.com/otp-provider.js";

        script.async = true;

        script.onload =
            initialize;

        script.onerror = () => {

            reject(
                new Error(
                    "Unable to load MSG91 OTP provider."
                )
            );
        };

        document.head.appendChild(
            script
        );
    });
};