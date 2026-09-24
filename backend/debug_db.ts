import "dotenv/config";
import { prisma } from "./src/config/prisma.js";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Kolkata";

async function simulate() {
  const allAttendances = await prisma.attendance.findMany({
    where: { checkInTime: { not: null } },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } }
    },
    orderBy: { attendanceDate: "desc" }
  });

  console.log(`Total attendance records with checkInTime: ${allAttendances.length}`);

  for (const att of allAttendances) {
    const checkInTime = att.checkInTime!;
    const checkInLocal = toZonedTime(checkInTime, TIMEZONE);
    
    // Shift start at 10:00 AM IST
    const shiftStartLocal = new Date(checkInLocal);
    shiftStartLocal.setHours(10, 0, 0, 0);
    const shiftStartInUTC = fromZonedTime(shiftStartLocal, TIMEZONE);

    const lateByMinutes = checkInTime > shiftStartInUTC
      ? Math.floor((checkInTime.getTime() - shiftStartInUTC.getTime()) / 60000)
      : 0;

    let penaltyPoints = 0;
    let isHalfDay = false;

    if (lateByMinutes >= 60) {
      isHalfDay = true;
      const additionalHours = Math.floor((lateByMinutes - 60) / 60);
      penaltyPoints = 10 + (additionalHours * 10);
      penaltyPoints = Math.min(penaltyPoints, 40);
    } else if (lateByMinutes >= 30) {
      penaltyPoints = 10;
    } else if (lateByMinutes >= 15) {
      penaltyPoints = 5;
    } else if (lateByMinutes >= 10) {
      penaltyPoints = 2;
    } else if (lateByMinutes >= 6) {
      penaltyPoints = 1;
    } else if (lateByMinutes > 0) {
      penaltyPoints = 1;
    }

    const checkInStr = checkInLocal.toLocaleTimeString("en-IN", { hour12: true });
    const dateStr = att.attendanceDate.toISOString().split("T")[0];

    // Employee penalty summary
  }

  const employeePenalties: Record<number, { name: string; oldPoints: number; newPenaltyPoints: number }> = {};
  const employees = await prisma.employee.findMany();
  for (const emp of employees) {
    employeePenalties[emp.id] = {
      name: `${emp.firstName} ${emp.lastName}`,
      oldPoints: emp.points,
      newPenaltyPoints: 0,
    };
  }

  for (const att of allAttendances) {
    const checkInTime = att.checkInTime!;
    const checkInLocal = toZonedTime(checkInTime, TIMEZONE);
    const shiftStartLocal = new Date(checkInLocal);
    shiftStartLocal.setHours(10, 0, 0, 0);
    const shiftStartInUTC = fromZonedTime(shiftStartLocal, TIMEZONE);
    const lateByMinutes = checkInTime > shiftStartInUTC
      ? Math.floor((checkInTime.getTime() - shiftStartInUTC.getTime()) / 60000)
      : 0;

    let penaltyPoints = 0;
    if (lateByMinutes >= 60) {
      const additionalHours = Math.floor((lateByMinutes - 60) / 60);
      penaltyPoints = 10 + (additionalHours * 10);
      penaltyPoints = Math.min(penaltyPoints, 40);
    } else if (lateByMinutes >= 30) {
      penaltyPoints = 10;
    } else if (lateByMinutes >= 15) {
      penaltyPoints = 5;
    } else if (lateByMinutes >= 10) {
      penaltyPoints = 2;
    } else if (lateByMinutes >= 6) {
      penaltyPoints = 1;
    } else if (lateByMinutes > 0) {
      penaltyPoints = 1;
    }

    if (employeePenalties[att.employeeId]) {
      employeePenalties[att.employeeId].newPenaltyPoints += penaltyPoints;
    }
  }

  console.log("\n=== Employee Points Recalculation ===");
  for (const [id, data] of Object.entries(employeePenalties)) {
    const newPoints = 0 - data.newPenaltyPoints;
    console.log(
      `Emp ID ${id.padStart(2)}: ${data.name.padEnd(20)} | Current Points: ${String(data.oldPoints).padStart(4)} -> New Points: ${String(newPoints).padStart(4)} (diff: +${newPoints - data.oldPoints})`
    );
  }
}

simulate().finally(() => prisma.$disconnect());



