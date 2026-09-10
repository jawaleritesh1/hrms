import { PrismaClient, RoleName, EmploymentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const usersToCreate = [
  // 1. ADMIN
  {
    email: "rahuljadhav@sanskargrowthsolutions.com",
    password: "Rahul@2241",
    roleName: RoleName.ADMIN,
    firstName: "Rahul",
    lastName: "Jadhav",
    employeeCode: "SGS001",
    departmentCode: "ADMIN",
    jobTitle: "Director / Administrator",
  },
  // 2. HR
  {
    email: "info@sanskargrowthsolutions.com",
    password: "HR@SGS@3040",
    roleName: RoleName.HR,
    firstName: "SGS",
    lastName: "HR",
    employeeCode: "SGS002",
    departmentCode: "HR",
    jobTitle: "HR Manager",
  },
  // 3. MANAGER
  {
    email: "riteshjawale@sanskargrowthsolutions.com",
    password: "Saymyname@1",
    roleName: RoleName.MANAGER,
    firstName: "Ritesh",
    lastName: "Jawale",
    employeeCode: "SGS003",
    departmentCode: "SD",
    jobTitle: "Technical Manager",
  },
  // 4. EMPLOYEES
  {
    email: "akshaymore@sanskargrowthsolutions.com",
    password: "Akshay@3040",
    roleName: RoleName.EMPLOYEE,
    firstName: "Akshay",
    lastName: "More",
    employeeCode: "SGS004",
    departmentCode: "SD",
    jobTitle: "Software Engineer",
  },
  {
    email: "ankitachaudhari@sanskargrowthsolutions.com",
    password: "Ankita@3040",
    roleName: RoleName.EMPLOYEE,
    firstName: "Ankita",
    lastName: "Chaudhari",
    employeeCode: "SGS005",
    departmentCode: "SD",
    jobTitle: "Software Engineer",
  },
  {
    email: "bhagyashri@sanskargrowthsolutions.com",
    password: "Bhagyashri@3040",
    roleName: RoleName.EMPLOYEE,
    firstName: "Bhagyashri",
    lastName: "SGS",
    employeeCode: "SGS006",
    departmentCode: "SD",
    jobTitle: "Software Engineer",
  },
  {
    email: "dhanashree@sanskargrowthsolutions.com",
    password: "Dhanashree@3040",
    roleName: RoleName.EMPLOYEE,
    firstName: "Dhanashree",
    lastName: "SGS",
    employeeCode: "SGS007",
    departmentCode: "SD",
    jobTitle: "Software Engineer",
  },
  {
    email: "nikhil@sanskargrowthsolutions.com",
    password: "Nikhil@3040",
    roleName: RoleName.EMPLOYEE,
    firstName: "Nikhil",
    lastName: "SGS",
    employeeCode: "SGS008",
    departmentCode: "SD",
    jobTitle: "Software Engineer",
  },
];

async function main() {
  console.log("Seeding Sanskar Growth Solutions accounts...");

  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

  // Find a default shift
  let shift = await prisma.shift.findFirst({ where: { name: "Day Shift" } });
  if (!shift) {
    shift = await prisma.shift.findFirst();
  }

  // Get leave types
  const leaveTypes = await prisma.leaveType.findMany();

  for (const u of usersToCreate) {
    console.log(`\nProcessing: ${u.email} (${u.roleName})...`);

    // Get Role
    const roleRecord = await prisma.role.findUnique({
      where: { name: u.roleName },
    });
    if (!roleRecord) {
      throw new Error(`Role ${u.roleName} not found! Make sure prisma:seed was run.`);
    }

    // Get Department
    let department = await prisma.department.findUnique({
      where: { code: u.departmentCode },
    });
    if (!department) {
      department = await prisma.department.findFirst();
      if (!department) {
        throw new Error("No departments found in DB. Run seed first.");
      }
    }

    const passwordHash = await bcrypt.hash(u.password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email: u.email },
      include: { employee: true },
    });

    let employeeId: number;

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          roleId: roleRecord.id,
          isActive: true,
        },
      });

      if (existingUser.employee) {
        const updated = await prisma.employee.update({
          where: { id: existingUser.employee.id },
          data: {
            employeeCode: u.employeeCode,
            firstName: u.firstName,
            lastName: u.lastName,
            departmentId: department.id,
            shiftId: shift?.id ?? null,
            employmentStatus: EmploymentStatus.ACTIVE,
            isActive: true,
            jobTitle: u.jobTitle,
          },
        });
        employeeId = updated.id;
      } else {
        const created = await prisma.employee.create({
          data: {
            userId: existingUser.id,
            employeeCode: u.employeeCode,
            firstName: u.firstName,
            lastName: u.lastName,
            departmentId: department.id,
            shiftId: shift?.id ?? null,
            joiningDate: now,
            employmentStatus: EmploymentStatus.ACTIVE,
            isActive: true,
            jobTitle: u.jobTitle,
          },
        });
        employeeId = created.id;
      }
      console.log(` Updated existing account for ${u.email}`);
    } else {
      const createdEmployee = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: u.email,
            passwordHash,
            roleId: roleRecord.id,
            isActive: true,
          },
        });

        return tx.employee.create({
          data: {
            userId: user.id,
            employeeCode: u.employeeCode,
            firstName: u.firstName,
            lastName: u.lastName,
            departmentId: department.id,
            shiftId: shift?.id ?? null,
            joiningDate: now,
            employmentStatus: EmploymentStatus.ACTIVE,
            isActive: true,
            jobTitle: u.jobTitle,
          },
        });
      });
      employeeId = createdEmployee.id;
      console.log(` Created new account for ${u.email}`);
    }

    // Allocate leave balances
    for (const lt of leaveTypes) {
      try {
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId,
              leaveTypeId: lt.id,
              year,
            },
          },
          update: {},
          create: {
            employeeId,
            leaveTypeId: lt.id,
            year,
            allocatedDays: lt.defaultDaysPerYear,
            usedDays: 0,
            remainingDays: lt.defaultDaysPerYear,
            visibleDays: lt.defaultDaysPerYear,
            carryForwardDays: 0,
          },
        });
      } catch (err) {
        // Continue if already exists
      }
    }
  }

  console.log("\n All Sanskar Growth Solutions accounts created successfully!");
}

main()
  .catch((err) => {
    console.error("Error during seeding:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
