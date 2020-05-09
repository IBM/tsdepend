import { Exception } from "./Exception";

/**
 * FileNotFoundException
 */
export class FileNotFoundException extends Exception {
  constructor(msg: string) {
    super(msg);
  }
}
