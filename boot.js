/*
 * start an aws server
 */
var usage = function() {
    conole.log("boot usage: node boot.js {start|stop} <instanceIdn ... instanceIdN>");
    process.exit(-1);
}

if(process.argv.length < 3) {
    usage();
}


var deps = {
    aws : require('aws-sdk'),
    awsm : require('./aws_misc.js'),
}

var conf = {
    ec2 : {},
    cmd : "",
    instances : [],
}

awsm = new deps.awsm();

var cb = function(err,dat) {
    if(err) return;
    for(var v in dat.StartingInstances) {
        var inst = dat.StartingInstances[v]
        console.log(inst.CurrentState);
    }
}

conf.cmd = process.argv[2];
process.argv.splice(0,1);
process.argv.splice(0,1);
process.argv.splice(0,1);
for(var v in process.argv) {
    arg = process.argv[v]
    conf.instances.push(arg);
}

switch(conf.cmd) {
    case "start": {
        awsm.boot_start(conf.instances, cb);
        break;
    }
    case 'stop': {
        awsm.boot_stop(conf.instances, cb);
        break;
    }
    default : {
        usage();
        break;
    }
}
