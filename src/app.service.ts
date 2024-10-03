import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Application } from './model/application';

@Injectable()
export class AppService {
  constructor(private readonly db: DatabaseService) { }

  async getAllApplications(): Promise<Application[]> {
    const query = `
      SELECT
        applications.id,
        applications.employer,
        applications.title,
        applications.link,
        applications.company_id AS "companyId",
        COALESCE(
          json_agg(
            json_build_object(
              'id', notes.id,
              'noteText', notes.note_text,
              'applicationId', notes.application_id
            )
          ) FILTER (WHERE notes.id IS NOT NULL),
          '[]'
        ) AS notes
      FROM applications
      LEFT JOIN notes ON applications.id = notes.application_id
      GROUP BY applications.id;
    `;
    const applications = await this.db.query<Application[]>(query);
    return applications;
  }

  async createApplication(applicationDto: Partial<Application>): Promise<Application> {
    const { employer, title, companyId, link } = applicationDto;
    const query = `
      INSERT INTO applications (employer, title, company_id, link)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const params = [employer, title, companyId, link];
    const result = await this.db.query(query, params);
    return result[0];
  }

  async getApplicationById(id: string): Promise<Application> {
    const query = 'SELECT * FROM applications WHERE id = $1';
    const result = await this.db.query<Application[]>(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return result[0];
  }

  async updateApplication(id: string, applicationDto: Partial<Application>): Promise<Application> {
    const existingApplication = await this.getApplicationById(id);
    if (!existingApplication) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    const { employer, title, companyId, link } = applicationDto;
    const query = `
      UPDATE applications
      SET employer = $1, title = $2, company_id = $3, link = $4
      WHERE id = $5
      RETURNING *`;
    const params = [employer, title, companyId, link, id];
    const result = await this.db.query(query, params);

    return result[0];
  }

  async updatePartialApplication(id: string, partialApplicationDto: Partial<Application>): Promise<Application> {
    const existingApplication = await this.getApplicationById(id);
    if (!existingApplication) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    const fields = Object.keys(partialApplicationDto);
    const values = Object.values(partialApplicationDto);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE applications SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await this.db.query(query, [...values, id]);

    return result[0];
  }

  async deleteApplication(id: string): Promise<{ message: string; }> {
    const query = 'DELETE FROM applications WHERE id = $1 RETURNING id';
    const result = await this.db.query<Application[]>(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    return { message: `Application ${id} deleted` };
  }
}
