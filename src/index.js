#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const package = require("../package.json");
const clc = require("cli-color");

program
  .version(package.version)
  .option("-d, --directory [dir]", "Please specify a directory to generate catalog tree", process.cwd())
  .option("-c, --color", "Terminal coloring")
  .option("-i, --ignore [ignore]", "You can ignore specific directory name")
  .option("-e, --export [exportPath]", "export into a file")
  .parse(process.argv);

let colorArray = [];
if (program.color) colorArray = [15, 80, 158, 81, 221, 140, 212, 179, 177, 191, 195];
const actions = {
  border: "│",
  contain: "├──",
  last: "└──"
};
let outputString = ""; //记录输出的目录树
let directories = 0,
  files = 0; //记录文件数和目录数

//如果忽略路径被指定
if (program.ignore) {
  if (Object.prototype.toString.call(program.ignore) !== "[object Boolean]") {
    program.ignore = program.ignore.replace(/\s*|\s*/g, "");
  } else {
    throw new Error('Please input parameters to be ignored ==> Example：tree -i "node_module|.git"');
  }
}

//将是对象的放到数组后面
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
  let stat = fs.lstatSync(program.directory);
  let contentJson = {};
  if (stat.isDirectory()) {
    directories++;
    let dir = fs.readdirSync(path);
    if (program.ignore) {
      dir = dir.filter((val, index, array) => {
        return !new RegExp(`${program.ignore}`, "g").test(val);
      });
    }
    dir = dir.map(child => {
      let childStat = fs.lstatSync(path + "/" + child);
      if (childStat.isDirectory()) {
        return jsonTree(path + "/" + child);
      } else {
        files++;
        return child;
      }
    });
    // 获取目录名
    let dirName = path.replace(/.*(?=\/)\//g, "");
    contentJson[dirName] = sortDir(dir);
  } else {
    //获取文件名
    files++;
    let fileName = path.replace(/.*(?=\/)\//g, "");
    return fileName;
  }
  return contentJson;
};

const result = jsonTree(program.directory);

// console.log(result)
let {
  border,
  contain,
  last
} = actions;

const printTree = (data, placeholder) => {
  // console.log(Object.keys(data))
  for (let i of Object.keys(data)) {
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

//将第一行的换行符去掉
outputString = outputString.replace(/^\n/g, "");

//如果颜色指令被指定
if (program.color) {
  let msg = clc.xterm(colorArray[Math.floor(Math.random() * 11)]);
  console.log(msg(outputString));
  console.log(msg(`\n${directories} directories, ${files} files.`));
} else {
  console.log(outputString);
  console.log(`\n${directories} directories, ${files} files.`)
}

//如果导出路径被指定
if (program.export) {
  if (Object.prototype.toString.call(program.export) !== "[object Boolean]") {
    fs.writeFile(program.export, `${outputString}\n\n${directories} directories, ${files} files.`, err => {
      if (err) throw err;
      console.log("\n\n" + "The result has been saved into " + program.export);
    });
  } else {
    throw new Error("Please input parameters to be exported ==> Example：tree -e data.txt");
  }
}