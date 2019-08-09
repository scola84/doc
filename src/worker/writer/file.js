import fs from 'fs-extra';
import path from 'path';
import { Worker } from '@scola/worker';

export class FileWriter extends Worker {
  act(box, data, callback) {
    const file = this.filter(box, data);

    fs.ensureDirSync(path.dirname(file.write));

    const reader = fs.createReadStream(file.read);
    const writer = fs.createWriteStream(file.write);

    reader.once('error', (error) => {
      this.removeListeners(reader);
      this.fail(box, error, callback);
    });

    reader.once('open', () => {
      this.handleOpen(box, data, callback, reader, writer);
    });
  }

  handleOpen(box, data, callback, reader, writer) {
    writer.once('error', (error) => {
      this.removeListeners(reader, writer);
      this.fail(box, error, callback);
    });

    writer.once('finish', () => {
      this.removeListeners(reader, writer);
      data = this.merge(box, data);
      this.pass(box, data, callback);
    });

    reader.pipe(writer);
  }

  removeListeners(reader, writer) {
    if (reader) {
      reader.removeAllListeners();
    }

    if (writer) {
      writer.removeAllListeners();
    }
  }
}
