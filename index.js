const glob = require('glob');
const fs = require('fs');

const filePattern = process.argv[2];
const contentRegexp = new RegExp(process.argv[3], 'i');

glob(filePattern, {}, (error, files) => {
  console.log('Found ' + files.length + ' files which matched file pattern');
  Promise.all(files.map(file => {
    return readFile(file)
      .then(content => filterContent(content))
      .then(content => numberOfLines(content))
      .catch(error => Promise.resolve(0));
  })).then(function(lineCounts) {
    const withPositiveCount = lineCounts.filter(count => count !== 0).length;
    console.log(
      'Found ' + withPositiveCount + ' files which matched content pattern'
    );
    let totalCount = 0;
    for (var count of lineCounts) {
      totalCount += count;
    }
    return totalCount;
  }).then(totalCount => console.log('Total number of lines ' + totalCount))
});

function numberOfLines(string) {
  return new Promise(function(resolve, reject) {
    let count = 0;
    for (let i = 0; i < string.length; i++) {
      if (string.charAt(i) === '\n') {
        count++;
      }
    }
    resolve(count);
  });
}

function filterContent(content) {
  return new Promise(function(resolve, reject) {
    if (contentRegexp.test(content)) {
      resolve(content);
    } else {
      reject();
    }
  });
}

function readFile(filepath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filepath, 'utf8', function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
}
