// Opening hours for Creamy Chills (UK time)
// Mon-Thu: 12:00-22:00, Fri-Sat: 12:00-23:00, Sun: 12:00-22:00

const openingHours = {
  0: { open: 12, close: 22 },  // Sunday
  1: { open: 12, close: 22 },  // Monday
  2: { open: 12, close: 22 },  // Tuesday
  3: { open: 12, close: 22 },  // Wednesday
  4: { open: 12, close: 22 },  // Thursday
  5: { open: 12, close: 23 },  // Friday
  6: { open: 12, close: 23 },  // Saturday
};

const checkOpeningHours = (req, res, next) => {
  // Skip check in development
  if (process.env.NODE_ENV !== 'production') return next();
  
  // Get current UK time
  const now = new Date();
  const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const day = ukTime.getDay();
  const hour = ukTime.getHours();
  const minutes = ukTime.getMinutes();
  const currentTime = hour + minutes / 60;

  const hours = openingHours[day];
  
  if (currentTime < hours.open || currentTime >= hours.close) {
    return res.status(503).json({
      message: 'We are currently closed',
      openingHours: `${hours.open}:00 - ${hours.close}:00`,
      nextOpen: getNextOpenTime(ukTime)
    });
  }

  // Stop orders 15 minutes before closing
  if (currentTime >= hours.close - 0.25) {
    return res.status(503).json({
      message: 'Kitchen is closing soon. Please try again tomorrow.',
      closingAt: `${hours.close}:00`
    });
  }

  next();
};

function getNextOpenTime(now) {
  const day = now.getDay();
  const hour = now.getHours();
  const todayHours = openingHours[day];

  if (hour < todayHours.open) {
    return `Today at ${todayHours.open}:00`;
  }

  const nextDay = (day + 1) % 7;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${days[nextDay]} at ${openingHours[nextDay].open}:00`;
}

module.exports = { checkOpeningHours };
