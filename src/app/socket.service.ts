import { Injectable } from '@angular/core';

import { Avl } from './avl/kv';
import { Throw } from './exceptions';
import { Logger } from 'angular2-logger/core';
import { UuidService } from './uuid.service';
import { TimeService } from './time.service';
import { ConfigurationService } from './configuration.service';

import * as Rx from 'rxjs/Rx';
import * as engineio from 'engine.io-client';

const arrayConstructor = () => [];
const infinity = Number.POSITIVE_INFINITY;

type Status = 'success' | 'failure' | 'push' | 'done';

interface Request<TParameters> {
    uuid: string;
    resource: string; // TODO: Update list of resource names according to usage
    parameters: TParameters;
}

interface Response<TContent> {
    uuid: string;
    status: Status;
    content: TContent;
}

interface RequestRecord {
    expiresOn: number;
    success: (data: any) => void;
    failure: (reason: ConnectionFailureReason) => void;
}

export enum ConnectionFailureReason {
    Unknown              = 0,

    ClientError          = 100,
    ClientDisconnect     = 101,

    ConnectionError      = 200,
    ConnectionTimeout    = 201,

    ServerError          = 300,
    ServerDisconnect     = 301
}

const asc = (a: number, b: number) => a - b;
const dsc = (a: number, b: number) => b - a;

@Injectable()
export class SocketService {
    private timeoutId: any;

    private socket: EngineIOClient.Socket | null;

    private onDisconnectSubject: Rx.Subject<void> = new Rx.Subject<void>();

    private requestHandlersByTime: Avl<number, Set<string>> = new Avl<number, Set<string>>(asc);
    private requestHandlersByUuid: Map<string, RequestRecord> = new Map<string, RequestRecord>();

    private pushSubjectsByUuid: WeakMap<string, Rx.Subject<any>> = new WeakMap<string, Rx.Subject<any>>();

    constructor(
        private logger: Logger,
        private uuidService: UuidService,
        private timeService: TimeService,
        private configurationService: ConfigurationService
    ) {
    }

    private validateConnection() {
        if (this.socket) {
            throw new Error('SocketService already connected');
        }
    }

    public connect(
        token: string,
        expiresOn: number
    ) {
        this.validateConnection();

        let uuid = this.uuidService.generate();
        this.socket = this.setupSocket(engineio({
            transportOptions: {
                polling: { extraHeaders: { 'z-uuid': uuid, 'z-token': token } }
            }
        }));

        this.setupGarbageCollection(this.configurationService.socket.garbageCollection.resolution);

        return new Promise<string>((resolve, reject) => {
            this.registerRequestHandler(expiresOn, uuid, (data: string) => resolve(data), reason => reject(reason));
        });
    }

    public login(
        username: string,
        password: string,
        expiresOn: number = Date.now() + this.configurationService.socket.request.timeout
    ) {
        this.validateConnection();

        let uuid = this.uuidService.generate();

        this.socket = this.setupSocket(engineio({
            transportOptions: {
                polling: { extraHeaders: { 'z-uuid': uuid, 'z-username': username, 'z-password': password } }
            }
        }));

        this.setupGarbageCollection(this.configurationService.socket.garbageCollection.resolution);

        return new Promise<string>((resolve, reject) => {
            // resolve, reject are wrapped into identity closures to preserve callstack reference which simplifies debugging
            this.registerRequestHandler(expiresOn, uuid, (data: string) => resolve(data), reason => reject(reason));
        });
    }

