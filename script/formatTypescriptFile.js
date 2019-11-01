const through = require('through2');
const fs = require('fs');


// 只匹配指定目录下的ts文件
// 目前是pages 和component两个目录
const getDirNamePath = (str) => {
  const reg = /^(\/(\w|\W)+)+(\.ts)$/g;
  if (!reg.test(str)) return '';
  const temp = str.split('/');
  const targetDirReg = /(pages|components)/;
  temp.pop();
  const targetStr = temp.join('/');
  return targetDirReg.test(targetStr) ? targetStr : ''
};

const getClassName = (str) => {
  let classname = '';
  if (!str) return classname;
  const reg = /class\s+(\w+)\s+/;
  classname = str.match(reg);
  return classname && classname.length > 0 ? classname[1] : '';
}

const getJsonContent = (path) => {
  return fs.readFileSync(path)
};

// 移除 ts 文件的 exports default 这个关键词
const removeExportStatement = (str) => {
  return str.replace(/export\s+default\s+/, '');
};

const formatTypescriptFile = () => through.obj(function (chunk, encode, callback) {
  let codeString = chunk.contents.toString();
  const filePath = chunk.path;
  const isTsFile = /\w+[^.](\.ts)$/.test(filePath);
  const tsDir = getDirNamePath(filePath);
  const existJsonFile = fs.existsSync(`${tsDir}/index.json`);
  const className = getClassName(codeString);
  if (isTsFile && existJsonFile && className) {
    const jsonContent = getJsonContent(`${tsDir}/index.json`);
    const isComponent = /\"component\"\:\strue/.test(jsonContent.toString());
    const appendStr = isComponent ? `Component(new ${className}());` : `Page(new ${className}());`;
    codeString = removeExportStatement(codeString);
    codeString += appendStr;
  }
  chunk.contents = Buffer.from(codeString);
  this.push(chunk);
  callback();
});

module.exports = formatTypescriptFile