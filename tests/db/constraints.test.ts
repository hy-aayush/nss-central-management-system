/**
 * PostgreSQL constraints on the foundational schema (SRS 8.1, 8.2, 8.8).
 *
 * Every assertion uses a real connection and lets PostgreSQL reject the
 * statement. Rows created by successful inserts live under the reserved `88%`
 * roll-number namespace and are removed after each test.
 *
 * Not covered here because the objects do not exist yet (documented as todos,
 * never as passes): `office_assignments` integrity and the SRS 11.10 counter
 * functions.
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createDatabase } from "../../src/db/client";
import { seedProjectReferenceData } from "../../src/db/seed";
import {
  createScratchDatabase,
  deleteVolunteer,
  expectPgError,
  insertAssignment,
  insertVolunteer,
  type ScratchDatabase,
} from "./harness";

const TEST_ROLL = "8800001";

describe("PostgreSQL constraints on projects, volunteers and volunteer_domains", () => {
  let scratch: ScratchDatabase;

  beforeAll(async () => {
    scratch = await createScratchDatabase("constraints");
  });

  afterAll(async () => {
    await scratch.cleanup();
  });

  afterEach(async () => {
    await scratch.admin`delete from office_assignments
      where roll_number like '88%'
         or granted_by like '88%'
         or ended_by like '88%'`;
    await scratch.admin`delete from volunteer_domains where roll_number like '88%'`;
    await scratch.admin`delete from volunteers where roll_number like '88%'`;
    await scratch.admin`delete from projects where id in (10, 11)`;
  });

  describe("required columns, nullability and defaults", () => {
    it("accepts only the required volunteer columns and applies every default", async () => {
      const row = await insertVolunteer(scratch.admin, {
        rollNumber: TEST_ROLL,
        name: "Constraint Test One",
      });

      expect(row.roll_number).toBe(TEST_ROLL);
      expect(row.gender).toBe("MALE");
      expect(row.status).toBe("ACTIVE");
      expect(Number(row.notes_edit_count)).toBe(0);
      expect(Number(row.events_attended)).toBe(0);
      expect(Number(row.events_fcfs_final)).toBe(0);
      expect(Number(row.events_fcfs_present)).toBe(0);
      expect(Number(row.events_missed_fcfs)).toBe(0);
      expect(Number(row.meetings_present)).toBe(0);
      expect(Number(row.meetings_absent)).toBe(0);
      expect(Number(row.allocated_hours)).toBe(0);
      expect(Number(row.red_flag_count)).toBe(0);
      expect(row.created_at).toBeInstanceOf(Date);
      expect(row.updated_at).toBeInstanceOf(Date);

      // Optional personal fields accept NULL.
      expect(row.phone).toBeNull();
      expect(row.hostel).toBeNull();
      expect(row.blood_group).toBeNull();
      expect(row.city_state).toBeNull();
      expect(row.project_id).toBeNull();
      expect(row.notes).toBeNull();
      expect(row.notes_updated_by).toBeNull();
      expect(row.notes_updated_at).toBeNull();

      // join_date defaults to the database's current date in the session zone.
      const [dateCheck] = await scratch.admin<{ same_day: boolean }[]>`
        select join_date = current_date as same_day
        from volunteers where roll_number = ${TEST_ROLL}
      `;
      expect(dateCheck?.same_day).toBe(true);
    });

    it("rejects a NULL roll number", async () => {
      await expectPgError(
        scratch.admin`insert into volunteers (roll_number, name, gender, batch_year)
          values (null, 'Null Roll', 'MALE', 2024)`,
        { code: "23502", column: "roll_number" },
      );
    });

    it("rejects a NULL name", async () => {
      await expectPgError(
        scratch.admin`insert into volunteers (roll_number, name, gender, batch_year)
          values ('8800002', null, 'MALE', 2024)`,
        { code: "23502", column: "name" },
      );
    });

    it("rejects a NULL gender", async () => {
      await expectPgError(
        scratch.admin`insert into volunteers (roll_number, name, gender, batch_year)
          values ('8800003', 'No Gender', null, 2024)`,
        { code: "23502", column: "gender" },
      );
    });

    it("rejects a NULL batch year", async () => {
      await expectPgError(
        scratch.admin`insert into volunteers (roll_number, name, gender, batch_year)
          values ('8800004', 'No Batch', 'MALE', null)`,
        { code: "23502", column: "batch_year" },
      );
    });

    it("rejects a NULL counter", async () => {
      await expectPgError(
        scratch.admin`insert into volunteers (roll_number, name, gender, batch_year, events_attended)
          values ('8800005', 'Null Counter', 'MALE', 2024, null)`,
        { code: "23502", column: "events_attended" },
      );
    });

    it("accepts a project row with only its required columns and applies defaults", async () => {
      const [row] = await scratch.admin<
        {
          id: number;
          tagline: string;
          description: string;
          accent_color: string;
          last_activity_at: Date | null;
          updated_at: Date;
        }[]
      >`
        insert into projects (id, slug, name, sdgs)
        values (10, 'test-project', 'Test Project', array[1, 2]::smallint[])
        returning id, tagline, description, accent_color, last_activity_at, updated_at
      `;

      expect(row?.id).toBe(10);
      expect(row?.tagline).toBe("");
      expect(row?.description).toBe("");
      expect(row?.accent_color).toBe("#64748b");
      expect(row?.last_activity_at).toBeNull();
      expect(row?.updated_at).toBeInstanceOf(Date);
    });

    it("rejects a NULL project slug", async () => {
      await expectPgError(
        scratch.admin`insert into projects (id, slug, name, sdgs)
          values (10, null, 'Test Project', array[1]::smallint[])`,
        { code: "23502", column: "slug" },
      );
    });

    it("rejects a NULL SDG array", async () => {
      await expectPgError(
        scratch.admin`insert into projects (id, slug, name, sdgs)
          values (10, 'test-project', 'Test Project', null)`,
        { code: "23502", column: "sdgs" },
      );
    });

    it("defaults volunteer_domains.since to the current date", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: TEST_ROLL });
      await scratch.admin`
        insert into volunteer_domains (roll_number, domain)
        values (${TEST_ROLL}, 'PHOTOGRAPHY')
      `;

      const [row] = await scratch.admin<{ same_day: boolean }[]>`
        select since = current_date as same_day
        from volunteer_domains where roll_number = ${TEST_ROLL}
      `;
      expect(row?.same_day).toBe(true);
    });
  });

  describe("enum values", () => {
    it("rejects an unknown gender", async () => {
      await expectPgError(
        insertVolunteer(scratch.admin, {
          rollNumber: "8800100",
          gender: "UNKNOWN",
        }),
        { code: "22P02" },
      );
    });

    it("rejects an unknown volunteer status", async () => {
      await expectPgError(
        insertVolunteer(scratch.admin, {
          rollNumber: "8800101",
          status: "DELETED",
        }),
        { code: "22P02" },
      );
    });

    it("rejects an unknown blood group", async () => {
      await expectPgError(
        insertVolunteer(scratch.admin, {
          rollNumber: "8800102",
          bloodGroup: "C+",
        }),
        { code: "22P02" },
      );
    });

    it("rejects an unknown creative domain", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: TEST_ROLL });

      await expectPgError(
        scratch.admin`insert into volunteer_domains (roll_number, domain)
          values (${TEST_ROLL}, 'SINGING')`,
        { code: "22P02" },
      );
    });

    it("accepts every valid enum value", async () => {
      const genders = ["MALE", "FEMALE", "OTHER"];
      const statuses = ["ACTIVE", "SUSPENDED", "ARCHIVED"];

      await insertVolunteer(scratch.admin, {
        rollNumber: "8800103",
        gender: genders[2],
        status: statuses[1],
        bloodGroup: "AB-",
      });
      await insertVolunteer(scratch.admin, {
        rollNumber: "8800104",
        gender: genders[1],
        status: statuses[2],
      });

      await scratch.admin`insert into volunteer_domains (roll_number, domain)
        values (${"8800103"}, 'PHOTOGRAPHY'), (${"8800103"}, 'VIDEO_EDITING')`;

      const [check] = await scratch.admin<{ count: number }[]>`
        select count(*)::int as count from volunteer_domains
        where roll_number = '8800103'
      `;
      expect(check?.count).toBe(2);
    });
  });

  describe("CHECK constraints", () => {
    const cases: {
      title: string;
      constraint: string;
      values: Parameters<typeof insertVolunteer>[1];
    }[] = [
      {
        title: "roll number shorter than four characters",
        constraint: "volunteers_roll_number_check",
        values: { rollNumber: "A1" },
      },
      {
        title: "roll number with a hyphen",
        constraint: "volunteers_roll_number_check",
        values: { rollNumber: "88-0001" },
      },
      {
        title: "name shorter than two characters",
        constraint: "volunteers_name_check",
        values: { rollNumber: "8800200", name: "A" },
      },
      {
        title: "name longer than 100 characters",
        constraint: "volunteers_name_check",
        values: { rollNumber: "8800200", name: "x".repeat(101) },
      },
      {
        title: "phone not starting 6-9",
        constraint: "volunteers_phone_check",
        values: { rollNumber: "8800200", phone: "1234567890" },
      },
      {
        title: "phone with nine digits",
        constraint: "volunteers_phone_check",
        values: { rollNumber: "8800200", phone: "987654321" },
      },
      {
        title: "phone with eleven digits",
        constraint: "volunteers_phone_check",
        values: { rollNumber: "8800200", phone: "98765432109" },
      },
      {
        title: "hostel longer than 60 characters",
        constraint: "volunteers_hostel_check",
        values: { rollNumber: "8800200", hostel: "H".repeat(61) },
      },
      {
        title: "city/state longer than 60 characters",
        constraint: "volunteers_city_state_check",
        values: { rollNumber: "8800200", cityState: "C".repeat(61) },
      },
      {
        title: "batch year before 2000",
        constraint: "volunteers_batch_year_check",
        values: { rollNumber: "8800200", batchYear: 1999 },
      },
      {
        title: "batch year after 2100",
        constraint: "volunteers_batch_year_check",
        values: { rollNumber: "8800200", batchYear: 2101 },
      },
      {
        title: "notes longer than 1,000 characters",
        constraint: "volunteers_notes_check",
        values: { rollNumber: "8800200", notes: "n".repeat(1001) },
      },
    ];

    for (const testCase of cases) {
      it(`rejects a ${testCase.title}`, async () => {
        await expectPgError(insertVolunteer(scratch.admin, testCase.values), {
          code: "23514",
          constraint: testCase.constraint,
        });
      });
    }

    it("accepts the boundary values", async () => {
      await insertVolunteer(scratch.admin, {
        rollNumber: "880000",
        name: "AB",
        batchYear: 2000,
        phone: "6000000000",
        hostel: "H".repeat(60),
        cityState: "C".repeat(60),
        notes: "n".repeat(1000),
      });

      await insertVolunteer(scratch.admin, {
        rollNumber: "8800210",
        name: "x".repeat(100),
        batchYear: 2100,
        phone: "9999999999",
      });

      const [check] = await scratch.admin<{ count: number }[]>`
        select count(*)::int as count from volunteers
        where roll_number in ('880000', '8800210')
      `;
      expect(check?.count).toBe(2);
    });
  });

  describe("primary keys, unique keys and foreign keys", () => {
    it("rejects a duplicate volunteer roll number", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800300" });

      await expectPgError(
        insertVolunteer(scratch.admin, { rollNumber: "8800300" }),
        { code: "23505", constraint: "volunteers_pkey" },
      );
    });

    it("rejects a duplicate project id", async () => {
      await scratch.admin`insert into projects (id, slug, name, sdgs)
        values (10, 'test-project', 'Test Project', array[1]::smallint[])`;

      await expectPgError(
        scratch.admin`insert into projects (id, slug, name, sdgs)
          values (10, 'other-slug', 'Other Name', array[1]::smallint[])`,
        { code: "23505", constraint: "projects_pkey" },
      );
    });

    it("rejects a duplicate project slug", async () => {
      await scratch.admin`insert into projects (id, slug, name, sdgs)
        values (10, 'test-project', 'Test Project', array[1]::smallint[])`;

      await expectPgError(
        scratch.admin`insert into projects (id, slug, name, sdgs)
          values (11, 'test-project', 'Another Project', array[1]::smallint[])`,
        { code: "23505", constraint: "projects_slug_unique" },
      );
    });

    it("rejects a duplicate project name", async () => {
      await scratch.admin`insert into projects (id, slug, name, sdgs)
        values (10, 'test-project', 'Test Project', array[1]::smallint[])`;

      await expectPgError(
        scratch.admin`insert into projects (id, slug, name, sdgs)
          values (11, 'another-project', 'Test Project', array[1]::smallint[])`,
        { code: "23505", constraint: "projects_name_unique" },
      );
    });

    it("rejects a duplicate volunteer/domain pair", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: TEST_ROLL });
      await scratch.admin`insert into volunteer_domains (roll_number, domain)
        values (${TEST_ROLL}, 'PHOTOGRAPHY')`;

      await expectPgError(
        scratch.admin`insert into volunteer_domains (roll_number, domain)
          values (${TEST_ROLL}, 'PHOTOGRAPHY')`,
        { code: "23505", constraint: "volunteer_domains_pkey" },
      );
    });

    it("rejects a volunteer pointing at a missing project", async () => {
      await expectPgError(
        insertVolunteer(scratch.admin, {
          rollNumber: "8800400",
          projectId: 999,
        }),
        {
          code: "23503",
          constraint: "volunteers_project_id_projects_id_fk",
        },
      );
    });

    it("restricts deleting a project that still has volunteers", async () => {
      await scratch.admin`insert into projects (id, slug, name, sdgs)
        values (10, 'test-project', 'Test Project', array[1]::smallint[])`;
      await insertVolunteer(scratch.admin, {
        rollNumber: "8800401",
        projectId: 10,
      });

      await expectPgError(
        scratch.admin`delete from projects where id = 10`,
        {
          code: "23503",
          constraint: "volunteers_project_id_projects_id_fk",
        },
      );
    });

    it("restricts deleting a volunteer that still has domain rows", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800402" });
      await scratch.admin`insert into volunteer_domains (roll_number, domain)
        values (${"8800402"}, 'CONTENT_WRITING')`;

      await expectPgError(
        scratch.admin`delete from volunteers where roll_number = '8800402'`,
        {
          code: "23503",
          constraint: "volunteer_domains_roll_number_volunteers_roll_number_fk",
        },
      );
    });

    it("rejects a domain row for a missing volunteer", async () => {
      await expectPgError(
        scratch.admin`insert into volunteer_domains (roll_number, domain)
          values ('8899999', 'PHOTOGRAPHY')`,
        {
          code: "23503",
          constraint: "volunteer_domains_roll_number_volunteers_roll_number_fk",
        },
      );
    });

    it("rejects a missing notes editor", async () => {
      await expectPgError(
        insertVolunteer(scratch.admin, {
          rollNumber: "8800403",
          notesUpdatedBy: "8888888",
        }),
        {
          code: "23503",
          constraint: "volunteers_notes_updated_by_volunteers_roll_number_fk",
        },
      );
    });

    it("restricts deleting a volunteer who edited someone's notes", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800404" });
      await insertVolunteer(scratch.admin, {
        rollNumber: "8800405",
        notesUpdatedBy: "8800404",
      });

      await expectPgError(
        scratch.admin`delete from volunteers where roll_number = '8800404'`,
        {
          code: "23503",
          constraint: "volunteers_notes_updated_by_volunteers_roll_number_fk",
        },
      );
    });

    it("allows the documented cleanup order (domains, then the volunteer)", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800406" });
      await scratch.admin`insert into volunteer_domains (roll_number, domain)
        values (${"8800406"}, 'GRAPHIC_DESIGNING')`;

      await deleteVolunteer(scratch.admin, "8800406");

      const [check] = await scratch.admin<{ count: number }[]>`
        select count(*)::int as count from volunteers where roll_number = '8800406'
      `;
      expect(check?.count).toBe(0);
    });
  });

  describe("project and office-assignment integrity", () => {
    it("seeds exactly the nine fixed projects and every project reference resolves", async () => {
      const { client, db } = createDatabase(scratch.adminUrl);
      try {
        await seedProjectReferenceData(db);
      } finally {
        await client.end({ timeout: 5 });
      }

      const projects = await scratch.admin<
        { id: number; name: string; slug: string }[]
      >`
        select id, name, slug from projects where id between 1 and 9 order by id
      `;
      expect(projects.map((row) => row.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

      for (const projectId of [1, 5, 9]) {
        await insertVolunteer(scratch.admin, {
          rollNumber: `88005${projectId}0`,
          projectId,
        });
      }

      const [orphans] = await scratch.admin<{ count: number }[]>`
        select count(*)::int as count
        from volunteers v
        left join projects p on p.id = v.project_id
        where v.project_id is not null and p.id is null
      `;
      expect(orphans?.count).toBe(0);
    });

    it("accepts each valid office post shape", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800700" });
      await insertVolunteer(scratch.admin, { rollNumber: "8800701" });

      const rows = [
        await insertAssignment(scratch.admin, {
          rollNumber: "8800700",
          role: "COORDINATOR",
        }),
        await insertAssignment(scratch.admin, {
          rollNumber: "8800701",
          role: "TECH_TEAM",
          techKind: "MENTOR",
        }),
      ];

      expect(rows.map((row) => row.role)).toEqual(["COORDINATOR", "TECH_TEAM"]);

      const assignment = await insertAssignment(scratch.admin, {
        rollNumber: "8800701",
        role: "PROJECT_REPRESENTATIVE",
        projectId: 1,
        prSlot: 2,
      });
      expect(assignment.project_id).toBe(1);

      const builder = await insertAssignment(scratch.admin, {
        rollNumber: "8800701",
        role: "BUILDER",
        builderKind: "DOMAIN_LEAD",
        domain: "PHOTOGRAPHY",
      });
      expect(builder.builder_kind).toBe("DOMAIN_LEAD");
    });

    it("rejects a COORDINATOR row that carries another role's fields", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800702" });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800702",
          role: "COORDINATOR",
          projectId: 1,
        }),
        { code: "23514", constraint: "oa_shape" },
      );
    });

    it("requires a tech kind for a TECH_TEAM row", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800703" });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800703",
          role: "TECH_TEAM",
        }),
        { code: "23514", constraint: "oa_shape" },
      );
    });

    it("requires a project and slot for a PROJECT_REPRESENTATIVE row", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800704" });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800704",
          role: "PROJECT_REPRESENTATIVE",
          projectId: 1,
        }),
        { code: "23514", constraint: "oa_shape" },
      );
    });

    it("requires a domain only for a DOMAIN_LEAD builder", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800705" });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800705",
          role: "BUILDER",
          builderKind: "DOMAIN_LEAD",
        }),
        { code: "23514", constraint: "oa_shape" },
      );

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800705",
          role: "BUILDER",
          builderKind: "GENERAL",
          domain: "PHOTOGRAPHY",
        }),
        { code: "23514", constraint: "oa_shape" },
      );
    });

    it("rejects a PR slot outside 1-2 and an overlong end reason", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800706" });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800706",
          role: "PROJECT_REPRESENTATIVE",
          projectId: 1,
          prSlot: 3,
        }),
        { code: "23514", constraint: "office_assignments_pr_slot_check" },
      );

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800706",
          role: "COORDINATOR",
          endReason: "r".repeat(301),
        }),
        { code: "23514", constraint: "office_assignments_end_reason_check" },
      );
    });

    it("allows only one active post per person per role", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800707" });
      await insertAssignment(scratch.admin, {
        rollNumber: "8800707",
        role: "COORDINATOR",
      });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800707",
          role: "COORDINATOR",
        }),
        { code: "23505", constraint: "oa_active_role_uq" },
      );
    });

    it("frees the post when the previous row is ended", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800708" });
      const first = await insertAssignment(scratch.admin, {
        rollNumber: "8800708",
        role: "COORDINATOR",
      });

      await scratch.admin`update office_assignments
        set ends_at = now(), ended_by = roll_number, end_reason = 'role rotation'
        where id = ${Number(first.id)}`;

      const second = await insertAssignment(scratch.admin, {
        rollNumber: "8800708",
        role: "COORDINATOR",
      });

      expect(second.id).not.toBe(first.id);
    });

    it("enforces two active PR slots per project", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: "8800709" });
      await insertVolunteer(scratch.admin, { rollNumber: "8800710" });

      await insertAssignment(scratch.admin, {
        rollNumber: "8800709",
        role: "PROJECT_REPRESENTATIVE",
        projectId: 1,
        prSlot: 1,
      });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800710",
          role: "PROJECT_REPRESENTATIVE",
          projectId: 1,
          prSlot: 1,
        }),
        { code: "23505", constraint: "oa_pr_slot_uq" },
      );
    });

    it("restricts assignments for missing volunteers and projects", async () => {
      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8899999",
          role: "COORDINATOR",
          grantedBy: "8899999",
        }),
        {
          code: "23503",
          constraint: "office_assignments_roll_number_volunteers_roll_number_fk",
        },
      );

      await insertVolunteer(scratch.admin, { rollNumber: "8800711" });

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800711",
          role: "PROJECT_REPRESENTATIVE",
          projectId: 999,
          prSlot: 1,
        }),
        {
          code: "23503",
          constraint: "office_assignments_project_id_projects_id_fk",
        },
      );

      await expectPgError(
        insertAssignment(scratch.admin, {
          rollNumber: "8800711",
          role: "COORDINATOR",
          grantedBy: "8888888",
        }),
        {
          code: "23503",
          constraint: "office_assignments_granted_by_volunteers_roll_number_fk",
        },
      );
    });
  });

  describe("counter columns", () => {
    it("stores numeric(7,1) hours with one decimal and rejects overflow", async () => {
      await insertVolunteer(scratch.admin, { rollNumber: TEST_ROLL });

      const [rounded] = await scratch.admin<{ allocated_hours: string }[]>`
        update volunteers set allocated_hours = 12.34
        where roll_number = ${TEST_ROLL}
        returning allocated_hours
      `;
      expect(Number(rounded?.allocated_hours)).toBe(12.3);

      await expectPgError(
        scratch.admin`update volunteers set allocated_hours = 1000000
          where roll_number = ${TEST_ROLL}`,
        { code: "22003" },
      );
    });

    it.todo(
      "counter invariants (events_attended, fcfs deltas, meetings, red flags) — requires the SRS 11.10 finalise/correct/rebuild functions",
    );
  });
});
