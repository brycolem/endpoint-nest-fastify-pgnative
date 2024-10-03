import { Note } from './note';

export class Application {
    id?: string;
    employer: string;
    title: string;
    companyId: number;
    link: string;
    notes?: Note[];
}
