import { supabase } from "../supabase";

/**
 * Persistent deduplication using localStorage.
 * Each browser will only fire a given event_type + restaurant_id ONCE,
 * regardless of page reloads, new sessions, or login state.
 * Clicks (bookings) are NOT deduplicated — every booking counts.
 */
const STORAGE_KEY = "analytics_tracked";

function getTrackedSet() {
 try {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? new Set(JSON.parse(raw)) : new Set();
 } catch {
  return new Set();
 }
}

function persistKey(key) {
 const set = getTrackedSet();
 set.add(key);
 localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function getBrowserId() {
 let bid = localStorage.getItem("analytics_bid");
 if (!bid) {
  bid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  localStorage.setItem("analytics_bid", bid);
 }
 return bid;
}

/**
 * Track an analytics event for a restaurant.
 * @param {"impression" | "view" | "click"} eventType
 * @param {string} restaurantId  - UUID of the restaurant
 * @param {object} [meta]       - optional extra metadata
 */
export async function trackEvent(eventType, restaurantId, meta = {}) {
 if (!restaurantId) return;

 const browserId = getBrowserId();

 // Clicks always count (every booking is meaningful), but
 // impressions & views are limited to once per browser per restaurant.
 if (eventType !== "click") {
  const key = `${eventType}:${restaurantId}`;
  const alreadyTracked = getTrackedSet();
  if (alreadyTracked.has(key)) return;
  persistKey(key);
 }

 try {
  await supabase.from("restaurant_analytics").insert({
   restaurant_id: restaurantId,
   event_type: eventType,
   session_id: browserId,
   metadata: meta,
  });
 } catch (err) {
  console.error("Analytics tracking error:", err);
 }
}

/**
 * Convenience helpers
 */
export const trackImpression = (restaurantId) =>
 trackEvent("impression", restaurantId);

export const trackView = (restaurantId) => trackEvent("view", restaurantId);

export const trackClick = (restaurantId, action = "booking") =>
 trackEvent("click", restaurantId, { action });
