import { Application } from './application';

export class Note {
    id?: string;
    applicationId: string;
    noteText: string;
    application: Application;
}