    public request<T, P>(resource: string, parameters: P, expiresOn: number): Promise<T> {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                let uuid = this.uuidService.generate();
                let request: Request<P> = { uuid, resource, parameters };

                this.socket.send(JSON.stringify(request));
                this.registerRequestHandler(expiresOn, uuid, (result: T) => resolve(result), (reason) => reject(reason));
            } else {
                reject('Socket service is not connected to server');
            }
        });
    }

    public connected(): boolean {
        return !!this.socket;
    }

    public on<T>(uuid: string): Rx.Observable<T> {
        let subject = this.pushSubjectsByUuid.get(uuid);

        if (subject === void 0) {
            this.pushSubjectsByUuid.set(uuid, subject = new Rx.Subject());
        }

        return subject.asObservable();
    }

    public onDisconnect(): Rx.Observable<void> {
        return this.onDisconnectSubject.asObservable();
    }

    public disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    private handleDisconnect(reason: ConnectionFailureReason) {
        this.requestHandlersByUuid.forEach((future, uuid) => {
            future.failure(ConnectionFailureReason.ClientDisconnect);

            let slot = this.requestHandlersByTime.get(future.expiresOn);
            if (slot) {
                slot.delete(uuid);

                if (slot.size < 1) {
                    this.requestHandlersByTime.remove(future.expiresOn);
                }
            }
        });
    }

    private registerRequestHandler(
        expiresOn: number,
        uuid: string,
        success: <T>(data: T) => void,
        failure: (reason: ConnectionFailureReason) => void
    ) {
        if (this.requestHandlersByUuid.has(uuid)) {
            Throw(`Request with "${ uuid }" was already registered`);
        } else {
            this.requestHandlersByUuid.set(uuid, { success, failure, expiresOn });

            let requests = this.requestHandlersByTime.get(expiresOn)
                || this.requestHandlersByTime.set(expiresOn, new Set<string>());

            requests.add(uuid);
        }
    }

    private setupGarbageCollection(resolution: number) {
        this.timeService.setInterval(() => {
            let moments: number[] = [];

            this.requestHandlersByTime.iterateForward(-infinity, (requests, moment) => {
                if (moment < Date.now()) {
                    moments.push(moment);

                    requests.forEach(id => {
                        let request = this.requestHandlersByUuid.get(id);

                        if (request) {
                            request.failure(ConnectionFailureReason.ConnectionTimeout);
                        }

                        this.requestHandlersByUuid.delete(id);
                    });
                } else {
                    return true; // breaks iteration
                }

                return void 0; // Continue iteration
            });

            moments.forEach(moment => {
                this.requestHandlersByTime.remove(moment);
            });
        }, resolution);
    }

    private setupSocket(socket: EngineIOClient.Socket) {
        socket.on('open', () => {
            this.logger.debug('SocketService     | Socket connected', socket.id);

            socket.on('message', (responseJson: string) => {
                let response = <Response<any>>JSON.parse(responseJson);

                this.logger.debug('SocketService     | Message received', response.status, response.uuid, response.content);
                this.logger.debug('SocketService     | Locating corresponding handler');

                if (response.status === 'push') {
                    let subject = this.pushSubjectsByUuid.get(response.uuid);

                    if (subject) {
                        this.logger.debug('SocketService     | Found corresponding handler (push type), notifying');
                        subject.next(response.content);
                    } else {
                        this.logger.debug('SocketService     | No appropriate push handler found (push type), ignoring');
                    }
                } else {
                    let requestHandlers = this.requestHandlersByUuid.get(response.uuid);

                    if (requestHandlers) {
                        if (response.status === 'success') {
                            this.logger.debug('SocketService     | Found corresponding handler (response success), notifying...');

                            requestHandlers.success(response.content);

                        } else {
                            this.logger.debug('SocketService     | Found corresponding handler (response failure), notifying...');

                            requestHandlers.failure(<ConnectionFailureReason><any>response.content);
                        }

                        this.logger.debug('SocketService     | Cleaning up uuid request handler ticket');

                        this.requestHandlersByUuid.delete(response.uuid);
                        let time = this.requestHandlersByTime.get(requestHandlers.expiresOn);

                        if (time) {
                            this.logger.debug('SocketService     | Cleaning up request handlers time slot');
                            time.delete(response.uuid);

                            if (time.size < 1) {
                                this.requestHandlersByTime.remove(requestHandlers.expiresOn);
                            }
                        } else {
                            this.logger.debug('SocketService     | No request handler time slots found, ignoring');
                        }
                    } else {
                        this.logger.debug('SocketService     | No request handlers found, the request must have expired');
                    }
                }
            });

            socket.on('close', () => {
                this.socket = null;
                this.logger.debug('SocketService     | Socket disconnected, notifying subscribers');
                this.onDisconnectSubject.next();
            });
        });

        return socket;
    }
}
