
declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

/* =====================================================
   TYPES
===================================================== */

type OrderItem = {
  name?: string;
  product_name?: string;
  unit?: string;
  quantity?: string | number;
  qty?: string | number;
  price?: string | number;
  unit_price?: string | number;
  line_total?: string | number;
};

type OrderData = {
  order_number?: string;
  customer_name?: string;
  customer_email?: string;

  address?: string;
  city?: string;
  pincode?: string;

  slot?: string;
  frequency?: string;
  instructions?: string;

  subtotal?: string | number;
  delivery_fee?: string | number;
  total?: string | number;
  total_amount?: string | number;

  payment_method?: string;
  payment_status?: string;

  razorpay_order_id?: string;
  razorpay_payment_id?: string;

  items?: OrderItem[];
};

/* =====================================================
   JSON RESPONSE
===================================================== */

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =====================================================
   MONEY FORMAT
===================================================== */

function money(value: unknown): string {
  const amount = Number(value || 0);

  return `₹${amount.toFixed(2)}`;
}

/* =====================================================
   EDGE FUNCTION
===================================================== */

Deno.serve(async (req) => {
  /* ===================================================
     CORS
  =================================================== */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  /* ===================================================
     ONLY POST
  =================================================== */

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed.",
      },
      405
    );
  }

  try {
    /* =================================================
       RESEND API KEY
    ================================================= */

    const resendApiKey =
      Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error(
        "RESEND_API_KEY is missing."
      );

      return jsonResponse(
        {
          success: false,
          error:
            "RESEND_API_KEY is not configured.",
        },
        500
      );
    }

    /* =================================================
       RESEND FROM EMAIL
       
       IMPORTANT:
       Change this to the sender address available
       in your Resend account.
    ================================================= */

    const fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "onboarding@resend.dev";

    /* =================================================
       READ BODY
    ================================================= */

    let body: {
      order?: OrderData;
    };

    try {
      body = await req.json();
    } catch (error) {
      console.error(
        "Invalid JSON body:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error: "Invalid request body.",
        },
        400
      );
    }

    const order = body?.order;

    /* =================================================
       VALIDATE ORDER
    ================================================= */

    if (!order) {
      return jsonResponse(
        {
          success: false,
          error:
            "Order information is required.",
        },
        400
      );
    }

    if (
      !order.customer_email ||
      !String(
        order.customer_email
      ).trim()
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Customer email is required.",
        },
        400
      );
    }

    /* =================================================
       VALUES
    ================================================= */

    const orderNumber =
      order.order_number ||
      "GAM-ORDER";

    const customerName =
      order.customer_name ||
      "Customer";

    const customerEmail =
      order.customer_email;

    const address =
      order.address || "";

    const city =
      order.city || "";

    const pincode =
      order.pincode || "";

    const slot =
      order.slot || "Morning";

    const frequency =
      order.frequency || "One Time";

    const paymentMethod =
      order.payment_method ||
      "razorpay";

    const paymentStatus =
      order.payment_status ||
      "Paid";

    const subtotal =
      order.subtotal || 0;

    const deliveryFee =
      order.delivery_fee || 0;

    const total =
      order.total ??
      order.total_amount ??
      0;

    const items =
      Array.isArray(order.items)
        ? order.items
        : [];

    /* =================================================
       PAYMENT DISPLAY
    ================================================= */

    const paymentMethodText =
      paymentMethod.toLowerCase() ===
      "cod"
        ? "Cash on Delivery"
        : "Online Payment";

    const paymentStatusText =
      paymentStatus.toLowerCase() ===
      "paid"
        ? "Paid"
        : paymentStatus;

    /* =================================================
       ORDER ITEMS HTML
    ================================================= */

    let itemsHtml = "";

    if (items.length > 0) {
      itemsHtml = items
        .map((item) => {
          const itemName =
            item.name ||
            item.product_name ||
            "Milk Product";

          const unit =
            item.unit || "";

          const quantity =
            Number(
              item.quantity ??
                item.qty ??
                1
            );

          const unitPrice =
            Number(
              item.price ??
                item.unit_price ??
                0
            );

          const lineTotal =
            Number(
              item.line_total ??
                unitPrice *
                  quantity
            );

          return `
            <tr>
              <td style="
                padding:12px 8px;
                border-bottom:1px solid #eeeeee;
              ">
                <strong>
                  ${escapeHtml(itemName)}
                </strong>

                ${
                  unit
                    ? `
                      <div style="
                        font-size:12px;
                        color:#777777;
                        margin-top:3px;
                      ">
                        ${escapeHtml(unit)}
                      </div>
                    `
                    : ""
                }
              </td>

              <td style="
                padding:12px 8px;
                text-align:center;
                border-bottom:1px solid #eeeeee;
              ">
                ${quantity}
              </td>

              <td style="
                padding:12px 8px;
                text-align:right;
                border-bottom:1px solid #eeeeee;
              ">
                ${money(unitPrice)}
              </td>

              <td style="
                padding:12px 8px;
                text-align:right;
                border-bottom:1px solid #eeeeee;
              ">
                <strong>
                  ${money(lineTotal)}
                </strong>
              </td>
            </tr>
          `;
        })
        .join("");
    } else {
      itemsHtml = `
        <tr>
          <td
            colspan="4"
            style="
              padding:20px;
              text-align:center;
              color:#777777;
            "
          >
            Order items information unavailable.
          </td>
        </tr>
      `;
    }

    /* =================================================
       RAZORPAY DETAILS
    ================================================= */

    const razorpayDetails =
      paymentMethod.toLowerCase() !==
        "cod" &&
      (order.razorpay_payment_id ||
        order.razorpay_order_id)
        ? `
          <div style="
            margin-top:20px;
            padding:16px;
            background:#f8f9fa;
            border-radius:10px;
          ">
            <h4 style="
              margin:0 0 10px;
              color:#333333;
            ">
              Payment Details
            </h4>

            ${
              order.razorpay_payment_id
                ? `
                  <p style="
                    margin:5px 0;
                    font-size:13px;
                    color:#555555;
                  ">
                    <strong>
                      Payment ID:
                    </strong>
                    ${escapeHtml(
                      order.razorpay_payment_id
                    )}
                  </p>
                `
                : ""
            }

            ${
              order.razorpay_order_id
                ? `
                  <p style="
                    margin:5px 0;
                    font-size:13px;
                    color:#555555;
                  ">
                    <strong>
                      Razorpay Order ID:
                    </strong>
                    ${escapeHtml(
                      order.razorpay_order_id
                    )}
                  </p>
                `
                : ""
            }
          </div>
        `
        : "";

    /* =================================================
       DELIVERY ADDRESS
    ================================================= */

    const deliveryAddress = `
      ${escapeHtml(address)}
      ${
        city
          ? `<br>${escapeHtml(city)}`
          : ""
      }
      ${
        pincode
          ? `<br>${escapeHtml(pincode)}`
          : ""
      }
    `;

    /* =================================================
       INSTRUCTIONS
    ================================================= */

    const instructionsHtml =
      order.instructions &&
      String(
        order.instructions
      ).trim()
        ? `
          <div style="
            margin-top:20px;
            padding:15px;
            background:#fff8e1;
            border-radius:10px;
          ">
            <strong>
              Delivery Instructions
            </strong>

            <p style="
              margin:8px 0 0;
              color:#555555;
            ">
              ${escapeHtml(
                order.instructions
              )}
            </p>
          </div>
        `
        : "";

    /* =================================================
       EMAIL HTML
    ================================================= */

    const html = `
<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Goo Amrutham Order Confirmation
  </title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f4f7f5;
  font-family:Arial,Helvetica,sans-serif;
  color:#333333;
">

  <div style="
    max-width:700px;
    margin:30px auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,0.08);
  ">

    <!-- HEADER -->

    <div style="
      background:#198754;
      padding:30px 20px;
      text-align:center;
      color:#ffffff;
    ">

      <div style="
        font-size:38px;
        margin-bottom:8px;
      ">
        🥛
      </div>

      <h1 style="
        margin:0;
        font-size:28px;
      ">
        Goo Amrutham
      </h1>

      <p style="
        margin:8px 0 0;
        font-size:14px;
      ">
        Natural Organic Milk
      </p>

    </div>


    <!-- SUCCESS -->

    <div style="
      padding:30px 25px 10px;
      text-align:center;
    ">

      <div style="
        font-size:40px;
        margin-bottom:10px;
      ">
        ✅
      </div>

      <h2 style="
        margin:0;
        color:#198754;
      ">
        Order Confirmed!
      </h2>

      <p style="
        color:#666666;
        line-height:1.6;
      ">
        Hello
        <strong>
          ${escapeHtml(customerName)}
        </strong>,
        your Goo Amrutham Milk order has
        been successfully confirmed.
      </p>

    </div>


    <!-- ORDER NUMBER -->

    <div style="
      margin:15px 25px;
      padding:18px;
      background:#eaf7ef;
      border-radius:12px;
      text-align:center;
    ">

      <div style="
        font-size:12px;
        color:#666666;
        margin-bottom:5px;
      ">
        ORDER NUMBER
      </div>

      <div style="
        font-size:22px;
        font-weight:bold;
        color:#198754;
      ">
        ${escapeHtml(orderNumber)}
      </div>

    </div>


    <!-- ORDER ITEMS -->

    <div style="
      padding:20px 25px;
    ">

      <h3 style="
        margin-top:0;
        color:#333333;
      ">
        🛒 Order Details
      </h3>

      <table
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="
          border-collapse:collapse;
          font-size:14px;
        "
      >

        <thead>

          <tr style="
            background:#f8f9fa;
          ">

            <th style="
              padding:12px 8px;
              text-align:left;
            ">
              Product
            </th>

            <th style="
              padding:12px 8px;
              text-align:center;
            ">
              Qty
            </th>

            <th style="
              padding:12px 8px;
              text-align:right;
            ">
              Price
            </th>

            <th style="
              padding:12px 8px;
              text-align:right;
            ">
              Total
            </th>

          </tr>

        </thead>

        <tbody>

          ${itemsHtml}

        </tbody>

      </table>

    </div>


    <!-- PRICE SUMMARY -->

    <div style="
      margin:0 25px;
      padding:20px;
      background:#f8f9fa;
      border-radius:12px;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        margin-bottom:10px;
      ">
        <span>
          Subtotal
        </span>

        <strong>
          ${money(subtotal)}
        </strong>
      </div>

      <div style="
        display:flex;
        justify-content:space-between;
        margin-bottom:10px;
      ">
        <span>
          Delivery Fee
        </span>

        <strong>
          ${
            Number(deliveryFee) === 0
              ? "FREE"
              : money(deliveryFee)
          }
        </strong>
      </div>

      <div style="
        border-top:1px solid #dddddd;
        margin-top:12px;
        padding-top:12px;
        display:flex;
        justify-content:space-between;
        font-size:18px;
      ">
        <strong>
          Total
        </strong>

        <strong style="
          color:#198754;
        ">
          ${money(total)}
        </strong>
      </div>

    </div>


    <!-- PAYMENT -->

    <div style="
      padding:25px;
    ">

      <h3 style="
        margin-top:0;
      ">
        💳 Payment Information
      </h3>

      <p style="
        margin:7px 0;
      ">
        <strong>
          Method:
        </strong>
        ${escapeHtml(
          paymentMethodText
        )}
      </p>

      <p style="
        margin:7px 0;
      ">
        <strong>
          Status:
        </strong>

        <span style="
          color:#198754;
          font-weight:bold;
        ">
          ${escapeHtml(
            paymentStatusText
          )}
        </span>
      </p>

      ${razorpayDetails}

    </div>


    <!-- DELIVERY -->

    <div style="
      margin:0 25px 25px;
      padding:20px;
      border:1px solid #eeeeee;
      border-radius:12px;
    ">

      <h3 style="
        margin-top:0;
      ">
        🚚 Delivery Information
      </h3>

      <p style="
        line-height:1.7;
        margin:6px 0;
      ">
        <strong>
          Address:
        </strong>
        <br>
        ${deliveryAddress}
      </p>

      <p style="
        margin:10px 0;
      ">
        <strong>
          Delivery Slot:
        </strong>
        ${escapeHtml(slot)}
      </p>

      <p style="
        margin:10px 0;
      ">
        <strong>
          Frequency:
        </strong>
        ${escapeHtml(frequency)}
      </p>

      ${instructionsHtml}

    </div>


    <!-- FOOTER -->

    <div style="
      background:#f8f9fa;
      padding:25px;
      text-align:center;
      color:#777777;
      font-size:13px;
      line-height:1.6;
    ">

      <strong style="
        color:#198754;
      ">
        Goo Amrutham Milk
      </strong>

      <br>

      From our fields to your home 🥛

      <br><br>

      Thank you for choosing
      Goo Amrutham.

    </div>

  </div>

</body>
</html>
`;

    /* =================================================
       SEND EMAIL USING RESEND
    ================================================= */

    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${resendApiKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            from:
              `Goo Amrutham Milk <${fromEmail}>`,

            to: [
              customerEmail,
            ],

            subject:
              `Order Confirmed - ${orderNumber} | Goo Amrutham Milk`,

            html,
          }),
        }
      );

    const resendData =
      await resendResponse.json();

    /* =================================================
       RESEND ERROR
    ================================================= */

    if (!resendResponse.ok) {
      console.error(
        "Resend API error:",
        resendData
      );

      return jsonResponse(
        {
          success: false,
          error:
            resendData?.message ||
            resendData?.error ||
            "Unable to send order confirmation email.",
        },
        500
      );
    }

    /* =================================================
       SUCCESS
    ================================================= */

    console.log(
      "Order confirmation email sent successfully.",
      {
        orderNumber,
        customerEmail,
        resendId:
          resendData?.id,
      }
    );

    return jsonResponse({
      success: true,

      message:
        "Order confirmation email sent successfully.",

      order_number:
        orderNumber,

      email:
        customerEmail,

      resend_id:
        resendData?.id || null,
    });
  } catch (error) {
    console.error(
      "Send order email error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send order confirmation email.",
      },
      500
    );
  }
});