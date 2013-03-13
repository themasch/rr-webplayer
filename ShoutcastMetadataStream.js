var Transform = require('stream').Transform

function ShoutcastMetadataStream(options)
{
    if(!(this instanceof ShoutcastMetadataStream)) {
        return new ShoutcastMetadataStream(options)
    }
    Transform.call(this, options)
    this.metaint = options.metaint;
    this.count   = 0;
}

ShoutcastMetadataStream.prototype = Object.create(
    Transform.prototype, {
        constructor: {
            value: ShoutcastMetadataStream
        }
    }
)
var first = true;
ShoutcastMetadataStream.prototype._transform = function(chunk, push, done)
{
    if(this.count + chunk.length >= this.metaint) {
        var skip = this.metaint-this.count;
        if((chunk[skip]*16) > 0 ) {
            var split = chunk.slice(skip+1, skip+(chunk[skip]*16)+1);
            this.emit('metadata', split.toString());
        }
        if(skip+(chunk[skip]*16)+1)] >= chunk.length) {
            push(chunk);
            this.count = chunk.length
        } else {
            var neuchunk = Buffer.concat([chunk.slice(0, skip), chunk.slice(skip+(chunk[skip]*16)+1)]);
            push(neuchunk)
        }
        this.count = chunk.length - (skip+1+(chunk[skip]*16));
    }
    else {
        push(chunk)
        this.count += chunk.length;
    }
    done()
}

ShoutcastMetadataStream.prototype.destroy = function()
{
}

module.exports = ShoutcastMetadataStream
