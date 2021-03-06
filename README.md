# see-dirtree

This is commandLine tool to show catalog tree

## Install

>Input command below in terminal

```
npm install -g see-dirtree
```

## Usage

>This command will show files all

```
tree
```

## Options

```
Usage: tree [options]


  Options:

    -V, --version              output the version number
    -d, --directory [dir]      Please specify a directory to generate catalog tree
    -c, --color                Terminal coloring
    -i, --ignore [ignore]      You can ignore specific directory name
    -e, --export [exportPath]  export into a file
    -h, --help                 output usage information
```



## Example:

* You can export data to a file.Input command below,you can see data.txt in your current path.

```
tree -e data.txt
```

* You can see catalog tree with color(random color,Because the color is bright color, it is **recommended** that the terminal's theme be **dark** )

```
tree -c
```

* You can specify a directory to generate catalog tree

```
tree -d "src"
```

* You can ignore specific directory name

```
tree -i "node_modules|.git"
```
