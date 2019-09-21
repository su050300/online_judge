var express=require('express');
var app=express();
// // var async = require('asyncawait/async'); 
// // var await = require('asyncawait/await');
// const { spawn } = require('child_process');

// var a = spawn('./a.out',{stdio: ['pipe', 'pipe', process.stderr]});

// console.log(a);

// a.stdin.write("5", 'utf8');
// var result=a.stdout.read();
// console.log(result);



const cmd=require('node-cmd');
 
const processRef=cmd.get('python -i');
let data_line = '';
 
//listen to the python terminal output
processRef.stdout.on(
  'data',
  function(data) {
    console.log("cc");
    data_line += data;
    if (data_line[data_line.length-1] == '\n') {
      console.log(data_line);
    }
  }
);
 
const pythonTerminalInput=`primes = [2, 3, 5, 7]
for prime in primes:
    print(prime)
 
`;
 
//show what we are doing
console.log(`>>>${pythonTerminalInput}`);
 
//send it to the open python terminal
processRef.stdin.write(pythonTerminalInput);
 
app.listen(3000,function(){

});