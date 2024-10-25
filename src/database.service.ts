import { Injectable } from '@nestjs/common';
import * as pgNative from 'pg-native';

@Injectable()
export class DatabaseService {
    private client: any;
    private queue: Promise<any>;

    constructor() {
        const user = process.env.DB_USER;
        const password = process.env.DB_PWD;
        const host = process.env.DB_HOST || 'localhost';
        const database = process.env.DATABASE;
        const port = process.env.DB_PORT || '5432';

        const connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;

        this.client = new pgNative();
        this.client.connectSync(connectionString);
        this.queue = Promise.resolve();
    }

    async query<T>(sql: string, params?: any[]): Promise<T> {
        this.queue = this.queue.then(() =>
            new Promise<T>((resolve, reject) => {
                this.client.query(sql, params, (err: any, res: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            })
        );
        return this.queue;
    }

    async disconnect() {
        await this.queue;
        this.client.end();
    }
}
