import fs from 'fs-extra';
import path from 'path';
import { Worker } from '@scola/worker';

export class FileWriter extends Worker {
  act(box, data, callback) {
    data = this.filter(box, data);

    fs.ensureDirSync(path.dirname(data.write));

    const reader = fs.createReadStream(data.read);

    reader.once('error', (error) => {
      this.removeListeners(reader);
      this.fail(box, error, callback);
    });

    reader.once('open', () => {
      this.handleOpen(box, data, callback, reader);
    });
  }

  handleOpen(box, data, callback, reader) {
    const writer = fs.createWriteStream(data.write);

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
