const {
  addDays,
  formatDistanceStrict,
} = require("date-fns");

function calculateRemainingDays(caseObj, investigation_days) {
  if (!caseObj.countdown_start_date) return null;

  let endDate;

  if (caseObj.countdown_end_date) {
    endDate = new Date(caseObj.countdown_end_date);
  } else {
    if (!investigation_days) return null;
    endDate = addDays(
      new Date(caseObj.countdown_start_date),
      investigation_days
    );
  }

  const now = new Date();

  let diffMs = endDate - now;
  if (diffMs < 0) diffMs = 0;

  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= daysLeft * (1000 * 60 * 60 * 24);

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hoursLeft * (1000 * 60 * 60);

  const minutesLeft = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutesLeft * (1000 * 60);

  const secondsLeft = Math.floor(diffMs / 1000);

  return {
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    isExpired: endDate <= now,
    pretty:
      endDate <= now
        ? "Expired"
        : formatDistanceStrict(endDate, now, { unit: "day" }),
    endDate,
  };
}

module.exports = { calculateRemainingDays };
