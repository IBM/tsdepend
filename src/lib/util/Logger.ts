export interface LogAdapter {
  log(...msg: any[]): void;
  debug(...msg: any[]): void;
}

export class ConsoleLogAdapter implements LogAdapter {
  constructor(private verbose: boolean = false) {}

  public debug(...msg: any[]) {
    this.verbose && console.log(...msg);
  }

  public log(...msg: any[]) {
    console.log(...msg);
  }
}

export class Logger {
  private static instance: Logger;

  public static log(...msg: any[]) {
    if (this.instance === undefined) {
      Logger.configureLogger(new ConsoleLogAdapter());
    }

    this.instance.log(...msg);
  }

  public static debug(...msg: any[]) {
    if (this.instance === undefined) {
      Logger.configureLogger(new ConsoleLogAdapter());
    }

    this.instance.debug(...msg);
  }

  public static getLogger(): Logger {
    if (this.instance === undefined) {
      Logger.configureLogger(new ConsoleLogAdapter());
    }

    return this.instance;
  }

  public static configureLogger(logAdapter: LogAdapter): Logger {
    return (this.instance = new Logger(logAdapter));
  }

  private constructor(private logAdapter: LogAdapter) {}

  public log(...msg: any[]) {
    this.logAdapter.log(...msg);
  }

  public debug(...msg: any[]) {
    this.logAdapter.debug(...msg);
  }
}
