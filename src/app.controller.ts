import { Controller, Get, Post, Put, Patch, Delete, Body, Param, NotFoundException, HttpStatus, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { Application } from './model/application';

@Controller('application')
export class AppController {
  constructor(private readonly applicationService: AppService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllApplications() {
    const applications = await this.applicationService.getAllApplications();
    return applications;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() applicationDto: Application) {
    const application = await this.applicationService.createApplication(applicationDto);
    return application;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getApplication(@Param('id') id: string) {
    const application = await this.applicationService.getApplicationById(id);
    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return application;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateApplication(@Param('id') id: string, @Body() applicationDto: Application) {
    const updatedApplication = await this.applicationService.updateApplication(id, applicationDto);
    if (!updatedApplication) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return updatedApplication;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePartialApplication(@Param('id') id: string, @Body() partialApplicationDto: Partial<Application>) {
    const updatedApplication = await this.applicationService.updatePartialApplication(id, partialApplicationDto);
    if (!updatedApplication) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return updatedApplication;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteApplication(@Param('id') id: string) {
    const result = await this.applicationService.deleteApplication(id);
    if (!result) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return { message: `Application ${id} deleted` };
  }
}

