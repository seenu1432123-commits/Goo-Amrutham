import { supabase } from "../config/supabaseClient";


/*
=========================================================
CREATE SUBSCRIPTION
=========================================================
*/

export async function createSubscription({
  userId,
  product,
  quantity,
  frequency,
  deliverySlot,
  deliveryAddress,
  city,
  pincode,
}) {

  if (!userId) {
    throw new Error("Please login first.");
  }


  if (!product) {
    throw new Error("Please select a product.");
  }


  if (!quantity || Number(quantity) < 1) {
    throw new Error(
      "Quantity must be at least 1."
    );
  }


  const allowedFrequencies = [
    "Daily",
    "Weekly",
    "Monthly",
  ];


  if (!allowedFrequencies.includes(frequency)) {
    throw new Error(
      "Please select a valid subscription frequency."
    );
  }


  /*
  =======================================================
  CALCULATE NEXT DELIVERY DATE

  We calculate the date using the browser's local date.
  The subscription itself stores only a DATE, not a
  timestamp.
  =======================================================
  */

  const nextDeliveryDate =
    new Date();


  if (frequency === "Daily") {

    nextDeliveryDate.setDate(
      nextDeliveryDate.getDate() + 1
    );

  }


  if (frequency === "Weekly") {

    nextDeliveryDate.setDate(
      nextDeliveryDate.getDate() + 7
    );

  }


  if (frequency === "Monthly") {

    nextDeliveryDate.setMonth(
      nextDeliveryDate.getMonth() + 1
    );

  }


  /*
  =======================================================
  FORMAT DATE SAFELY
  =======================================================
  */

  const year =
    nextDeliveryDate.getFullYear();


  const month =
    String(
      nextDeliveryDate.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      nextDeliveryDate.getDate()
    ).padStart(2, "0");


  const formattedDate =
    `${year}-${month}-${day}`;


  /*
  =======================================================
  SUBSCRIPTION DATA
  =======================================================
  */

  const subscription = {

    user_id:
      userId,


    product_id:
      product.id
        ? String(product.id)
        : null,


    product_name:
      product.name ||
      "Milk Product",


    unit:
      product.unit ||
      "L",


    quantity:
      Number(quantity),


    unit_price:
      Number(product.price || 0),


    frequency:
      frequency,


    delivery_slot:
      deliverySlot ||
      "Morning",


    delivery_address:
      deliveryAddress ||
      "",


    city:
      city ||
      "",


    pincode:
      pincode ||
      "",


    status:
      "Active",


    next_delivery_date:
      formattedDate,

  };


  /*
  =======================================================
  SAVE SUBSCRIPTION
  =======================================================
  */

  const {
    data,
    error,
  } = await supabase

    .from("subscriptions")

    .insert(subscription)

    .select()

    .single();


  if (error) {

    console.error(
      "Subscription creation error:",
      error
    );

    throw error;

  }


  return data;

}


/*
=========================================================
GET USER SUBSCRIPTIONS
=========================================================
*/

export async function getUserSubscriptions(
  userId
) {

  if (!userId) {
    return [];
  }


  const {
    data,
    error,
  } = await supabase

    .from("subscriptions")

    .select("*")

    .eq(
      "user_id",
      userId
    )

    .order(
      "created_at",
      {
        ascending: false,
      }
    );


  if (error) {

    console.error(
      "Subscription loading error:",
      error
    );

    throw error;

  }


  return data || [];

}


/*
=========================================================
UPDATE SUBSCRIPTION STATUS
=========================================================
*/

export async function updateSubscriptionStatus(
  subscriptionId,
  userId,
  status
) {

  if (!subscriptionId) {
    throw new Error(
      "Subscription ID is required."
    );
  }


  if (!userId) {
    throw new Error(
      "Please login first."
    );
  }


  const allowedStatuses = [
    "Active",
    "Paused",
    "Cancelled",
    "Completed",
  ];


  if (!allowedStatuses.includes(status)) {

    throw new Error(
      "Invalid subscription status."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("subscriptions")

    .update({

      status,

      updated_at:
        new Date().toISOString(),

    })

    .eq(
      "id",
      subscriptionId
    )

    .eq(
      "user_id",
      userId
    )

    .select()

    .single();


  if (error) {

    console.error(
      "Subscription status update error:",
      error
    );

    throw error;

  }


  return data;

}