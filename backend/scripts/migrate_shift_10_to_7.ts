import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { AttendanceStatus } from "@prisma/client";

const TIMEZONE = "Asia/Kolkata";

async function executeShiftAndPenaltyUpdate() {
  console.log("=== STEP 1: Seed / Update Day Shift in DB (10:00 - 19:00) ===");
  let dayShift = await prisma.shift.findUnique({
    where: { name: "Day Shift" }
  });

  if (!dayShift) {
    dayShift = await prisma.shift.create({
      data: {
        name: "Day Shift",
        startTime: "10:00",
        endTime: "19:00",
        requiredMinutes: 540,
        gracePeriodMinutes: 15,
        morningTeaStart: "10:30",
        morningTeaEnd: "13:00",
        lunchStart: "13:00",
        lunchEnd: "16:00",
        eveningTeaStart: "16:00",
        eveningTeaEnd: "19:00",
        dinnerStart: "19:00",
        dinnerEnd: "23:00"
      }
    });
    console.log("Created Day Shift (10:00 - 19:00):", dayShift.id);
  } else {
    dayShift = await prisma.shift.update({
      where: { id: dayShift.id },
      data: {
        startTime: "10:00",
        endTime: "19:00",
        requiredMinutes: 540,
        gracePeriodMinutes: 15,
        morningTeaStart: "10:30",
        morningTeaEnd: "13:00",
        lunchStart: "13:00",
        lunchEnd: "16:00",
        eveningTeaStart: "16:00",
        eveningTeaEnd: "19:00",
        dinnerStart: "19:00",
        dinnerEnd: "23:00"
      }
    });
    console.log("Updated Day Shift (10:00 - 19:00):", dayShift.id);
  }

  // Assign all employees to this shift if not set
  const assignResult = await prisma.employee.updateMany({
    data: { shiftId: dayShift.id }
  });
  console.log(`Assigned ${assignResult.count} employees to Day Shift.`);

  console.log("\n=== STEP 2: Recalculate All Historical Attendance Records ===");
  const attendances = await prisma.attendance.findMany({
    where: { checkInTime: { not: null } },
    include: { employee: true },
    orderBy: { attendanceDate: "asc" }
  });

  console.log(`Processing ${attendances.length} attendance records with check-in...`);

  // Track penalty points per employee
  const employeePenalties: Record<number, number> = {};
  const newPointHistories: Array<{
    employeeId: number;
    amount: number;
    mode: "subtract";
    reason: string;
    createdAt: Date;
  }> = [];

  for (const att of attendances) {
    const checkInTime = att.checkInTime!;
    const checkInLocal = toZonedTime(checkInTime, TIMEZONE);

    // Shift start at 10:00 AM IST on attendance date
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

    const isLate = lateByMinutes > 0;
    const newStatus = isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.PRESENT;

    // Update attendance record
    await prisma.attendance.update({
      where: { id: att.id },
      data: {
        lateByMinutes,
        isLate,
        status: newStatus,
        penaltyMinutes: 0
      }
    });

    if (penaltyPoints > 0) {
      employeePenalties[att.employeeId] = (employeePenalties[att.employeeId] || 0) + penaltyPoints;
      newPointHistories.push({
        employeeId: att.employeeId,
        amount: penaltyPoints,
        mode: "subtract",
        reason: `Late check-in by ${lateByMinutes} minutes`,
        createdAt: checkInTime
      });
    }

    console.log(
      `Updated Att #${att.id} (${att.employee.firstName} ${att.employee.lastName}): Late ${att.lateByMinutes}m -> ${lateByMinutes}m, Status ${att.status} -> ${newStatus}, Points: ${penaltyPoints}`
    );
  }

  console.log("\n=== STEP 3: Rebuild Point History & Balance for Late Check-ins ===");
  // Remove previous late check-in point history records
  const deleted = await prisma.pointHistory.deleteMany({
    where: { reason: { contains: "Late check-in" } }
  });
  console.log(`Deleted ${deleted.count} old late check-in point history records.`);

  // Insert recalculated point history records
  for (const ph of newPointHistories) {
    await prisma.pointHistory.create({
      data: ph
    });
  }
  console.log(`Created ${newPointHistories.length} recalculated point history records.`);

  // Update employee points balance
  const employees = await prisma.employee.findMany();
  for (const emp of employees) {
    const totalDeductions = employeePenalties[emp.id] || 0;
    const newBalance = 0 - totalDeductions;
    await prisma.employee.update({
      where: { id: emp.id },
      data: { points: newBalance }
    });
    console.log(`Employee ${emp.firstName} ${emp.lastName}: Points updated from ${emp.points} to ${newBalance}`);
  }

  console.log("\n=== SUCCESS: Shift & Attendance Recalculation Complete ===");
}

executeShiftAndPenaltyUpdate()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
