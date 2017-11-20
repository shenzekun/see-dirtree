#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const package = require("../package.json");
const clc = require("cli-color");

program
  .version(package.version)
  .option(
    "-d, --directory [dir]",
    "Please specify a directory to generate structure tree",
    process.cwd()
  )
  .option("-c, --color", "Terminal coloring")
  .option("-i, --ignore [ig]", "You can ignore specific directory name")
  .option("-e, --export [epath]", "export into file")
  .parse(process.argv);

let colorArray = [];
if (program.color) colorArray = [15, 80, 158, 81, 221, 140, 212];
let actions = {
  border: "│",
  contain: "├──",
  last: "└──"
};
let outputString = "";

// if (program.ignore) {
//     program.ignore = program.ignore.replace(/^\s*|\s*$/g, '');

// }

let stat = fs.statSync(program.directory);

const sortDir = arr => {
  let len = arr.length - 1;
  for (let i = len; i >= 0; i--) {
    if (typeof arr[i] === "object") {
      let obj = arr.splice(i, 1);
      // console.log(obj)
      arr.push(obj[0]);
    }
  }
  return arr;
};

const jsonTree = path => {
  const stat = fs.statSync(program.directory);
  let contentJson = {};
  if (stat.isDirectory()) {
    let dir = fs.readdirSync(path);
    if (program.ignore) {
      dir = dir.filter((val, index, array) => {
        return !/node_modules|.git/.test(val);
      });
    }
    dir = dir.map(child => {
      let childStat = fs.lstatSync(path + "/" + child);
      return childStat.isDirectory() ? jsonTree(path + "/" + child) : child;
    });
    // 获取文件名
    let dirName = path.replace(/.*\/(?!$)/g, "");
    contentJson[dirName] = sortDir(dir);
  } else {
    let fileName = path.replace(/.*\/(?!$)/g, "");
    return fileName;
  }
  return contentJson;
};

let result = jsonTree(program.directory);


// console.log(result)
let { border, contain, last } = actions;
const printTree = (data, placeholder) => {
  for (let i in data) {
    if (typeof data[i] === "string") {
      outputString += "\n" + placeholder + data[i];
    } else if (Array.isArray(data[i])) {
      outputString += "\n" + placeholder + i;
      placeholder = placeholder.replace(new RegExp(`${contain}`, "g"), border);
      placeholder += "  " + contain;
      
      placeholder = placeholder.replace(/^ +/g, "");
      data[i].forEach((value, key, array) => {
        let pl = placeholder;
        if (key === array.length - 1) {
          pl = placeholder.replace(new RegExp(`${contain}$`, "g"), last);
        }
        if (typeof value === "string") {
          outputString += "\n" + pl + value;
        } else {
          printTree(value, placeholder);
        }
      });
    }
  }
};

printTree(result, "");
if (program.color) {
  let msg = clc.xterm(colorArray[Math.floor(Math.random() * 7)]);
  console.log(msg(outputString));
} else {
  console.log(outputString);
}

//console.log(outputString)
//  let ignoreRegex = null

// if (program.ignore) {

//     //trim program.ignore
//     program.ignore = program.ignore.replace(/^\s*|\s*$/g, '')

//     if (/^\/.+\/$/.test(program.ignore)) {
//         program.ignore = program.ignore.replace(/(^\/)|(\/$)/g, '')
//         ignoreRegex = new RegExp(program.ignore, "")
//     } else {
//         //escape special character
//         program.ignore = program.ignore.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
//         ignoreRegex = new RegExp("^" + program.ignore + "$", "")
//     }

// }
//outputString = outputString.replace(/^\n/, '')


// //if export path is specified
if (program.export) {
  fs.writeFile(program.export, outputString, err => {
    if (err) throw err;
    console.log("\n\n" + "The result has been saved into " + program.export);
  });
}
