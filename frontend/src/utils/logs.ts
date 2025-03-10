interface LogSheet {
  date: string;
  entries: { time: string; status: string }[];
}

const generateLogs = (tripDistance: number, tripDuration: number): LogSheet[] => {
    const logs: LogSheet[] = [];
    let currentTime = new Date();
    let remainingDistance = tripDistance;
    let remainingDuration = tripDuration;
  
    // Assumptions:
    // - Driver drives at an average speed of 50 mph (80 km/h).
    // - Driver must take a 30-minute break after 8 hours of driving.
    // - Driver must rest for 10 hours after 14 hours of duty.
  
    const averageSpeed = 50; // mph
    const maxDrivingHours = 8; // Max driving hours before a break
    const maxDutyHours = 14; // Max duty hours before rest
    const restHours = 10; // Required rest hours
  
    while (remainingDistance > 0 || remainingDuration > 0) {
      const logSheet: LogSheet = {
        date: currentTime.toISOString().split("T")[0],
        entries: [],
      };
  
      let drivingHours = 0;
      let dutyHours = 0;
  
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  
          if (remainingDistance <= 0 && remainingDuration <= 0) {
            logSheet.entries.push({ time, status: "Off Duty" });
            continue;
          }
  
          if (drivingHours >= maxDrivingHours) {
            // Driver takes a 30-minute break
            logSheet.entries.push({ time, status: "Off Duty" });
            drivingHours = 0;
            dutyHours += 0.5;
          } else if (dutyHours >= maxDutyHours) {
            // Driver rests for 10 hours
            logSheet.entries.push({ time, status: "Sleeper Berth" });
            dutyHours = 0;
            drivingHours = 0;
            currentTime.setHours(currentTime.getHours() + 10);
          } else {
            // Driver is driving
            logSheet.entries.push({ time, status: "Driving" });
            drivingHours += 0.25;
            dutyHours += 0.25;
            remainingDistance -= averageSpeed * 0.25;
            remainingDuration -= 0.25;
          }
        }
      }
  
      logs.push(logSheet);
      currentTime.setDate(currentTime.getDate() + 1); // Move to the next day
    }
  
    return logs;
  };