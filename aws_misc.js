/*
 * aws_misc : a small set of aws routines that I needed
 */

var awsdk = require('aws-sdk')


module.exports = function() {

	var self = this

	self.conf = {
		ec2 : {},
		s3 : {},
	}

	self.getTag = function(name, tags) {
	    for(var v in tags) {
		var tag = tags[v];
		if(tag.Key == name) {
		    return tag;
		}
	    }
	    return null;
	}


	self.dump = function(data) {
	    console.log(JSON.stringify(data,null,4));
	}


	self.init = function() {

	    awsdk.config.loadFromPath(__dirname + '/' + 'creds.json')
	    this.conf.ec2 = new awsdk.EC2()
	}


	self.list_instances = function(blob) {
	    self.conf.ec2.describeInstances({}, function(err, data) {

		if(err) {
			dump(err)
			return
		}
		if(typeof(blob.fill) == 'object') {
			for(var v in blob.fill) {
				var type = blob.fill[v];
				data = self.i.fill[type](data);
			}
		}
		if(typeof(blob.filters) == 'object') {
			for(var v in blob.filters) {
				var type = blob.filters[v];
				data = self.i.filters[type](data);
			}
		}
		if(typeof(blob.cb) == 'function') {
			blob.cb(err, data)
		}
	    })
	}



/*
 * Blobs have:
 *  cb	: function callback
 *  data: data
 *  err	: errors
 */

	self.list_instances_filter_dns = function(data) {
	    return data;
	}



	self.list_instances_fill_dns = function(data) {
		var o = {};
		var r = data.Reservations;
		for(var v in r) {
		    var ri = r[v]
		    var instance = {
			body    : ri.Instances[0],
			tags    : ri.Instances[0].Tags,
		    }
		    if(instance.body.PrivateDnsName == null) { continue; }
		    var tag = self.getTag('Name', instance.tags)
		    if(tag != null) { tag = tag.Value }
			o[tag] = {
				tag	: tag,
				instanceId : instance.body.InstanceId,
				pub	: instance.body.PublicDnsName,
				prv	: instance.body.PrivateDnsName,
				prvIP : instance.body.PrivateIpAddress,
				pubIP : instance.body.PublicIpAddress,
				self: r[v], /* Need this for ssh-control */
			}
			r[v]['dns'] = o[tag] /* Another back reference for ssh-control */
       	}
		data.dns = o;
		return data
}


	self.sync_aws = function(cbx) {

	/*
	 * sync_aws - Contacts aws every time it's run. This is needed for when we auto-scale in the future.
	 */
	    self.list_instances({
		cb : function(err, data) {
		    data.config = {}
		    data.ip = {}
		    data.instance = {}
		    for(var v in data.dns) {
		    /*
		     * This may seem like overkill, and it probably is, but we just need quick hash references to a bunch of data depending on the request
		     */
			data.config[data.dns[v].tag] = { data: data.dns[v].self }
			data.ip[data.dns[v].prvIP] = { data : data.dns[v].self }
			data.instance[data.dns[v].instanceId] = { data : data.dns[v].self }
		    }

		    /* Run the callback */
		    cbx(err,data)
		    },
		fill : [ 'dns' ]
	    })
	}


	self.getAwsByIP = function(ip,cbx) {

	    self.sync_aws(function(err,data) {

		var el = data.ip[ip]
		if(el == undefined ) {
		    /* If we don't know who this is, send them their ip */
		    console.log("WHOAMI: Unknown ec2 instance IP: "+ip)
		    return cbx(true,null)
		}
		else {
		    console.log("WHOAMI: "+ip+" belongs to: "+el.data.dns.tag)
		    return cbx(false,el)
		}
	    })
	}



	self.getTagByIP = function(ip,cb) {
	    self.getAwsByIP(ip,function(err,data) {

		var ret = ""
		if(err == true) {
		    ret = ip
		} else {
		    ret = data.data.dns.tag
		}
		return cb(err,ret)
	    })
	}


	self.setTag = function(instance_id, tag, value) {
	    self.conf.ec2.createTags({
		Resources : [
			instance_id,
		],
		Tags :[
			{ Key:  tag,  Value : value  }
		]
	    }, function(err,data) {
		console.log(err,data)
	    })
	}



	self.i = {
	list	: self.list_instances,
	filters	: {
		dns	: self.list_instances_filter_dns,
	},
	fill	: {
		dns	: self.list_instances_fill_dns,
	},
	}


	self.init()
}
