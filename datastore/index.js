const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
      if (err) {
        console.error(err);
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  const ids = [];
  readdir(exports.dataDir)
    .then((fileNames) => {
      return Promise.all(fileNames.map((fileName) => {
        ids.push(fileName.slice(0, fileName.length - 4));
        return readFile(`${exports.dataDir}/${fileName}`);
      }));
    })
    .then((todos) => {
      callback(null, todos.map((todo, index) => {
        return {
          id: ids[index],
          text: todo.toString()
        };
      }));
    })
    .catch((err) => console.error(err));
};
// exports.readAll = (callback) => {
//   fs.readdir(exports.dataDir, (err, files) => {
//     if (err) {
//       console.error(err);
//     } else {
//       callback(null, _.map(files, (id) => {
//         id = id.slice(0, id.length - 4);
//         return { id, text: id };
//       }));
//     }
//   });
// };

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      text = text.toString();
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
